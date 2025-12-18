// MySQL 연결 풀을 가져옵니다.
const db = require("../config/db");
// 물품 목록 - 필터 (utils/auction.filters/js)
const { buildConditions, buildListQuery } = require("../utils/auction.filters");
// 만료된 경매를 일괄 종료하고 낙찰 정보까지 반영하는 유틸
const { closeExpiredAuctions } = require("../utils/auction.closer");

// ==========================================================
// 🟦 신규 경매 등록 API (POST /api/auctions)
// ==========================================================
exports.createAuction = async (req, res) => {
  try {
    // 프론트에서 보내는 여러 필드명(camelCase / snake_case) 대비
    const raw = req.body || {};

    // 디버깅 로그: 들어오는 폼/파일/세션 정보를 빠르게 확인하기 위함
    console.log("--- createAuction body ---", raw);
    console.log("--- createAuction file ---", req.file);
    console.log("--- createAuction headers cookie ---", req.headers?.cookie);
    console.log("--- createAuction session user ---", req.session?.user);
    const title = raw.title ?? raw.name;
    const categoryId = raw.categoryId ?? raw.category ?? raw.category_id;
    const description = raw.description ?? raw.desc;
    const imageUrl = raw.imageUrl ?? raw.image_url;
    const startPrice = raw.startPrice ?? raw.start_price;
    const immediatePurchasePrice =
      raw.immediatePurchasePrice ?? raw.immediate_purchase_price;
    const endTime = raw.endTime ?? raw.end_time;
    const sellerIdFromBody = raw.sellerId ?? raw.seller_id ?? raw.seller;

    // 업로드 파일이 있으면 우선 사용
    const finalImageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : imageUrl || null;

    // 세션에서 판매자 아이디 우선, 없으면 바디에서(여러 위치 허용)
    const sessionSellerId =
      req.session?.user?.id ??
      req.session?.userId ??
      req.session?.user?.userId ??
      null;
    const parsedSellerId =
      sessionSellerId != null
        ? Number(sessionSellerId)
        : sellerIdFromBody != null && sellerIdFromBody !== ""
        ? Number(sellerIdFromBody)
        : null;

    // 숫자 필드 안전 변환
    const parsedCategoryId =
      categoryId != null && categoryId !== "" ? Number(categoryId) : null;
    const parsedStartPrice =
      startPrice != null && startPrice !== "" ? Number(startPrice) : null;
    const parsedImmediate =
      immediatePurchasePrice != null && immediatePurchasePrice !== ""
        ? Number(immediatePurchasePrice)
        : null;

    // 검증: 즉시구매가가 주어졌으면 시작가보다 크거나 같아야 함
    if (
      parsedImmediate != null &&
      parsedStartPrice != null &&
      Number(parsedImmediate) < Number(parsedStartPrice)
    ) {
      return res
        .status(400)
        .json({ message: "즉시구매가는 시작가보다 크거나 같아야 합니다." });
    }

    // 필수값 체크: parsedSellerId 는 null/undefined 검사
    if (
      parsedSellerId == null ||
      !title ||
      parsedCategoryId == null ||
      parsedStartPrice == null ||
      !endTime
    ) {
      return res.status(400).json({ message: "필수 값이 누락되었습니다." });
    }

    const status = "ongoing";
    const currentPrice = parsedStartPrice;
    // 판매자 정보(닉네임)를 users 테이블에서 조회하여 같이 저장
    let sellerNickname = null;
    try {
      const [userRows] = await db.query(
        `SELECT nickname FROM users WHERE id = ? LIMIT 1`,
        [parsedSellerId]
      );
      if (userRows && userRows.length > 0) {
        sellerNickname = userRows[0].nickname || null;
      }
    } catch (err) {
      console.warn("failed to fetch seller info", err);
    }

    const [result] = await db.query(
      `INSERT INTO auctions
        (seller_id, seller_nickname, category_id, title, description, image_url,
         start_price, current_price,
         immediate_purchase_price, status, end_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        parsedSellerId,
        sellerNickname,
        parsedCategoryId || null,
        title,
        description || null,
        finalImageUrl,
        parsedStartPrice,
        currentPrice,
        parsedImmediate || null,
        status,
        endTime,
      ]
    );

    res.status(201).json({
      message: "경매 등록 성공",
      auctionId: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};


// 상품 상세 조회 (GET /api/auctions/:id)
exports.getAuctionById = async (req, res) => {
  try {
    const { id } = req.params; // URL에서 상품 ID 추출

    await closeExpiredAuctions(); // 만료된 경매 자동 종료 처리

    // 상품 정보 조회 (판매자 닉네임, 카테고리명 JOIN)
    const [auctions] = await db.query(
      `SELECT a.*, u.nickname as seller_nickname, c.name as category_name
       FROM auctions a
       LEFT JOIN users u ON a.seller_id = u.id
       LEFT JOIN categories c ON a.category_id = c.id
       WHERE a.id = ?`,
      [id]
    );

    if (auctions.length === 0) {
      return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
    }
    const auction = auctions[0];

    // 입찰 내역 조회 (최신순 정렬)
    const [bids] = await db.query(
      `SELECT b.*, u.nickname as bidder_nickname
       FROM bids b
       LEFT JOIN users u ON b.bidder_id = u.id
       WHERE b.auction_id = ?
       ORDER BY b.created_at DESC`,
      [id]
    );

    // 현재가 계산
    let currentPrice;
    if (auction.status === "ended") {
      currentPrice = Number(auction.current_price); // 종료: DB에 저장된 최종 가격
    } else if (bids.length > 0) {
      // 입찰 목록에서 최고가 찾기
      let maxBid = 0;
      for (const bid of bids) {
        if (Number(bid.amount) > maxBid) {
          maxBid = Number(bid.amount);
        }
      }
      currentPrice = maxBid;
    } else {
      currentPrice = Number(auction.start_price); // 입찰 없음: 시작가
    }

    // 응답 데이터 구성 후 전송
    auction.current_price = currentPrice;
    auction.bids = bids;
    res.json(auction);
  } catch (error) {
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
    await closeExpiredAuctions(); // 목록 조회 전에 만료분 정리 후 최신 상태 반환

    const {
      status,
      category,
      minPrice,
      maxPrice,
      page = 1,
      pageSize = 9,
      sort = "latest",
    } = req.query;

    // page/pageSize는 문자열로 들어오기 때문에 Number 변환 후 최소 1로 클램프
    const pageNum = Math.max(1, Number(page) || 1);
    const size = Math.max(1, Number(pageSize) || 9);
    const offset = (pageNum - 1) * size;

    // WHERE 절 생성을 utils로 위임하여 동일 로직을 여러 컨트롤러에서 재사용
    const filter = buildConditions({ status, category, minPrice, maxPrice });

    // sortMap: 프론트 select 옵션(latest/popular/price/endingSoon)에 대응
    const sortMap = {
      latest: "a.created_at DESC",
      popular:
        "(SELECT COUNT(*) FROM bids b WHERE b.auction_id = a.id) DESC, a.created_at DESC",
      price: "a.current_price DESC, a.created_at DESC",
      endingSoon: "a.end_time ASC, a.created_at DESC",
    };
    const orderBy = sortMap[sort] || sortMap.latest;

    // countSql: 위 filter.whereClause를 공유해 전체 개수(total)를 계산
    const countSql =
      "SELECT COUNT(*) AS total FROM auctions a LEFT JOIN categories c ON a.category_id = c.id " +
      filter.whereClause;
    const [countRows] = await db.query(countSql, filter.values);
    const total = countRows?.[0]?.total || 0;

    const selectSql = buildListQuery({
      whereClause: filter.whereClause,
      orderBy,
    });
    const items = await db
      .query(selectSql, [...filter.values, size, offset])
      .then((r) => r[0]);

    res.json({ total, page: pageNum, pageSize: size, items }); // 프론트 목록 카드가 그대로 사용
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
    // 프론트 사이드바는 단순 문자열 배열만 필요하므로 name 컬럼만 추출
    res.json({ categories: rows.map((r) => r.name) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "카테고리를 불러오지 못했습니다." });
  }
};

// 입찰하기 (POST /api/auctions/:id/bids)
// 프론트에서 fetch('/api/auctions/5/bids', { method: 'POST', body: { bidderId, amount } }) 형태로 호출
exports.createBid = async (req, res) => {
  try {
    // URL에서 경매 ID 추출, body에서 입찰자 ID와 금액 추출
    const { id } = req.params;
    const { bidderId, amount } = req.body;

    // 경매 조회
    const [rows] = await db.query("SELECT * FROM auctions WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "경매를 찾을 수 없습니다." });
    }
    const auction = rows[0];

    // 유효성 검사
    if (auction.status !== "ongoing") {
      return res.status(400).json({ message: "종료된 경매입니다." }); // DB 상태 체크
    }
    if (new Date() >= new Date(auction.end_time)) {
      return res.status(400).json({ message: "경매가 종료되었습니다." }); // 실제 시간 체크
    }
    if (Number(auction.seller_id) === Number(bidderId)) {
      return res.status(400).json({ message: "자신의 경매에는 입찰할 수 없습니다." }); // 본인 입찰 방지
    }

    // 최소 입찰가 확인 (현재 최고 입찰가 조회)
    const [bidRows] = await db.query(
      "SELECT MAX(amount) as max_amount FROM bids WHERE auction_id = ?",
      [id]
    );
    let minBid;
    if (bidRows[0].max_amount) {
      minBid = Number(bidRows[0].max_amount); // 입찰 있음: 최고가
    } else {
      minBid = Number(auction.start_price); // 입찰 없음: 시작가
    }
    
    // 새 입찰가는 현재 최고가보다 높아야 함
    if (Number(amount) <= minBid) {
      return res.status(400).json({ 
        message: `입찰 금액은 ${minBid.toLocaleString()}원보다 높아야 합니다.` 
      });
    }

    // 입찰 저장 (bids 테이블에 새 레코드 추가)
    const [result] = await db.query(
      "INSERT INTO bids (auction_id, bidder_id, amount) VALUES (?, ?, ?)",
      [id, bidderId, amount]
    );
    // 경매 현재가 업데이트
    await db.query("UPDATE auctions SET current_price = ? WHERE id = ?", [amount, id]);

    // 성공 응답 (201: Created - 새 리소스 생성됨)
    res.status(201).json({ message: "입찰 성공", bidId: result.insertId, amount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 즉시 구매하기 (POST /api/auctions/:id/purchase)
// 즉시 구매가로 경매를 바로 구매하고 종료 처리
exports.purchaseAuction = async (req, res) => {
  try {
    const { id } = req.params; // URL에서 경매 ID 추출
    const { buyerId } = req.body; // body에서 구매자 ID 추출

    // 필수값 확인
    if (!buyerId) {
      return res.status(400).json({ message: "구매자 ID를 입력해주세요." });
    }

    // 경매 조회
    const [rows] = await db.query("SELECT * FROM auctions WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "경매를 찾을 수 없습니다." });
    }
    const auction = rows[0];

    // 유효성 검사
    if (auction.status !== "ongoing") {
      return res.status(400).json({ message: "종료된 경매입니다." }); // DB 상태 체크
    }
    if (new Date() >= new Date(auction.end_time)) {
      return res.status(400).json({ message: "경매가 종료되었습니다." }); // 실제 시간 체크
    }
    if (!auction.immediate_purchase_price) {
      return res.status(400).json({ message: "즉시 구매가가 설정되지 않았습니다." }); // 즉시구매가 없음
    }
    if (Number(auction.seller_id) === Number(buyerId)) {
      return res.status(400).json({ message: "자신의 경매는 즉시 구매할 수 없습니다." }); // 본인 구매 방지
    }

    // 경매 종료 처리
    await db.query(
      `UPDATE auctions SET status = 'ended', winner_id = ?, winning_bid_amount = ?, current_price = ? WHERE id = ?`,
      [buyerId, auction.immediate_purchase_price, auction.immediate_purchase_price, id]
    );

    // 성공 응답 (200: OK)
    res.status(200).json({ message: "즉시 구매 성공", purchaseAmount: auction.immediate_purchase_price });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};
