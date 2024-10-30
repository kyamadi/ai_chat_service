# backend/routes/chat.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Message, Project, User
from services.openai_service import get_ai_response_with_search as get_ai_response
from datetime import datetime

chat_bp = Blueprint('chat', __name__)

# チャット履歴の取得
@chat_bp.route('/<int:project_id>', methods=['GET'])
@jwt_required()
def get_chat_history(project_id):
    user = get_jwt_identity()
    project = Project.query.filter_by(id=project_id, user_id=user['id']).first()
    
    if not project:
        return jsonify({"message": "プロジェクトが見つかりません"}), 404

    messages = Message.query.filter_by(project_id=project_id).order_by(Message.created_at).all()
    chat_history = [{"sender": message.sender, "content": message.content, "created_at": message.created_at} for message in messages]
    
    return jsonify(chat_history), 200

# ユーザーからのプロンプト送信
@chat_bp.route('/<int:project_id>', methods=['POST'])
@jwt_required()
def send_prompt(project_id):
    user = get_jwt_identity()
    data = request.get_json()
    prompt = data.get('content')

    project = Project.query.filter_by(id=project_id, user_id=user['id']).first()
    
    if not project:
        return jsonify({"message": "プロジェクトが見つかりません"}), 404

    if not prompt:
        return jsonify({"message": "プロンプトを入力してください"}), 400

    # ユーザーのメッセージを保存
    user_message = Message(project_id=project_id, sender='user', content=prompt, created_at=datetime.utcnow())
    db.session.add(user_message)
    db.session.commit()

    # OpenAI APIを呼び出してレスポンスを取得
    ai_response = get_ai_response(project, prompt)

    # AIのメッセージを保存部分はいらないのでコメントアウト。
    # ai_message = Message(project_id=project_id, sender='ai', content=ai_response, created_at=datetime.utcnow())
    # db.session.add(ai_message)
    # db.session.commit()

    return jsonify({"message": "メッセージが送信されました", "ai_response": ai_response}), 201
