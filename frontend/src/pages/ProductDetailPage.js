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
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

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

  // 타이머 계산
  useEffect(() => {
    if (!product?.end_time) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(product.end_time).getTime();
      const difference = end - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [product?.end_time]);

  const handleBidChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setBidAmount(value);
  };

  const formatBidAmount = (value) => {
    if (!value) return "";
    return Number(value).toLocaleString();
  };

  const handleBidSubmit = (e) => {
    e.preventDefault();
    if (!product) return;

    const value = Number(bidAmount.replace(/,/g, ""));
    if (Number.isNaN(value) || value <= 0) {
      alert("유효한 금액을 입력하세요.");
      return;
    }

    // 입찰가는 현재가보다 높아야 함
    if (value <= product.current_price) {
      alert(`입찰가는 현재가(${product.current_price.toLocaleString()}원)보다 높아야 합니다.`);
      return;
    }

    alert("입찰 API는 추후 연동 예정입니다.");
    setBidAmount("");
  };

  const handleImmediatePurchase = () => {
    if (!product?.immediate_purchase_price) {
      alert("즉시 구매가가 설정되지 않았습니다.");
      return;
    }
    alert("즉시 구매 API는 추후 연동 예정입니다.");
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.loadingState}>로딩 중...</main>
      </div>
    );
  }

  
  if (error || !product) {
    return (
      <div className={styles.page}>
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
      
      <main className={styles.main}>
        {/* Breadcrumb Navigation */}
        <nav className={styles.breadcrumb}>
          <span onClick={() => navigate("/")}>Home</span>
          <span className={styles.breadcrumbSeparator}>›</span>
          <span className={styles.breadcrumbCurrent}>{product.category_name || "Art & Collectibles"}</span>
        </nav>

        <div className={styles.content}>
          {/* Left: Image Gallery */}
          <section className={styles.gallery}>
            <div className={styles.imageContainer}>
              <img
                src={product.image_url}
                alt={product.title}
                className={styles.mainImage}
              />
            </div>
          </section>

          {/* Right: Product Info & Seller Info */}
          <div className={styles.rightColumn}>
            {/* Product Info */}
            <section className={styles.infoPanel}>
              <div className={styles.productInfo}>
                <h1 className={styles.title}>{product.title}</h1>

                <div className={styles.priceInfo}>
                  <div className={styles.priceRow}>
                    <span className={styles.priceLabel}>현재 가격</span>
                    <span className={styles.currentPrice}>
                      {Number(product.current_price).toLocaleString()}원
                    </span>
                  </div>
                  <div className={styles.priceRow}>
                    <span className={styles.priceLabel}>즉시 구매가</span>
                    <span className={styles.immediatePrice}>
                      {product.immediate_purchase_price
                        ? `${Number(product.immediate_purchase_price).toLocaleString()}원`
                        : "없음"}
                    </span>
                  </div>
                  <div className={styles.priceRow}>
                    <span className={styles.priceLabel}>시작가</span>
                    <span className={styles.startPrice}>
                      {Number(product.start_price).toLocaleString()}원
                    </span>
                  </div>
                </div>

                {/* Timer */}
                <div className={styles.timerBox}>
                  <div className={styles.timerLabel}>남은 경매 시간</div>
                  <div className={styles.timer}>
                    <div className={styles.timerUnit}>
                      <div className={styles.timerValue}>{String(timeLeft.days).padStart(2, "0")}</div>
                      <div className={styles.timerLabel}>일</div>
                    </div>
                    <div className={styles.timerUnit}>
                      <div className={styles.timerValue}>{String(timeLeft.hours).padStart(2, "0")}</div>
                      <div className={styles.timerLabel}>시</div>
                    </div>
                    <div className={styles.timerUnit}>
                      <div className={styles.timerValue}>{String(timeLeft.minutes).padStart(2, "0")}</div>
                      <div className={styles.timerLabel}>분</div>
                    </div>
                    <div className={styles.timerUnit}>
                      <div className={styles.timerValue}>{String(timeLeft.seconds).padStart(2, "0")}</div>
                      <div className={styles.timerLabel}>초</div>
                    </div>
                  </div>
                </div>

                {/* Bid Form */}
                <div className={styles.bidSection}>
                  <label className={styles.bidLabel}>희망 입찰가</label>
                  <form className={styles.bidForm} onSubmit={handleBidSubmit}>
                    <div className={styles.bidInputWrapper}>
                      <span className={styles.currencySymbol}>₩</span>
                      <input
                        type="text"
                        value={formatBidAmount(bidAmount)}
                        onChange={handleBidChange}
                        placeholder="13,000"
                        className={styles.bidInput}
                      />
                      <button type="submit" className={styles.bidButton}>
                        입찰
                      </button>
                    </div>
                  </form>
                  <div className={styles.bidderCount}>입찰자 : {bids.length}명</div>
                </div>

                {/* Immediate Purchase Button */}
                {product.immediate_purchase_price && (
                  <button 
                    className={styles.immediatePurchaseButton}
                    onClick={handleImmediatePurchase}
                  >
                    즉시 구매하기
                  </button>
                )}
              </div>
            </section>

            {/* Seller Info */}
            <section className={styles.sellerInfo}>
              <h3 className={styles.sellerTitle}>판매자 정보</h3>
              <div className={styles.sellerProfile}>
                <div className={styles.sellerAvatar}>
                  {product.seller_nickname?.[0] || "?"}
                </div>
                <div className={styles.sellerDetails}>
                  <div className={styles.sellerName}>{product.seller_nickname || "익명"}</div>
                </div>
              </div>
              <div className={styles.sellerStats}>
                <span>경매 개수</span>
                <span className={styles.sellerStatValue}>1,247</span>
              </div>
            </section>
          </div>
        </div>

        {/* Product Description */}
        <section className={styles.descriptionSection}>
          <h2 className={styles.descriptionTitle}>물품 설명</h2>
          <div className={styles.descriptionContent}>
            <p>
              {product.description || 
                "This exquisite 19th-century oil painting depicts a serene landscape scene featuring rolling mountains, a tranquil lake, and dramatic cloud formations. The artwork showcases the romantic style characteristic of the period, with rich earth tones and masterful use of light and shadow."}
            </p>
            <p>
              The painting is housed in its original ornate gilt frame, which shows some age-appropriate wear but remains structurally sound. The canvas has been professionally cleaned and shows excellent color retention throughout.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default ProductDetailPage;
