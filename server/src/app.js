// server/src/app.js
const express = require("express");
const cors = require("cors");
const db = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const auctionRoutes = require("./routes/auction.routes");

const app = express();

app.use(cors());
app.use(express.json());

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

module.exports = app;
