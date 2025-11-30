//이름바꾸었음 auctionFilters.js에서

const buildConditions = (filters = {}) => {
  const { status, category, minPrice, maxPrice } = filters;
  const conds = [];
  const vals = [];

  if (status && status !== "all") {
    if (status === "ended") {
      // treat anything past 종료시간 as 종료로 간주
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
  if (minPrice) {
    conds.push("a.current_price >= ?");
    vals.push(Number(minPrice));
  }
  if (maxPrice) {
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
