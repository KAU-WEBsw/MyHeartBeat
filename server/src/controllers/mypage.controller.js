const db = require("../config/db");
// 마이페이지 조회 전 종료된 경매를 최신 상태로 반영
const { closeExpiredAuctions } = require("../utils/auction.closer");

const defaultProfile = {
  name: "",
  email: "",
};

exports.getDashboard = async (req, res) => {
  const userId = Number(req.params.userId || 1);

  try {
    // 종료된 경매 상태 먼저 정리 후 내 데이터 계산
    await closeExpiredAuctions();

    const [users] = await db.query(
      "SELECT id, email, nickname FROM users WHERE id = ?",
      [userId]
    );

    const profile = users[0]
      ? {
          name: users[0].nickname,
          email: users[0].email,
        }
      : defaultProfile;

    const [myAuctions] = await db.query(
      "SELECT a.id, a.title, c.name AS category, a.current_price AS currentPrice, a.status, a.end_time AS endTime, a.created_at AS registeredAt, " +
        "IFNULL((SELECT COUNT(*) FROM bids b WHERE b.auction_id = a.id), 0) AS bidCount, a.image_url " +
        "FROM auctions a " +
        "LEFT JOIN categories c ON a.category_id = c.id " +
        "WHERE a.seller_id = ? " +
        "ORDER BY a.created_at DESC",
      [userId]
    );

    const [bidHistory] = await db.query(
      "SELECT a.id, a.title, c.name AS category, a.current_price AS currentPrice, a.status, a.end_time AS endTime, a.image_url, " +
        "MAX(b.amount) AS myBid, COUNT(*) AS bidCount " +
        "FROM bids b " +
        "JOIN auctions a ON b.auction_id = a.id " +
        "LEFT JOIN categories c ON a.category_id = c.id " +
        "WHERE b.bidder_id = ? " +
        "GROUP BY a.id, a.title, c.name, a.current_price, a.status, a.end_time, a.image_url " +
        "ORDER BY a.end_time DESC",
      [userId]
    );

    const computeStatus = (endTime) =>
      new Date(endTime).getTime() <= Date.now() ? "ended" : "ongoing";

    const myAuctionsWithStatus = myAuctions.map((auction) => ({
      ...auction,
      status: computeStatus(auction.endTime),
    }));

    const bidHistoryWithStatus = bidHistory.map((bid) => ({
      ...bid,
      status: computeStatus(bid.endTime),
    }));

    const [winRows] = await db.query(
      "SELECT COUNT(*) AS wins FROM auctions WHERE winner_id = ? AND end_time <= NOW()",
      [userId]
    );

    const [tradeSumRows] = await db.query(
      "SELECT IFNULL(SUM(winning_bid_amount), 0) AS totalAmount " +
        "FROM auctions " +
        "WHERE winning_bid_amount IS NOT NULL " +
        "AND end_time <= NOW() " +
        "AND (seller_id = ? OR winner_id = ?)",
      [userId, userId]
    );

    res.json({
      profile,
      stats: {
        listed: myAuctionsWithStatus.length,
        bidding: bidHistoryWithStatus.filter((item) => item.status === "ongoing").length,
        wins: winRows?.[0]?.wins || 0,
        totalAmount: tradeSumRows?.[0]?.totalAmount || 0,
      },
      myAuctions: myAuctionsWithStatus,
      bidHistory: bidHistoryWithStatus,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "마이페이지 데이터를 불러오지 못했습니다." });
  }
};
