// MySQL 연결 풀을 가져옵니다.
const db = require("../config/db");
// 물품 목록 - 필터 (utils/auction.filters/js)
const { buildConditions, buildListQuery } = require("../utils/auction.filters");

// ==========================================================
// 🟦 신규 경매 등록 API (POST /api/auctions)
//  - start_time은 DB에서 DEFAULT CURRENT_TIMESTAMP 사용
// ==========================================================
exports.createAuction = async (req, res) => {
  try {
    const {
      title,
      categoryId,
      description,
      imageUrl,
      startPrice,
      immediatePurchasePrice,
      endTime,
      sellerId,
    } = req.body;

    // ✅ 필수값 체크 (startTime은 더 이상 필요 없음)
    if (
      !sellerId ||
      !title ||
      categoryId == null ||
      startPrice == null ||
      !endTime
    ) {
      return res.status(400).json({ message: "필수 값이 누락되었습니다." });
    }

    const status = "ongoing"; // 기본 상태 = 진행중
    const currentPrice = startPrice; // 현재가 = 시작가로 초기화

    // DB INSERT 실행
    // ⬇️ start_time 컬럼은 빼고, DB의 DEFAULT CURRENT_TIMESTAMP 사용
    const [result] = await db.query(
      `INSERT INTO auctions
        (seller_id, category_id, title, description, image_url,
         start_price, current_price,
         immediate_purchase_price, status, end_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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

    // 경매 종료 시간 체크 및 자동 종료 처리
    if (auction.status === "ongoing") {
      const now = new Date();
      const endTime = new Date(auction.end_time);
      if (now >= endTime) {
        // 최고 입찰가 조회
        const [maxBids] = await db.query(
          `SELECT bidder_id, amount 
           FROM bids 
           WHERE auction_id = ? 
           ORDER BY amount DESC 
           LIMIT 1`,
          [id]
        );

        let winnerId = null;
        let winningAmount = null;
        if (maxBids.length > 0) {
          winnerId = maxBids[0].bidder_id;
          winningAmount = maxBids[0].amount;
        }

        // 경매 상태를 ended로 변경
        await db.query(
          `UPDATE auctions 
           SET status = 'ended', 
               winner_id = ?, 
               winning_bid_amount = ?,
               current_price = COALESCE(?, current_price)
           WHERE id = ?`,
          [winnerId, winningAmount, winningAmount, id]
        );

        // 업데이트된 경매 정보 다시 조회
        const [updatedAuctions] = await db.query(
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
        if (updatedAuctions.length > 0) {
          Object.assign(auction, updatedAuctions[0]);
        }
      }
    }

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

    // 현재가 계산
    // 경매가 종료된 경우 DB의 current_price를 사용 (즉시 구매 등으로 업데이트된 값)
    // 진행 중인 경우 입찰 내역의 최고가를 사용
    let currentPrice;
    if (auction.status === "ended") {
      currentPrice = Number(auction.current_price);
    } else {
      currentPrice = Number(auction.start_price);
      if (bids.length > 0) {
        const maxBid = Math.max(...bids.map((bid) => Number(bid.amount)));
        currentPrice = maxBid;
      }
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
    const {
      status,
      category,
      minPrice,
      maxPrice,
      page = 1,
      pageSize = 9,
      userId,
    } = req.query;

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
      const selectSql = buildListQuery({
        withLikes,
        whereClause: filter.whereClause,
      });
      items = await db
        .query(selectSql, [...params, size, offset])
        .then((r) => r[0]);
    } catch (err) {
      if (err.code === "ER_NO_SUCH_TABLE" && err.message.includes("likes")) {
        const selectSql = buildListQuery({
          withLikes: false,
          whereClause: filter.whereClause,
        });
        items = await db
          .query(selectSql, [...filter.values, size, offset])
          .then((r) => r[0]);
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
    const [rows] = await db.query(
      "SELECT name FROM categories ORDER BY name ASC"
    );
    res.json({ categories: rows.map((r) => r.name) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "카테고리를 불러오지 못했습니다." });
  }
};

// ==========================================================
// 🟦 입찰하기 API (POST /api/auctions/:id/bids)
// ==========================================================
exports.createBid = async (req, res) => {
  try {
    const { id } = req.params; // 경매 ID
    const { bidderId, amount } = req.body; // 입찰자 ID, 입찰 금액

    // 필수값 체크
    if (!bidderId || !amount) {
      return res
        .status(400)
        .json({ message: "입찰자 ID와 입찰 금액을 입력해주세요." });
    }

    // 경매 정보 조회
    const [auctions] = await db.query(`SELECT * FROM auctions WHERE id = ?`, [
      id,
    ]);

    if (auctions.length === 0) {
      return res.status(404).json({ message: "경매를 찾을 수 없습니다." });
    }

    const auction = auctions[0];

    // 경매 상태 체크
    if (auction.status !== "ongoing") {
      return res.status(400).json({ message: "종료된 경매입니다." });
    }

    // 경매 시간 체크
    const now = new Date();
    const endTime = new Date(auction.end_time);
    if (now >= endTime) {
      return res.status(400).json({ message: "경매가 종료되었습니다." });
    }

    // 판매자 체크
    if (Number(auction.seller_id) === Number(bidderId)) {
      return res
        .status(400)
        .json({ message: "자신의 경매에는 입찰할 수 없습니다." });
    }

    // 현재 최고 입찰가 조회
    const [bids] = await db.query(
      `SELECT MAX(amount) as max_amount FROM bids WHERE auction_id = ?`,
      [id]
    );
    const currentMaxBid = bids[0]?.max_amount || auction.start_price;
    const minBidAmount = Number(currentMaxBid) + 1;

    // 입찰 금액 체크
    if (Number(amount) < minBidAmount) {
      return res.status(400).json({
        message: `입찰 금액은 최소 ${minBidAmount.toLocaleString()}원 이상이어야 합니다.`,
      });
    }

    // 입찰 저장
    const [result] = await db.query(
      `INSERT INTO bids (auction_id, bidder_id, amount) VALUES (?, ?, ?)`,
      [id, bidderId, amount]
    );

    // 경매 현재가 업데이트
    await db.query(`UPDATE auctions SET current_price = ? WHERE id = ?`, [
      amount,
      id,
    ]);

    res.status(201).json({
      message: "입찰 성공",
      bidId: result.insertId,
      amount: amount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// ==========================================================
// 🟦 즉시 구매하기 API (POST /api/auctions/:id/purchase)
// ==========================================================
exports.purchaseAuction = async (req, res) => {
  try {
    const { id } = req.params; // 경매 ID
    const { buyerId } = req.body; // 구매자 ID

    // 필수값 체크
    if (!buyerId) {
      return res.status(400).json({ message: "구매자 ID를 입력해주세요." });
    }

    // 경매 정보 조회
    const [auctions] = await db.query(`SELECT * FROM auctions WHERE id = ?`, [
      id,
    ]);

    if (auctions.length === 0) {
      return res.status(404).json({ message: "경매를 찾을 수 없습니다." });
    }

    const auction = auctions[0];

    // 경매 상태 체크
    if (auction.status !== "ongoing") {
      return res.status(400).json({ message: "종료된 경매입니다." });
    }

    // 경매 시간 체크
    const now = new Date();
    const endTime = new Date(auction.end_time);
    if (now >= endTime) {
      return res.status(400).json({ message: "경매가 종료되었습니다." });
    }

    // 즉시 구매가 체크
    if (!auction.immediate_purchase_price) {
      return res
        .status(400)
        .json({ message: "즉시 구매가가 설정되지 않았습니다." });
    }

    // 즉시 구매가가 현재가보다 작거나 같으면 불가
    if (
      Number(auction.immediate_purchase_price) <= Number(auction.current_price)
    ) {
      return res.status(400).json({
        message: "현재가가 즉시 구매가보다 높아 즉시 구매할 수 없습니다.",
      });
    }

    // 판매자 체크
    if (Number(auction.seller_id) === Number(buyerId)) {
      return res
        .status(400)
        .json({ message: "자신의 경매는 즉시 구매할 수 없습니다." });
    }

    // 경매 종료 처리 및 현재가를 즉시 구매가로 변경
    await db.query(
      `UPDATE auctions 
       SET status = 'ended', 
           winner_id = ?, 
           winning_bid_amount = ?,
           current_price = ?
       WHERE id = ?`,
      [
        buyerId,
        auction.immediate_purchase_price,
        auction.immediate_purchase_price,
        id,
      ]
    );

    res.status(200).json({
      message: "즉시 구매 성공",
      purchaseAmount: auction.immediate_purchase_price,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};
