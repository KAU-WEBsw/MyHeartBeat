const express = require("express");
const cors = require("cors");
const session = require("express-session");
const db = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const auctionRoutes = require("./routes/auction.routes");
const mypageRoutes = require("./routes/mypage.routes");

// ✅ 수정: 업로드 폴더 정적 서빙을 위한 path 추가
const path = require("path"); // ✅ 수정

const app = express();

// ✅ 수정: 쿠키 세션 사용 시 CORS에서 credentials 허용 필요
// CORS: 개발 환경에서는 프론트 주소로 고정하여 credentials 허용
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Session middleware: 반드시 라우트 등록 전에 적용
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // 개발 시 false, 프로덕션(https)에서는 true로 설정 필요
      sameSite: "lax",
    },
  })
);

// ✅ 수정: multipart/form-data는 multer가 처리하지만, text 필드가 들어올 수 있어 추가해도 안전
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ 수정

// ✅ 수정: 업로드된 파일을 URL로 접근 가능하게 정적 서빙
// 예) DB에 /uploads/파일명.jpg 저장 → 브라우저에서 http://서버주소/uploads/파일명.jpg 로 접근
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads"))); // ✅ 수정

// 기본 테스트 라우트
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// DB 연결 테스트
app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 + 1 AS result");
    res.json(rows); // [{ result: 2 }]
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "DB 연결 실패" });
  }
});

// 회원가입 api 라우트
app.use("/api/auth", authRoutes);

// 상품 상세 api 라우트
app.use("/api/auctions", auctionRoutes);

// 마이페이지 대시보드
app.use("/api/mypage", mypageRoutes);

module.exports = app;
