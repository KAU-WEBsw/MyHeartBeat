// server/database/seed.js
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const db = require("../src/config/db");

async function seedData() {
  try {
    // 판매자 유저 추가
    const [sellerResult] = await db.query(
      `INSERT INTO users (email, password_hash, nickname) VALUES (?, ?, ?)`,
      ['seller@test.com', '$2b$10$abcdef1234567890abcdef1234567890abcdef1234567890abcdef', '판매자']
    );
    const sellerId = sellerResult.insertId;
    console.log(`판매자 유저 생성 완료 (ID: ${sellerId})`);

    // 구매자 유저 추가
    const [buyerResult] = await db.query(
      `INSERT INTO users (email, password_hash, nickname) VALUES (?, ?, ?)`,
      ['buyer@test.com', '$2b$10$abcdef1234567890abcdef1234567890abcdef1234567890abcdef', '구매자']
    );
    const buyerId = buyerResult.insertId;
    console.log(`구매자 유저 생성 완료 (ID: ${buyerId})`);

    // 로렉스 시계 경매 상품 추가
    const [auctionResult] = await db.query(
      `INSERT INTO auctions (
        seller_id, category_id, title, description, image_url,
        start_price, current_price, min_bid_increment,
        immediate_purchase_price,
        status, start_time, end_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sellerId, // 판매자 ID
        1, // 카테고리: 전자제품
        '로렉스 데이데이트 썬더스트 바게트 다이아 로즈골드 금통 40MM',
        '로렉스 데이데이트 썬더스트 바게트 다이아몬드 로즈골드 금통 40MM 모델입니다. 정품 보증서 포함, 상태 양호합니다.',
        'https://img2.joongna.com/media/original/2025/11/19/1763487579561uFL_oaanV.jpg?impolicy=resizeWatermark3&ftext=%EA%B2%BD%EB%82%A8%EB%AA%85%ED%92%88%EC%8B%9C%EA%B3%84',
        53500000, // 시작가: 53,500,000원
        53500000, // 현재가: 시작가와 동일
        500000, // 최소 입찰 단위: 100,000원
        60000000, // 즉시구매가: 60,000,000원
        'ongoing',
        new Date(),
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7일 후 마감
      ]
    );

    console.log(`경매 상품 생성 완료 (ID: ${auctionResult.insertId})`);
    console.log('데이터 삽입 완료!');
    process.exit(0);
  } catch (error) {
    console.error('에러:', error);
    process.exit(1);
  }
}

seedData();