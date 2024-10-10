**システム設計書および要件定義書**

## 1. プロジェクト概要

- **名称**:　AIサービス推奨システム
- **目的**: ユーザーが生成AIサービスを利用してプロジェクトごとのチャットを行い、効率的にプロジェクトを管理することをサポートする。
- ユーザーが送信したプロンプトに基づいて、最適な生成AIサービスを紹介するチャット形式の生成AIサービスを提供する。
- 認証機能を備え、ユーザーは自身のチャット履歴をプロジェクトごとにサイドバーで管理できる。プロジェクトとメッセージは1対多の関係となる。
- サービスの紹介だけでなく、ユーザーが推奨されたサービスに関して質問をすると、AIは各サービスのリファレンスにある正確な情報に基づいて回答する。
- **機能概要**:
  - 認証機能（ユーザー登録、ログイン、ログアウト）
  - プロジェクト管理（プロジェクトの作成、一覧表示、削除）
  - チャット機能（AIとの対話、チャット履歴の表示）
  - サイドバーを用いたナビゲーション
  - OpenAI APIを利用したAIの応答生成

## 2. システム構成図

### フォルダ構成

```
project_root/
|-- backend/
|   |-- services/
|   |   |-- openai_service.py
|   |   |-- template_prompt.py
|   |-- routes/
|   |   |-- auth.py
|   |   |-- projects.py
|   |   |-- chat.py
|   |-- models.py
|   |-- app.py
|   |-- config.py
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |   |-- Auth/
|   |   |   |   |-- Login.js
|   |   |   |   |-- Register.js
|   |   |   |-- Dashboard/
|   |   |   |   |-- Dashboard.js
|   |   |   |-- Chat/
|   |   |   |   |-- Chat.js
|   |   |   |-- Sidebar/
|   |   |   |   |-- Sidebar.js
|   |   |-- services/
|   |   |   |-- api.js
|   |   |-- App.js
|   |-- public/
|-- .env
|-- README.md
```

## 3. 使用技術

- **フロントエンド**: React, Material-UI
- **バックエンド**: Python, Flask
- **データベース**: PostgreSQL
- **AIサービス**: OpenAI API
- **その他ライブラリ**: dotenv（環境変数管理）、JWT（認証）

## 4. 要件定義書

### 4.1 機能要件

#### 4.1.1 認証機能

- **新規ユーザー登録**: ユーザーは名前、メールアドレス、パスワードを入力してアカウントを作成できる。
- **ログイン**: 登録済みのユーザーはメールアドレスとパスワードでログインできる。
- **ログアウト**: ログインしているユーザーはログアウト可能。
- **自動ログイン**: 新規ユーザー登録後に自動的にログインしてダッシュボードに遷移する。

#### 4.1.2 プロジェクト管理機能

- **プロジェクト作成**: ユーザーは新しいプロジェクトを作成できる。
- **プロジェクト一覧の表示**: サイドバーおよびダッシュボードでプロジェクトの一覧を表示。
- **プロジェクト削除**: 必要に応じてプロジェクトを削除可能（未実装だが今後予定）。

#### 4.1.3 チャット機能

- **チャット履歴表示**: 選択されたプロジェクトのチャット履歴を表示。
- **AI応答生成**: ユーザーが送信したメッセージに対し、OpenAI APIを利用してAIからの応答を生成する。
- **プロンプトのテンプレート化**: AI応答は事前に設定されたテンプレート（`template_prompt.py`）に基づき生成。

#### 4.1.4 サイドバー機能

- **ナビゲーション**: サイドバーからプロジェクト間の簡単な移動を可能にする。
- **ログアウト機能**: サイドバーからログアウト操作を実行可能。

### 4.2 非機能要件

- **セキュリティ**:
  - パスワードはハッシュ化して保存。
  - JWTを用いたセッション管理。
  - APIキーは環境変数（`.env`）で管理。
- **スケーラビリティ**:
  - プロジェクトおよびチャット機能はスケーラブルな構成を意識。
- **UI/UX**:
  - Material-UIを用いた直感的で使いやすいインターフェース。
  - 登録とログイン画面間のリンクを設置し、ユーザーの移動を容易に。

## 5. データベース設計

### 5.1 テーブル定義

#### 5.1.1 Users テーブル

- **id**: プライマリキー
- **username**: ユーザー名
- **email**: メールアドレス（ユニーク）
- **password\_hash**: ハッシュ化されたパスワード
- **created\_at**: 作成日時

#### 5.1.2 Projects テーブル

- **id**: プライマリキー
- **name**: プロジェクト名
- **user\_id**: 外部キー（Usersテーブル）
- **created\_at**: 作成日時

#### 5.1.3 Messages テーブル

- **id**: プライマリキー
- **project\_id**: 外部キー（Projectsテーブル）
- **sender**: メッセージ送信者（ユーザーまたはAI）
- **content**: メッセージ内容
- **created\_at**: 作成日時

## 6. API 設計

### 6.1 エンドポイント一覧

- **POST /auth/register**: 新規ユーザー登録
- **POST /auth/login**: ユーザーログイン
- **POST /auth/logout**: ログアウト
- **GET /projects**: プロジェクト一覧の取得
- **POST /projects**: 新規プロジェクトの作成
- **GET /chat/\<project\_id>**: チャット履歴の取得
- **POST /chat/\<project\_id>**: チャットメッセージの送信とAI応答の取得

## 7. 使用シーケンス

### 7.1 ユーザー登録とログイン

1. ユーザーが新規登録フォームに情報を入力し、送信する。
2. サーバーでユーザー情報を登録し、自動的にログイン。
3. JWTトークンを発行し、フロントエンドに返却。
4. フロントエンドでトークンを保存し、ダッシュボードに遷移。

### 7.2 プロジェクト作成とチャット開始

1. ユーザーがダッシュボードから新規プロジェクトを作成。
2. 作成されたプロジェクトがサイドバーおよびダッシュボードに表示。
3. ユーザーがプロジェクトを選択してチャット画面に移動。
4. チャットメッセージを送信すると、テンプレートプロンプトを基にAIからの応答が返ってくる。

## 8. 今後の課題と改善点

- **プロジェクト削除機能**: ユーザーがプロジェクトを削除できる機能の追加。
- **チャットのパフォーマンス向上**: 長いチャット履歴の効率的な取得と表示。
- **ロール管理**: 管理者ユーザーの追加とアクセス権限管理。
- **テスト**: ユニットテストと統合テストの追加。

