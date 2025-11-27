const express = require("express");
const router = express.Router();
const { getDashboard } = require("../controllers/mypage.controller");

// 마이페이지 대시보드
router.get("/:userId", getDashboard);

module.exports = router;