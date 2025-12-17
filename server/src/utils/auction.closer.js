// 간단한 만료 처리 유틸
// 종료 시간이 지난 경매를 종료 상태로 전환하고 최고 입찰자를 낙찰 처리합니다.
// 목록/상세/마이페이지 진입 시 호출해 DB 상태를 최신으로 유지합니다.
const db = require("../config/db");

const closeExpiredAuctions = async () => {
  // 진행 중이면서 종료 시간이 지난 경매 목록 조회
  const [expired] = await db.query(
    "SELECT id FROM auctions WHERE status = 'ongoing' AND end_time <= NOW()"
  );

  if (!expired || !expired.length) return;

  // 각 경매별로 최고 입찰자 확인 후 상태 업데이트
  const updatePromises = expired.map(async (row) => {
    const auctionId = row.id;
    const [bids] = await db.query(
      "SELECT bidder_id, amount FROM bids WHERE auction_id = ? ORDER BY amount DESC LIMIT 1",
      [auctionId]
    );

    const winnerId = bids?.[0]?.bidder_id || null;
    const winningAmount = bids?.[0]?.amount || null;

    await db.query(
      `UPDATE auctions
         SET status = 'ended',
             winner_id = ?,
             winning_bid_amount = ?,
             current_price = COALESCE(?, current_price)
       WHERE id = ?`,
      [winnerId, winningAmount, winningAmount, auctionId]
    );
  });

  await Promise.all(updatePromises);
};

module.exports = { closeExpiredAuctions };
