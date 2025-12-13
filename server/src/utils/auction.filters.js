// 경매 목록 필터링/정렬 쿼리를 재사용하기 위한 헬퍼
// - controller에서 WHERE 절/ORDER BY를 문자열로 조합하는 대신 이 모듈이 책임짐

const buildConditions = (filters = {}) => {
  const { status, category, minPrice, maxPrice } = filters;
  const conds = [];
  const vals = [];

  if (status && status !== "all") {
    if (status === "ended") {
      // 종료: DB status 또는 종료 시간이 현재 시각을 지난 경우 포함
      conds.push("(a.status = 'ended' OR a.end_time <= NOW())");
    } else if (status === "ongoing") {
      conds.push("(a.status = 'ongoing' AND a.end_time > NOW())");
    } else {
      conds.push("a.status = ?");
      vals.push(status);
    }
  }

  if (category) {
    conds.push("c.name = ?");
    vals.push(category);
  }

  if (minPrice != null && minPrice !== "") {
    conds.push("a.current_price >= ?");
    vals.push(Number(minPrice));
  }

  if (maxPrice != null && maxPrice !== "") {
    conds.push("a.current_price <= ?");
    vals.push(Number(maxPrice));
  }

  const whereClause = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
  return { whereClause, values: vals };
};

const buildListQuery = ({ whereClause, orderBy }) => {
  const order = orderBy || "a.created_at DESC";
  return (
    "SELECT " +
    "a.id, a.title, a.description, a.image_url, " +
    "a.start_price, a.current_price, " +
    "CASE WHEN a.end_time <= NOW() THEN 'ended' ELSE a.status END AS status, " +
    "a.start_time, a.end_time, a.created_at, " +
    "u.nickname AS seller_nickname, c.name AS category_name, " +
    "(SELECT COUNT(*) FROM bids b WHERE b.auction_id = a.id) AS bid_count " +
    "FROM auctions a " +
    "LEFT JOIN users u ON a.seller_id = u.id " +
    "LEFT JOIN categories c ON a.category_id = c.id " +
    whereClause +
    ` ORDER BY ${order} LIMIT ? OFFSET ?`
  );
};

module.exports = { buildConditions, buildListQuery };
