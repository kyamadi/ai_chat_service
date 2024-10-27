import os
import logging
from openai import OpenAI as OpenAI_API
from dotenv import load_dotenv
from langchain.chains import LLMChain
from langchain_openai import OpenAI
from langchain.prompts import PromptTemplate
from newspaper import Article
from googleapiclient.discovery import build
from .template_prompt import template_prompt

load_dotenv()

# ログの設定
logging.basicConfig(level=logging.INFO)

# APIキーの取得
openai_api_key = os.getenv("OPENAI_API_KEY")
google_api_key = os.getenv("GOOGLE_API_KEY")
google_cse_id = os.getenv("GOOGLE_CSE_ID")

# OpenAIのLLMクライアント
llm = OpenAI(api_key=openai_api_key)

# プロンプトテンプレート
prompt_template = """
ユーザーの質問: {user_prompt}
この質問に基づいて、信頼性の高い情報を得るための最適な検索クエリを作成してください。検索クエリは具体的かつ簡潔に。
検索クエリには絶対に引用符（""や''）を付けず、各キーワードをスペースで区切って作成すること。
"""

template = PromptTemplate(
    input_variables=["user_prompt"],
    template=prompt_template,
)

# チェーンの作成
query_chain = LLMChain(
    llm=llm,
    prompt=template,
)

def generate_search_query(user_prompt):
    search_query = query_chain.run(user_prompt=user_prompt)
    logging.info(f"生成された検索クエリ: {search_query}")
    return search_query

def perform_search(search_query):
    try:
        # Google Custom Search APIのセットアップ
        service = build("customsearch", "v1", developerKey=google_api_key)
        res = service.cse().list(
            q=search_query,
            cx=google_cse_id,
            num=3,
        ).execute()

        search_results = res.get('items', [])
        logging.info(f"検索結果: {search_results}")
        return search_results

    except Exception as e:
        logging.error(f"検索中にエラーが発生しました: {e}")
        return []

def filter_reliable_sources(search_results):
    # カスタム検索エンジンでドメインを限定しているため、フィルタリングは不要かもしれません
    logging.info(f"フィルタリングされた検索結果: {search_results}")
    return search_results

def fetch_article_content(url):
    try:
        # newspaper3kで記事を取得
        article = Article(url)
        article.download()
        article.parse()

        # 記事の本文の長さを確認
        if len(article.text.strip()) < 200:
            raise Exception("記事の内容が短すぎます。Seleniumを使用します。")
        
        return article.text

    except Exception as e:
        logging.warning(f"newspaper3kでの記事取得に失敗しました ({url}): {e}")
        logging.info("Seleniumを使用して記事を取得します。")

        # Seleniumで記事を取得
        try:
            from selenium import webdriver
            from selenium.webdriver.chrome.options import Options
            from selenium.webdriver.common.by import By
            from selenium.webdriver.support.ui import WebDriverWait
            from selenium.webdriver.support import expected_conditions as EC

            # ヘッドレスモードの設定
            chrome_options = Options()
            chrome_options.add_argument("--headless")
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")

            # WebDriverのパスを指定（必要に応じて変更）
            driver = webdriver.Chrome(options=chrome_options)

            driver.get(url)

            # ページの読み込みを待機（必要に応じて調整）
            WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, 'body')))

            # ページのHTMLを取得
            html = driver.page_source

            driver.quit()

            # newspaper3kでHTMLから記事を解析
            article = Article(url)
            article.set_html(html)
            article.parse()

            return article.text

        except Exception as se:
            logging.error(f"Seleniumでの記事取得に失敗しました ({url}): {se}")
            return ""

def get_ai_response_with_search(project, user_prompt):
    try:
        system_message = {"role": "system", "content": template_prompt}

        conversation_history = []
        for message in project.messages:
            role = "user" if message.sender == "user" else "assistant"
            conversation_history.append({"role": role, "content": message.content})

        # 検索クエリの生成
        search_query = generate_search_query(user_prompt)

        # 検索の実行
        search_results = perform_search(search_query)

        # フィルタリング（必要に応じて）
        filtered_results = filter_reliable_sources(search_results)

        if not filtered_results:
            logging.warning("検索結果が見つかりませんでした。")
            formatted_search_results = "検索結果が見つかりませんでした。"
            articles_content = ""
        else:
            articles_content = []
            for result in filtered_results:
                title = result.get('title', 'No Title')
                link = result.get('link', '')
                content = fetch_article_content(link)
                if content:
                    articles_content.append(f"### {title}\n{content}\nリンク: {link}")
                else:
                    articles_content.append(f"### {title}\nリンク: {link}\n記事内容の取得に失敗しました。")

            formatted_articles_content = "\n\n".join(articles_content)
            formatted_search_results = "\n".join([f"{i+1}. {result['title']}: {result['link']}" for i, result in enumerate(filtered_results)])
            logging.info(f"整形された検索結果:\n{formatted_search_results}")
            logging.info(f"記事内容:\n{formatted_articles_content}")

        # 会話履歴に追加
        if articles_content:
            conversation_history.append({"role": "system", "content": f"最新の検索結果と記事内容:\n{formatted_articles_content}"})
        else:
            conversation_history.append({"role": "system", "content": f"最新の検索結果:\n{formatted_search_results}"})

        conversation_history.append({"role": "user", "content": user_prompt})

        messages = [system_message] + conversation_history

        # OpenAI APIの呼び出し
        response = OpenAI_API(api_key=openai_api_key).chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.7,
            max_tokens=1500,
        )

        ai_response = response.choices[0].message.content.strip()
        return ai_response

    except Exception as e:
        logging.error(f"Error: {e}")
        return "エラーが発生しました。もう一度試してください。"
