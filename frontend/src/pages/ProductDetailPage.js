
// frontend/src/pages/ProductDetailPage.js
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import styles from "./ProductDetailPage.module.css";

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bidAmount, setBidAmount] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchAuction() {
      try {
        const res = await fetch(
          `http://localhost:4000/api/auctions/${id}`
        );

        if (!res.ok) {
          throw new Error("상품을 찾을 수 없습니다.");
        }

        const data = await res.json();
        if (!isMounted) return;

        setProduct(data);
        setBids(data.bids ?? []);
        setLoading(false);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message);
        setLoading(false);
      }
    }

    fetchAuction();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleBidChange = (e) => {
    setBidAmount(e.target.value);
  };

  const handleBidSubmit = (e) => {
    e.preventDefault();
    if (!product) return;

    const value = Number(bidAmount);
    if (Number.isNaN(value) || value <= 0) {
      alert("유효한 금액을 입력하세요.");
      return;
    }

    alert("입찰 API는 추후 연동 예정입니다.");
    setBidAmount("");
  };

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <Header />
        <main className={styles.loadingState}>로딩 중...</main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.errorWrapper}>
        <Header />
        <main className={styles.errorState}>
          <p>{error ?? "상품 정보를 불러올 수 없습니다."}</p>
          <button onClick={() => navigate(-1)}>돌아가기</button>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.content}>
        <section className={styles.gallery}>
          <img
            src={product.image_url}
            alt={product.title}
            className={styles.mainImage}
          />
          <div className={styles.categoryChip}>
            {product.category_name ?? "분류 없음"}
          </div>
        </section>

        <section className={styles.infoPanel}>
          <div className={styles.meta}>
            <p className={styles.seller}>
              판매자 · {product.seller_nickname ?? "익명"}
            </p>
            <h1 className={styles.title}>{product.title}</h1>
            <p className={styles.description}>{product.description}</p>
          </div>

          <div className={styles.statsGrid}>
            <div>
              <span>시작가</span>
              <strong>{Number(product.start_price).toLocaleString()}원</strong>
            </div>
            <div>
              <span>현재가</span>
              <strong>{Number(product.current_price).toLocaleString()}원</strong>
            </div>
            <div>
              <span>즉시구매가</span>
              <strong>
                {product.immediate_purchase_price
                  ? `${Number(
                      product.immediate_purchase_price
                    ).toLocaleString()}원`
                  : "없음"}
              </strong>
            </div>
            <div>
              <span>마감</span>
              <strong>
                {new Date(product.end_time).toLocaleString("ko-KR")}
              </strong>
            </div>
          </div>

          <form className={styles.bidForm} onSubmit={handleBidSubmit}>
            <label>
              입찰 금액
              <input
                type="number"
                min={product.current_price + product.min_bid_increment}
                step={product.min_bid_increment}
                value={bidAmount}
                onChange={handleBidChange}
                placeholder={`${product.min_bid_increment.toLocaleString()}원 단위`}
              />
            </label>
            <button type="submit">입찰하기</button>
          </form>
        </section>
      </main>

      <section className={styles.bidSection}>
        <div className={styles.sectionHeader}>
          <h2>최근 입찰</h2>
          <span>{bids.length}건</span>
        </div>

        {bids.length === 0 ? (
          <div className={styles.emptyBid}>아직 입찰이 없습니다.</div>
        ) : (
          <ul className={styles.bidList}>
            {bids.map((bid) => (
              <li key={bid.id} className={styles.bidItem}>
                <div>
                  <p className={styles.bidder}>{bid.bidder_nickname}</p>
                  <span className={styles.bidTime}>
                    {new Date(bid.created_at).toLocaleString("ko-KR")}
                  </span>
                </div>
                <strong>
                  {Number(bid.amount).toLocaleString()}
                  원
                </strong>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default ProductDetailPage;