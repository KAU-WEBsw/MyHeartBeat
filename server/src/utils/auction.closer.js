// 만료된 경매 자동 종료 처리
const db = require("../config/db");

const closeExpiredAuctions = async () => {
  // 1. 종료 시간 지난 경매 조회
  const [expired] = await db.query(
    "SELECT id FROM auctions WHERE status = 'ongoing' AND end_time <= NOW()"
  );
  
  // 만료된 경매 없으면 종료
  if (expired.length === 0) return;

  // 2. 각 경매 종료 처리
  for (const row of expired) {
    // 최고 입찰자 조회
    const [bids] = await db.query(
      "SELECT bidder_id, amount FROM bids WHERE auction_id = ? ORDER BY amount DESC LIMIT 1",
      [row.id]
    );
    
    // 낙찰자 정보 (입찰 없으면 null)
    let winnerId = null;
    let winningAmount = null;
    if (bids.length > 0) {
      winnerId = bids[0].bidder_id;
      winningAmount = bids[0].amount;
    }
    
    // 경매 종료 처리
    await db.query(
      `UPDATE auctions 
       SET status = 'ended', 
           winner_id = ?, 
           winning_bid_amount = ?, 
           current_price = COALESCE(?, current_price) 
       WHERE id = ?`,
      [winnerId, winningAmount, winningAmount, row.id]
    );
  }
};

module.exports = { closeExpiredAuctions };
