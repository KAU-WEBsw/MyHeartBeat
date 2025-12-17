const db = require("../config/db");
// 마이페이지 조회 전 종료된 경매를 최신 상태로 반영
const { closeExpiredAuctions } = require("../utils/auction.closer");

// 기본 프로필: 사용자 정보가 없을 때 빈 문자열로 초기화해 프론트에서 안전하게 접근
const defaultProfile = {
  name: "",
  email: "",
};

exports.getDashboard = async (req, res) => {
  // URL 파라미터(userId)가 없으면 세션 사용자 → 그래도 없으면 1번 사용자로 fallback
  const sessionUserId =
    req.session?.user?.id ??
    req.session?.userId ??
    req.session?.user?.userId ??
    1;
  const userId = Number(req.params.userId ?? sessionUserId);

  try {
    // 종료된 경매 상태 먼저 정리 후 내 데이터 계산
    await closeExpiredAuctions();

    // 동시에 실행 가능한 쿼리를 Promise.all 로 묶어 응답 속도 개선
    // db.query 는 [rows, fields]를 반환하므로 Promise.all 이후 첫 번째 요소만 구조 분해
    const [
      [users],
      [myAuctions],
      [bidHistory],
      [winRows],
      [tradeSumRows],
    ] = await Promise.all([
      db.query("SELECT id, email, nickname FROM users WHERE id = ?", [userId]),
      db.query(
        "SELECT a.id, a.title, c.name AS category, a.current_price AS currentPrice, a.status, a.end_time AS endTime, a.created_at AS registeredAt, " +
          "IFNULL((SELECT COUNT(*) FROM bids b WHERE b.auction_id = a.id), 0) AS bidCount, a.image_url " +
          "FROM auctions a " +
          "LEFT JOIN categories c ON a.category_id = c.id " +
          "WHERE a.seller_id = ? " +
          "ORDER BY a.created_at DESC",
        [userId]
      ),
      db.query(
        "SELECT a.id, a.title, c.name AS category, a.current_price AS currentPrice, a.status, a.end_time AS endTime, a.image_url, " +
          "MAX(b.amount) AS myBid, COUNT(*) AS bidCount " +
          "FROM bids b " +
          "JOIN auctions a ON b.auction_id = a.id " +
          "LEFT JOIN categories c ON a.category_id = c.id " +
          "WHERE b.bidder_id = ? " +
          "GROUP BY a.id, a.title, c.name, a.current_price, a.status, a.end_time, a.image_url " +
          "ORDER BY a.end_time DESC",
        [userId]
      ),
      db.query(
        "SELECT COUNT(*) AS wins FROM auctions WHERE winner_id = ? AND end_time <= NOW()",
        [userId]
      ),
      db.query(
        "SELECT IFNULL(SUM(winning_bid_amount), 0) AS totalAmount " +
          "FROM auctions " +
          "WHERE winning_bid_amount IS NOT NULL " +
          "AND end_time <= NOW() " +
          "AND (seller_id = ? OR winner_id = ?)",
        [userId, userId]
      ),
    ]);

    const profile = users[0]
      ? {
          name: users[0].nickname,
          email: users[0].email,
        }
      : defaultProfile;

    // computeStatus: 프론트와 동일한 로직으로 서버에서도 종료 여부를 판단
    const computeStatus = (endTime) =>
      new Date(endTime).getTime() <= Date.now() ? "ended" : "ongoing";

    // 프론트 카드에서 status/remainingTime을 쓰기 때문에 status를 서버에서 덮어씀
    const myAuctionsWithStatus = myAuctions.map((auction) => ({
      ...auction,
      status: computeStatus(auction.endTime),
    }));

    const bidHistoryWithStatus = bidHistory.map((bid) => ({
      ...bid,
      status: computeStatus(bid.endTime),
    }));

    // 반환 스키마: 프론트 MyPage 가 그대로 사용 (profile + stats + 리스트 2종)
    res.json({
      profile,
      stats: {
        listed: myAuctionsWithStatus.length,
        bidding: bidHistoryWithStatus.filter((item) => item.status === "ongoing").length, // 진행중 입찰 수
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
