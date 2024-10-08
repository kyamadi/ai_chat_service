from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from config import Config
from models import db

app = Flask(__name__)
app.config.from_object(Config)

# CORSの設定
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# CORS, DB, JWT, Migrateの初期化
db.init_app(app)
jwt = JWTManager(app)
migrate = Migrate(app, db)

with app.app_context():
    db.create_all()

# ルートの登録
from routes.auth import auth_bp
from routes.projects import projects_bp
from routes.chat import chat_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(projects_bp, url_prefix='/api/projects')
app.register_blueprint(chat_bp, url_prefix='/api/chat')

if __name__ == "__main__":
    app.run(debug=True)
