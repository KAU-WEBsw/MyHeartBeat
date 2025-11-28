import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import styles from "./AuctionListPage.module.css";
//import placeholder from "../assets/placeholder.svg";
const placeholder = "/assets/placeholder.svg";

const formatCurrency = (value = 0) =>
  `₩${Number(value).toLocaleString("ko-KR")}`;

const timeLeft = (end) => {
  const endDate = new Date(end);
  const diff = endDate.getTime() - Date.now();
  if (diff <= 0) return "종료";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  return `${days}일 ${hours}시간`;
};

const userId = 1; // TODO: 실제 로그인 사용자 ID로 대체

function AuctionListPage() {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [tempMin, setTempMin] = useState("");
  const [tempMax, setTempMax] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchAuctions = async () => {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("pageSize", 9);
    params.append("userId", userId);
    if (statusFilter !== "all") params.append("status", statusFilter);
    if (categoryFilter) params.append("category", categoryFilter);
    if (minPrice) params.append("minPrice", minPrice);
    if (maxPrice) params.append("maxPrice", maxPrice);

    try {
      const res = await fetch(`/api/auctions?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        const items = data.items || [];
        setAuctions(items);
        const total = data.total || items.length;
        const size = data.pageSize || 9;
        setTotalCount(total);
        setTotalPages(Math.max(1, Math.ceil(total / size)));
        // 응답에 포함된 카테고리로 갱신
        const cats = Array.from(
          new Set(items.map((i) => i.category_name).filter(Boolean))
        );
        if (cats.length) setCategories(cats);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/auctions/categories");
      const data = await res.json();
      if (res.ok && Array.isArray(data.categories)) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchAuctions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, categoryFilter, minPrice, maxPrice, page]);

  const toggleLike = async (auctionId, liked) => {
    try {
      const res = await fetch("/api/likes", {
        method: liked ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, auctionId }),
      });
      if (res.ok) {
        setAuctions((prev) =>
          prev.map((a) =>
            a.id === auctionId ? { ...a, liked: liked ? 0 : 1 } : a
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = useMemo(() => auctions, [auctions]);

  const handleCategory = (cat) => {
    setCategoryFilter(cat === categoryFilter ? "" : cat);
    setPage(1);
  };

  const handlePriceApply = () => {
    setMinPrice(tempMin || "");
    setMaxPrice(tempMax || "");
    setPage(1);
  };

  const pages = useMemo(() => {
    const arr = [];
    const maxButtons = 5;
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + maxButtons - 1);
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }, [page, totalPages]);

  const categoryList = categories.length
    ? categories
    : ["전자제품", "패션", "미술품", "기타"];

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.content}>
        <aside className={styles.sidebar}>
          <button
            className={styles.primaryButton}
            onClick={() => navigate("/auction/new")}
          >
            상품 등록하기
          </button>

          <div className={styles.cardBox}>
            <h4>카테고리</h4>
            <ul>
              {categoryList.map((cat) => (
                <li
                  key={cat}
                  className={
                    categoryFilter === cat ? styles.categoryActive : ""
                  }
                  onClick={() => handleCategory(cat)}
                >
                  {cat}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.cardBox}>
            <h4>필터</h4>
            <div className={styles.filterRow}>
              <span>가격 범위</span>
              <div className={styles.priceInputs}>
                <input
                  type="number"
                  placeholder="최소"
                  value={tempMin}
                  onChange={(e) => setTempMin(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="최대"
                  value={tempMax}
                  onChange={(e) => setTempMax(e.target.value)}
                />
                <button className={styles.applyBtn} onClick={handlePriceApply}>
                  적용
                </button>
              </div>
              <div className={styles.sliderValue}>
                {minPrice || maxPrice
                  ? `${minPrice || 0} ~ ${maxPrice || "∞"}`
                  : "₩0 ~ 제한 없음"}
              </div>
            </div>
            <div className={styles.filterRow}>
              <span>경매 상태</span>
              {["all", "ongoing", "ended"].map((s) => (
                <label key={s} className={styles.checkbox}>
                  <input
                    type="radio"
                    name="status"
                    checked={statusFilter === s}
                    onChange={() => {
                      setStatusFilter(s);
                      setPage(1);
                    }}
                  />
                  <span>
                    {s === "all" ? "전체" : s === "ongoing" ? "진행중" : "종료"}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        <section className={styles.mainArea}>
          <div className={styles.listHeader}>
            <div>
              <h2>경매 목록</h2>
              <p>총 {totalCount}개의 경매가 진행중입니다</p>
            </div>
            <select className={styles.sortSelect} defaultValue="latest">
              <option value="latest">최신순</option>
              <option value="popular">입찰수 많은 순</option>
              <option value="price">가격 높은 순</option>
            </select>
          </div>

          <div className={styles.grid}>
            {filtered.map((item) => {
              const ended =
                item.status === "ended" || timeLeft(item.end_time) === "종료";
              return (
                <article className={styles.card} key={item.id}>
                  <div className={styles.cardImage}>
                    <img src={item.image_url || placeholder} alt={item.title} />
                    <span
                      className={`${styles.status} ${
                        ended ? styles.statusEnded : styles.statusOngoing
                      }`}
                    >
                      {ended ? "종료" : "입찰중"}
                    </span>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.cardTop}>
                      <div>
                        <p className={styles.category}>
                          {item.category_name || "카테고리"}
                        </p>
                        <h3>{item.title}</h3>
                      </div>
                      <button
                        className={`${styles.wish} ${
                          item.liked ? styles.wishActive : ""
                        }`}
                        onClick={() => toggleLike(item.id, Boolean(item.liked))}
                      >
                        {item.liked ? "❤" : "♡"}
                      </button>
                    </div>
                    <div className={styles.meta}>
                      <div>
                        <p className={styles.label}>현재 입찰가</p>
                        <p className={styles.price}>
                          {formatCurrency(item.current_price)}
                        </p>
                      </div>
                      <div className={styles.metaCol}>
                        <p className={styles.label}>입찰 수</p>
                        <p>{item.bid_count || 0}</p>
                      </div>
                      <div className={styles.metaCol}>
                        <p className={styles.label}>남은 시간</p>
                        <p className={ended ? styles.danger : undefined}>
                          {timeLeft(item.end_time)}
                        </p>
                      </div>
                    </div>
                    <button
                      className={styles.bidButton}
                      disabled={ended}
                      onClick={() => navigate(`/product/${item.id}`)}
                    >
                      {ended ? "종료됨" : "입찰하기"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <div className={styles.pagination}>
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              &lt;
            </button>
            {pages.map((num) => (
              <button
                key={num}
                className={num === page ? styles.activePage : ""}
                onClick={() => setPage(num)}
              >
                {num}
              </button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              &gt;
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AuctionListPage;
