// MySQL 연결 풀을 가져옵니다.
const db = require("../config/db");
// 물품 목록 - 필터 (utils/auction.filters/js)
const { buildConditions, buildListQuery } = require("../utils/auction.filters");

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

// ==========================================================
// 🟦 경매 목록 조회 API (GET /api/auctions)
// - 필터: 상태(status), 카테고리(category), 가격(min/max)
// - 페이지네이션(page, pageSize)
// - 로그인 사용자일 경우 찜 여부(liked) 포함
// ==========================================================
exports.getAuctions = async (req, res) => {
  try {
    const { status, category, minPrice, maxPrice, page = 1, pageSize = 9, userId } = req.query;

    const pageNum = Number(page) || 1;
    const size = Number(pageSize) || 9;
    const offset = (pageNum - 1) * size;

    const filter = buildConditions({ status, category, minPrice, maxPrice });

    const countSql =
      "SELECT COUNT(*) AS total FROM auctions a LEFT JOIN categories c ON a.category_id = c.id " +
      filter.whereClause;
    const [countRows] = await db.query(countSql, filter.values);
    const total = countRows?.[0]?.total || 0;

    let params = [...filter.values];
    let withLikes = false;
    if (userId) {
      withLikes = true;
      params.unshift(Number(userId));
    }

    let items;
    try {
      const selectSql = buildListQuery({ withLikes, whereClause: filter.whereClause });
      items = await db.query(selectSql, [...params, size, offset]).then((r) => r[0]);
    } catch (err) {
      if (err.code === "ER_NO_SUCH_TABLE" && err.message.includes("likes")) {
        const selectSql = buildListQuery({ withLikes: false, whereClause: filter.whereClause });
        items = await db.query(selectSql, [...filter.values, size, offset]).then((r) => r[0]);
      } else {
        throw err;
      }
    }

    res.json({ total, page: pageNum, pageSize: size, items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "경매 목록을 불러오지 못했습니다." });
  }
};

// ==========================================================
// 🟦 카테고리 목록 조회 API (GET /api/auctions/categories)
// - 모든 카테고리 이름을 오름차순 정렬하여 반환
// ==========================================================
exports.getCategories = async (_req, res) => {
  try {
    const [rows] = await db.query("SELECT name FROM categories ORDER BY name ASC");
    res.json({ categories: rows.map((r) => r.name) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "카테고리를 불러오지 못했습니다." });
  }
};