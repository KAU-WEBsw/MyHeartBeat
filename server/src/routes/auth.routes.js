const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

// 회원가입
router.post("/signup", authController.signup);

// 로그인
router.post("/login", authController.login);

// 로그인 상태 확인
router.get("/me", authController.me);

// 로그아웃
router.post("/logout", authController.logout);

module.exports = router;
