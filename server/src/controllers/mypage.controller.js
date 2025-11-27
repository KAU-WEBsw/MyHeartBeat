const db = require("../config/db");

const defaultProfile = {
  name: "",
  email: "",
};

exports.getDashboard = async (req, res) => {
  const userId = Number(req.params.userId || 1);

  try {
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

    const [favorites] = await db.query(
      "SELECT a.id, a.title, c.name AS category, a.current_price AS currentPrice, a.status, a.end_time AS endTime, a.image_url, " +
        "IFNULL((SELECT MAX(b.amount) FROM bids b WHERE b.auction_id = a.id AND b.bidder_id = ?), 0) AS myBid, " +
        "IFNULL((SELECT COUNT(*) FROM bids b2 WHERE b2.auction_id = a.id), 0) AS bidCount " +
        "FROM likes l " +
        "JOIN auctions a ON l.auction_id = a.id " +
        "LEFT JOIN categories c ON a.category_id = c.id " +
        "WHERE l.user_id = ? " +
        "ORDER BY a.end_time DESC",
      [userId, userId]
    );

    const [winRows] = await db.query(
      "SELECT COUNT(*) AS wins FROM auctions WHERE winner_id = ?",
      [userId]
    );

    const [bidSumRows] = await db.query(
      "SELECT IFNULL(SUM(amount), 0) AS totalAmount FROM bids WHERE bidder_id = ?",
      [userId]
    );

    res.json({
      profile,
      stats: {
        listed: myAuctions.length,
        bidding: bidHistory.length,
        wins: winRows?.[0]?.wins || 0,
        totalAmount: bidSumRows?.[0]?.totalAmount || 0,
      },
      myAuctions,
      bidHistory,
      favorites,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "마이페이지 데이터를 불러오지 못했습니다." });
  }
};