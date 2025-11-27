const express = require("express");
const router = express.Router(); // 라우트를 관리하는 객체 생성
const auctionController = require("../controllers/auction.controller"); // Controller 파일 가져오기

// 👉 1. 카테고리 목록 조회
router.get("/categories", auctionController.getCategories);

// 👉 2. 경매 물품 목록 조회
router.get("/", auctionController.getAuctions);

// 👉 3. 경매 등록
router.post("/", auctionController.createAuction);

// 👉 4. 경로 /:id로 요청이 오면 상품 상세 정보 함수 호출, !!경매 상세 조회!!
router.get("/:id", auctionController.getAuctionById);

module.exports = router; // 라우트 객체를 다른 파일에서 사용할 수 있도록 내보냄 
