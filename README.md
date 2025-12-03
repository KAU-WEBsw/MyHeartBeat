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
```

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

## 데이터베이스 설정

### 1️⃣ .env 파일 설정

1. `/server` 폴더에 `.env` 파일을 생성하세요.

2. 다음 내용을 입력하세요 (MySQL 비밀번호를 실제 값으로 변경):

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=본인의_MySQL_비밀번호
DB_NAME=auction_db
PORT=4000
```

### 2️⃣ 데이터베이스 사용하기

#### 방법A : 터미널 사용

터미널에서 다음 명령어를 실행하세요:

```bash
mysql -u root -p < server/database/schema.sql
```

#### 방법B : MySQL Workbench 사용

MySQL Workbench에서 실행:

1. MySQL Workbench 실행
2. 로컬 MySQL 서버에 연결
3. 상단 메뉴에서 `File` → `Open SQL Script` 선택
4. `server/database/schema.sql` 파일 열기
5. 전체 스크립트 선택 후 실행 (⚡ 번개 아이콘 클릭 또는 `Ctrl+Shift+Enter`)

데이터베이스와 테이블이 생성됩니다.

## 📁 프로젝트 구조

```bash
MyHeartBeat/
├── frontend/               # React 기반 사용자 화면
│   ├── public/
│   │   └── assets/         # 이미지 / 아이콘
│   └── src/
│       ├── components/     # 공통 컴포넌트 (Header 등)
│       └── pages/          # 주요 화면 페이지
│           ├── LandingPage.js
│           ├── LoginPage.js
│           ├── SignupPage.js
│           ├── MainPage.js
│           ├── AuctionListPage.js
│           ├── AuctionCreatePage.js
│           ├── ProductDetailPage.js
│           └── MyPage.js
│
└── server/                 # Node.js + Express 백엔드
    ├── database/
    │   └── schema.sql      # 테이블 구조
    ├── config/
    │   └── db.js           # DB 연결 설정
    ├── controllers/        # 기능 로직
    │   ├── auth.controller.js
    │   ├── auction.controller.js
    │   ├── like.controller.js
    │   └── mypage.controller.js
    ├── routes/             # API 라우팅
    │   ├── auth.routes.js
    │   ├── auction.routes.js
    │   ├── like.routes.js
    │   └── mypage.routes.js
    └── app.js              

```


## 🛠 기술 스택

| 분야       | 기술                    |
| -------- | --------------------- |
| Frontend | React                 |
| Backend  | Node.js, Express      |
| DB       | MySQL(mysql2/promise) |
| Tools    | GitHub, VS Code       |

