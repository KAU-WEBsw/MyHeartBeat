const express = require("express");
const router = express.Router();
const auctionController = require("../controllers/auction.controller");

// ✅ 수정: multer 업로드 미들웨어 추가
const upload = require("../utils/upload"); // (새로 만들 파일) multer 설정

// 카테고리 목록 조회
router.get("/categories", auctionController.getCategories);

// 경매 물품 목록 조회
router.get("/", auctionController.getAuctions);

// ✅ 수정: 경매 등록 - 이미지 파일 업로드 가능
router.post("/", upload.single("image"), auctionController.createAuction);

// ✅ 수정: 경매 수정 - 이미지 파일 업로드 가능
router.put("/:id", upload.single("image"), auctionController.updateAuction);

// 경매 상세 조회
router.get("/:id", auctionController.getAuctionById);

// 입찰하기
router.post("/:id/bids", auctionController.createBid);

// 즉시 구매하기
router.post("/:id/purchase", auctionController.purchaseAuction);

module.exports = router;
