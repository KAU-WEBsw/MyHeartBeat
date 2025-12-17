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
├── frontend/                    # React 기반 사용자 화면
│   ├── public/
│   │   ├── assets/              # 이미지 / 아이콘
│   │   │   └── floating/        # 플로팅 아이콘 이미지
│   │   └── index.html
│   └── src/
│       ├── components/          # 공통 컴포넌트
│       │   ├── Header.js        # 상단 네비게이션 헤더 컴포넌트
│       │   └── Header.css
│       ├── pages/               # 주요 화면 페이지
│       │   ├── LandingPage.js           # 랜딩 페이지 (첫 화면)
│       │   ├── LandingPage.module.css
│       │   ├── LoginPage.js              # 로그인 페이지
│       │   ├── LoginPage.module.css
│       │   ├── SignupPage.js             # 회원가입 페이지
│       │   ├── SignupPage.module.css
│       │   ├── MainPage.js               # 메인 페이지
│       │   ├── MainPage.module.css
│       │   ├── AuctionListPage.js         # 경매 목록 페이지
│       │   ├── AuctionListPage.module.css
│       │   ├── AuctinoCreatePage.js       # 경매 등록 페이지
│       │   ├── AuctionCreatePage.module.css
│       │   ├── ProductDetailPage.js       # 경매 상세 페이지 (입찰, 즉시구매)
│       │   ├── ProductDetailPage.module.css
│       │   ├── MyPage.js                  # 마이페이지 (내 경매, 입찰 내역)
│       │   └── MyPage.module.css
│       ├── App.js               # React Router 설정 및 라우팅
│       └── index.js             # React 앱 진입점
│
└── server/                      # Node.js + Express 백엔드
    ├── database/
    │   └── schema.sql           # 데이터베이스 스키마 (테이블 생성 및 초기 데이터)
    ├── uploads/                 # 업로드된 이미지 파일 저장 폴더
    └── src/
        ├── config/
        │   └── db.js            # MySQL 연결 풀 설정
        ├── controllers/         # 기능 로직 (비즈니스 로직 처리)
        │   ├── auth.controller.js        # 로그인, 회원가입 처리
        │   ├── auction.controller.js     # 경매 CRUD, 입찰, 즉시구매 처리
        │   └── mypage.controller.js      # 마이페이지 데이터 조회
        ├── routes/              # API 라우팅 (엔드포인트 정의)
        │   ├── auth.routes.js            # /api/auth/* 라우트
        │   ├── auction.routes.js         # /api/auctions/* 라우트
        │   ├── like.routes.js            # /api/likes/* 라우트 (찜 기능)
        │   └── mypage.routes.js          # /api/mypage/* 라우트
        ├── utils/               # 유틸리티 함수
        │   ├── auction.closer.js         # 만료된 경매 자동 종료 처리
        │   ├── auction.filters.js         # 경매 목록 필터링 (상태, 카테고리, 가격)
        │   └── upload.js                 # 이미지 업로드 미들웨어 (multer 설정)
        ├── app.js               # Express 앱 설정 (미들웨어, 라우트 등록)
        └── server.js            # 서버 실행 파일 (포트 리스닝)

```


## 🛠 기술 스택

| 분야       | 기술                    |
| -------- | --------------------- |
| Frontend | React                 |
| Backend  | Node.js, Express      |
| DB       | MySQL(mysql2/promise) |
| Tools    | GitHub, VS Code       |

