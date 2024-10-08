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

# プロジェクトの編集
@projects_bp.route('/<int:project_id>', methods=['PUT'])
@jwt_required()
def update_project(project_id):
    user = get_jwt_identity()
    data = request.get_json()
    name = data.get('name')

    project = Project.query.filter_by(id=project_id, user_id=user['id']).first()
    if not project:
        return jsonify({"message": "プロジェクトが見つかりません"}), 404

    if not name:
        return jsonify({"message": "プロジェクト名を入力してください"}), 400

    project.name = name
    db.session.commit()

    return jsonify({"message": "プロジェクトが更新されました", "project": {"id": project.id, "name": project.name}}), 200

# プロジェクトの削除
@projects_bp.route('/<int:project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    user = get_jwt_identity()
    project = Project.query.filter_by(id=project_id, user_id=user['id']).first()

    if not project:
        return jsonify({"message": "プロジェクトが見つかりません"}), 404

    db.session.delete(project)
    db.session.commit()

    return jsonify({"message": "プロジェクトが削除されました"}), 200
