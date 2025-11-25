const express = require("express");
const router = express.Router(); // 라우트를 관리하는 객체 생성
const auctionController = require("../controllers/auction.controller"); // Controller 파일 가져오기

// 경로 /:id로 요청이 오면 상품 상세 정보 함수 호출
router.get("/:id", auctionController.getAuctionById);

module.exports = router; // 라우트 객체를 다른 파일에서 사용할 수 있도록 내보냄