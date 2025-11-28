const express = require("express");
const router = express.Router(); // 라우트를 관리하는 객체 생성
const auctionController = require("../controllers/auction.controller"); // Controller 파일 가져오기

// 카테고리 목록 조회
router.get("/categories", auctionController.getCategories);

// 경매 물품 목록 조회
router.get("/", auctionController.getAuctions);

// 경매 등록
router.post("/", auctionController.createAuction);

// 경로 /:id로 요청이 오면 상품 상세 정보 함수 호출, !!경매 상세 조회!!
router.get("/:id", auctionController.getAuctionById);

// 입찰하기 (POST /api/auctions/:id/bids)
router.post("/:id/bids", auctionController.createBid);

// 즉시 구매하기 (POST /api/auctions/:id/purchase)
router.post("/:id/purchase", auctionController.purchaseAuction);

module.exports = router; // 라우트 객체를 다른 파일에서 사용할 수 있도록 내보냄 
