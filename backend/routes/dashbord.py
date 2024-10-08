from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Project

projects_bp = Blueprint('projects', __name__)

# プロジェクトの新規作成
@projects_bp.route('/', methods=['POST'])
@jwt_required()
def create_project():
    user = get_jwt_identity()
    data = request.get_json()
    name = data.get('name')

    if not name:
        return jsonify({"message": "プロジェクト名を入力してください"}), 400

    new_project = Project(user_id=user['id'], name=name)
    db.session.add(new_project)
    db.session.commit()

    return jsonify({"message": "プロジェクトが作成されました", "project": {"id": new_project.id, "name": new_project.name}}), 201

# プロジェクト一覧の取得
@projects_bp.route('/', methods=['GET'])
@jwt_required()
def get_projects():
    user = get_jwt_identity()
    projects = Project.query.filter_by(user_id=user['id']).all()
    project_list = [{"id": project.id, "name": project.name} for project in projects]

    return jsonify(project_list), 200
