// MySQL 연결 풀을 가져옵니다.
const db = require("../config/db");

// ==========================================================
// 🟦 신규 경매 등록 API (POST /api/auctions)
// ==========================================================
exports.createAuction = async (req, res) => {
  try {
    // 클라이언트에서 전달된 데이터
    const {
      title,
      categoryId,
      description,
      imageUrl,
      startPrice,
      immediatePurchasePrice,
      startTime,
      endTime,
      sellerId,
    } = req.body;

    // 필수값 체크
    if (
      !sellerId ||
      !title ||
      !startPrice ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({ message: "필수 값이 누락되었습니다." });
    }

    // 시간 유효성 체크
    if (new Date(startTime) >= new Date(endTime)) {
      return res
        .status(400)
        .json({ message: "종료 시간은 시작 시간보다 늦어야 합니다." });
    }

    const status = "ongoing"; // 기본 상태 = 진행중
    const currentPrice = startPrice; // 현재가 = 시작가로 초기화

    // DB INSERT 실행
    const [result] = await db.query(
      `INSERT INTO auctions
        (seller_id, category_id, title, description, image_url,
        start_price, current_price,
        immediate_purchase_price, status, start_time, end_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sellerId,
        categoryId || null,
        title,
        description || null,
        imageUrl || null,
        startPrice,
        currentPrice,
        immediatePurchasePrice || null,
        status,
        startTime,
        endTime,
      ]
    );

    // 성공 응답
    res.status(201).json({
      message: "경매 등록 성공",
      auctionId: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// ==========================================================
// 🟦 상품 상세 정보 조회 API (GET /api/auctions/:id)
// ==========================================================
exports.getAuctionById = async (req, res) => {
  try {
    const { id } = req.params;
    // URL에서 상품 ID 가져오기 (/api/auctions/3 → id = 3)

    // DB에서 상품 정보 조회
    const [auctions] = await db.query(
      `SELECT 
        a.*,
        u.nickname as seller_nickname,
        c.name as category_name
      FROM auctions a
      LEFT JOIN users u ON a.seller_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.id = ?`,
      [id]
    );

    // 상품이 없으면 404 에러
    if (auctions.length === 0) {
      return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
    }

    const auction = auctions[0]; // 첫 번째 상품 정보만 반환

    // 입찰 내역 조회
    const [bids] = await db.query(
      `SELECT 
        b.*,
        u.nickname as bidder_nickname
      FROM bids b
      LEFT JOIN users u ON b.bidder_id = u.id
      WHERE b.auction_id = ?
      ORDER BY b.created_at DESC`,
      [id]
    );

    // 현재가를 bids의 최고가로 계산 (입찰이 없으면 시작가)
    let currentPrice = Number(auction.start_price);
    if (bids.length > 0) {
      const maxBid = Math.max(...bids.map(bid => Number(bid.amount)));
      currentPrice = maxBid;
    }

    // 결과 반환
    res.json({
      ...auction,
      current_price: currentPrice,
      bids: bids,
    });
  } catch (error) {
    // 에러 발생 시
    console.error(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};
