## 🏛️내맘똑 : 내 맘에 똑드는 물건!

React + Node.js 기반 **온라인 경매 플랫폼**

## 🚀 빠른 시작

### 📌 사전 준비

- Node.js 16.x 이상
- npm 설치 완료
- MySQL 설치 (Workbench 추천)

## 📦 설치 및 실행

### 1️⃣ 프로젝트 클론

```bash
git clone <repo-url>
cd MyHeartBeat
````

### 2️⃣ 백엔드 실행 (Express)

```bash
cd server
npm install
npm run dev
```

실행 주소: [http://localhost:4000](http://localhost:4000)

### 3️⃣ 프론트엔드 실행 (React)

```bash
cd ../frontend
npm install
npm start
```

실행 주소: [http://localhost:3000](http://localhost:3000)

📌 항상 백엔드 + 프론트 둘 다 실행해야 화면에서 기능 테스트 가능!

## 🔑 환경 변수 설정 (.env)

📌 위치: server/.env
GitHub에 업로드 금지!

```
DB_HOST=localhost
DB_USER=사용자ID
DB_PASSWORD=비밀번호
DB_NAME=auction_db
PORT=4000
```

## 🗄 데이터베이스 생성

MySQL Workbench에서 실행:

```sql
CREATE DATABASE IF NOT EXISTS auction_db;
USE auction_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  nickname VARCHAR(50) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🗄 데이터베이스 초기화 (Schema + Seed 파일 실행)
```bash
cd MyHeartBeat/server/database
mysql -u root -p -P 3306 < schema.sql
```
3306 대신 자신의 MySQL 포트 번호

## 📁 프로젝트 구조

```bash
MyHeartBeat/
├─ server/                # 백엔드 (Node.js + Express + MySQL)
│  ├─ src/
│  │  ├─ app.js           # 서버 설정 & 미들웨어 등록
│  │  ├─ server.js        # 서버 실행 엔트리 포인트
│  │  ├─ config/          # DB 연결 설정
│  │  ├─ controllers/     # 요청 처리 로직
│  │  ├─ middleware/      # 인증 / 보안 관련 미들웨어
│  │  ├─ models/          # DB 모델 정의
│  │  └─ routes/          # API 엔드포인트 관리
│  ├─ .env                # 환경 변수 (DB 접근 정보 등)
│  ├─ package.json        # 서버 의존성 관리
│  └─ README.md           # (선택) 서버 설명 문서
│
└─ frontend/              # 프론트엔드 (React)
   ├─ public/             # 정적 리소스
   ├─ src/
   │  ├─ App.js           # 전체 앱 구조 / 라우팅
   │  ├─ App.css          # 전역 스타일링
   │  ├─ index.js         # React 렌더링 시작점
   │  ├─ index.css        # 기본 스타일
   │  ├─ components/      # 재사용 컴포넌트
   │  │  ├─ Header.js
   │  │  └─ Header.css
   │  └─ pages/
   │     ├─ MainPage.js   # 메인 페이지 (경매 홈)
   │     └─ MainPage.css
   ├─ package.json        # 프론트 의존성 관리
   └─ README.md           # (선택) 프론트 설명 문서


```


## 🛠 기술 스택

| 분야       | 기술                    |
| -------- | --------------------- |
| Frontend | React                 |
| Backend  | Node.js, Express      |
| DB       | MySQL(mysql2/promise) |
| Tools    | GitHub, VS Code       |

