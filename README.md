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

1. 프로젝트 루트에 있는 `.env.example` 파일의 이름을 `.env` 로 변경하세요.

2. `.env` 파일을 열어서 본인의 MySQL 비밀번호를 입력하세요:

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

