import os
from openai import OpenAI
from dotenv import load_dotenv
from .template_prompt import template_prompt  # template_prompt をインポート

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def get_ai_response(prompt):
    try:
        # ユーザーのプロンプトとテンプレートを結合
        formatted_prompt = template_prompt.format(user_prompt=prompt)
        response = client.chat.completions.create(
            model="chatgpt-4o-latest",
            messages=[{"role": "user", "content": formatted_prompt}],
            temperature=0.7,
            stream=False,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error: {e}")
        return "エラーが発生しました。もう一度試してください。"
