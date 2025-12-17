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

## 🗄️ 데이터베이스 구조

### 테이블 목록

#### 1. users (회원)

| 컬럼명        | 타입         | 설명              |
| ------------- | ------------ | ----------------- |
| id            | INT          | 기본키 (자동증가) |
| email         | VARCHAR(255) | 이메일 (유니크)   |
| password_hash | VARCHAR(255) | 비밀번호 해시     |
| nickname      | VARCHAR(50)  | 닉네임            |
| created_at    | TIMESTAMP    | 가입일시          |

#### 2. categories (카테고리)

| 컬럼명 | 타입         | 설명              |
| ------ | ------------ | ----------------- |
| id     | INT          | 기본키 (자동증가) |
| name   | VARCHAR(100) | 카테고리 이름     |

#### 3. auctions (경매)

| 컬럼명                   | 타입          | 설명                                    |
| ------------------------ | ------------- | --------------------------------------- |
| id                       | INT           | 기본키 (자동증가)                       |
| seller_id                | INT           | 판매자 ID (외래키: users.id)            |
| seller_nickname          | VARCHAR(50)   | 판매자 닉네임 (NULL 허용)               |
| category_id              | INT           | 카테고리 ID (외래키: categories.id)     |
| title                    | VARCHAR(255)  | 경매 제목                               |
| description              | TEXT          | 경매 설명                               |
| image_url                | VARCHAR(500)  | 상품 이미지 URL                         |
| start_price              | DECIMAL(10,2) | 시작가                                  |
| current_price            | DECIMAL(10,2) | 현재가                                  |
| immediate_purchase_price | DECIMAL(10,2) | 즉시 구매가 (NULL 허용)                 |
| status                   | ENUM          | 경매 상태 ('ongoing', 'ended')          |
| start_time               | DATETIME      | 경매 시작 시간                          |
| end_time                 | DATETIME      | 경매 종료 시간                          |
| winner_id                | INT           | 낙찰자 ID (외래키: users.id, NULL 허용) |
| winning_bid_amount       | DECIMAL(10,2) | 낙찰가 (NULL 허용)                      |
| created_at               | TIMESTAMP     | 등록일시                                |

#### 4. bids (입찰)

| 컬럼명     | 타입          | 설명                          |
| ---------- | ------------- | ----------------------------- |
| id         | INT           | 기본키 (자동증가)             |
| auction_id | INT           | 경매 ID (외래키: auctions.id) |
| bidder_id  | INT           | 입찰자 ID (외래키: users.id)  |
| amount     | DECIMAL(10,2) | 입찰 금액                     |
| created_at | TIMESTAMP     | 입찰일시                      |

### 테이블 관계도

```
users (회원)
  ├── auctions.seller_id (판매자)
  ├── auctions.winner_id (낙찰자)
  └── bids.bidder_id (입찰자)

categories (카테고리)
  └── auctions.category_id

auctions (경매)
  └── bids.auction_id
```

### 초기 데이터

- **카테고리**: 명품 / 패션, 전자기기, 미술품 / 컬렉션, 취미 / 기타
- **테스트 사용자**: test1@example.com, test2@example.com
- **샘플 경매**: 2개의 예시 경매 데이터 포함

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

## ✨ 주요 기능

### 🧭 Header (상단 네비게이션 바)

- 모든 페이지 상단에 표시되는 공통 헤더
- 로고 클릭으로 경매 목록 이동
- 경매 리스트 버튼
- 경매 등록 버튼
- 로그인 상태에 따른 버튼 표시
  - 비로그인: 로그인 버튼
  - 로그인: 마이페이지, 로그아웃 버튼
- 로그아웃 기능

### 🏠 LandingPage (랜딩 페이지) - `/`

- 서비스 소개 및 첫 화면
- 시작하기 버튼으로 경매 목록 이동
- 로그인 페이지 이동

### 🔐 LoginPage (로그인) - `/login`

- 이메일/비밀번호로 로그인
- 세션 기반 인증
- 로그인 후 메인 페이지 이동

### 📝 SignupPage (회원가입) - `/signup`

- 이메일, 비밀번호, 닉네임으로 회원가입
- 회원가입 후 로그인 페이지 이동

### 📋 AuctionListPage (경매 목록) - `/auction/list`

- 경매 목록 카드 형태로 표시
- 정렬 기능 (최신순, 인기순, 가격순, 마감임박순)
- 경매 상세 페이지로 이동

### ➕ AuctionCreatePage (경매 등록) - `/auction/new`

- 경매 상품 정보 입력
  - 제목, 설명, 카테고리 선택
  - 시작가, 즉시 구매가 설정
  - 종료 시간 설정
- 이미지 업로드 (jpg, jpeg, png, 최대 10MB)
- 경매 등록 완료

### 📦 ProductDetailPage (경매 상세) - `/product/:id`

- 경매 상품 상세 정보 표시
  - 상품 이미지, 카테고리, 제목, 설명
  - 현재가, 시작가, 즉시 구매가
  - 판매자 정보
- 실시간 경매 타이머 (남은 시간 표시)
- 입찰 기능
  - 입찰 금액 입력 (콤마 자동 표시)
  - 현재가보다 높은 금액으로 입찰
  - 입찰 횟수 표시
- 즉시 구매 기능
  - 즉시 구매가로 바로 구매
  - 구매 확인 다이얼로그
- 경매 종료 시 낙찰가 표시

### 👤 MyPage (마이페이지) - `/mypage`

- 내가 등록한 경매 목록
  - 경매 상태 표시 (진행중/종료)
  - 입찰 횟수, 현재가 표시
- 내가 입찰한 경매 내역
  - 입찰한 경매 목록
  - 입찰 금액 표시

## 🛠 기술 스택

| 분야     | 기술                  |
| -------- | --------------------- |
| Frontend | React                 |
| Backend  | Node.js, Express      |
| DB       | MySQL(mysql2/promise) |
| Tools    | GitHub, VS Code       |
