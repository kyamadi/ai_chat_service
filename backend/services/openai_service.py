# backend/services/openai_service.py

import os
from openai import OpenAI
from dotenv import load_dotenv
from .template_prompt import template_prompt  # テンプレートプロンプトをインポート

load_dotenv()

# OpenAIクライアントの初期化
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def get_ai_response(project, user_prompt):
    try:
        # システムメッセージとしてテンプレートプロンプトを設定
        system_message = {"role": "system", "content": template_prompt}

        # プロジェクト内の過去のメッセージを取得し、OpenAIのメッセージ形式に変換
        conversation_history = []
        for message in project.messages:
            role = "user" if message.sender == "user" else "assistant"
            conversation_history.append({"role": role, "content": message.content})

        # ユーザーからの新しいメッセージを追加
        conversation_history.append({"role": "user", "content": user_prompt})

        # システムメッセージと会話履歴を結合
        messages = [system_message] + conversation_history

        # OpenAI APIを呼び出してAIの応答を取得
        response = client.chat.completions.create(
            model="chatgpt-4o-latest",
            messages=messages,
            temperature=0.7,
            max_tokens=1000,  # 必要に応じて調整
        )

        # AIの応答を抽出
        ai_response = response.choices[0].message.content.strip()

        return ai_response

    except Exception as e:
        print(f"Error: {e}")
        return "エラーが発生しました。もう一度試してください。"
