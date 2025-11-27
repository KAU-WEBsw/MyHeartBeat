const db = require("../config/db");

// 찜 추가
exports.addLike = async (req, res) => {
  try {
    const { userId, auctionId } = req.body;
    if (!userId || !auctionId) {
      return res.status(400).json({ message: "userId와 auctionId는 필수입니다." });
    }

    await db.query(
      "INSERT IGNORE INTO likes (user_id, auction_id) VALUES (?, ?)",
      [userId, auctionId]
    );

    res.status(201).json({ message: "찜 추가 완료" });
  } catch (error) {
    console.error("addLike error:", error);
    res.status(500).json({ message: "찜 추가 중 오류가 발생했습니다." });
  }
};

// 찜 취소
exports.removeLike = async (req, res) => {
  try {
    const { userId, auctionId } = req.body;
    if (!userId || !auctionId) {
      return res.status(400).json({ message: "userId와 auctionId는 필수입니다." });
    }

    await db.query(
      "DELETE FROM likes WHERE user_id = ? AND auction_id = ?",
      [userId, auctionId]
    );

    res.json({ message: "찜 삭제 완료" });
  } catch (error) {
    console.error("removeLike error:", error);
    res.status(500).json({ message: "찜 삭제 중 오류가 발생했습니다." });
  }
};