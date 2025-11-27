//이름바꾸었음 auctionFilters.js에서

const buildConditions = (filters = {}) => {
  const { status, category, minPrice, maxPrice } = filters;
  const conds = [];
  const vals = [];

  if (status && status !== "all") {
    conds.push("a.status = ?");
    vals.push(status);
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

const buildListQuery = ({ withLikes, whereClause }) => {
  const likedSelect = withLikes
    ? ", IF(EXISTS(SELECT 1 FROM likes l WHERE l.auction_id = a.id AND l.user_id = ?), 1, 0) AS liked "
    : ", 0 AS liked ";

  return (
    "SELECT " +
    "a.id, a.title, a.description, a.image_url, " +
    "a.start_price, a.current_price, a.status, a.start_time, a.end_time, a.created_at, " +
    "u.nickname AS seller_nickname, c.name AS category_name, " +
    "(SELECT COUNT(*) FROM bids b WHERE b.auction_id = a.id) AS bid_count " +
    likedSelect +
    "FROM auctions a " +
    "LEFT JOIN users u ON a.seller_id = u.id " +
    "LEFT JOIN categories c ON a.category_id = c.id " +
    whereClause +
    " ORDER BY a.created_at DESC LIMIT ? OFFSET ?"
  );
};

module.exports = { buildConditions, buildListQuery };