// frontend/src/pages/ProductDetailPage.js
// 경매 상품 상세 페이지 컴포넌트
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import styles from "./ProductDetailPage.module.css";

function ProductDetailPage() {
  const { id } = useParams(); // URL에서 경매 ID 가져오기
  const navigate = useNavigate();

  // 상태 관리
  const [product, setProduct] = useState(null); // 경매 상품 정보
  const [bids, setBids] = useState([]); // 입찰 내역
  const [error, setError] = useState(null); // 에러 상태
  const [bidAmount, setBidAmount] = useState(""); // 입찰 금액 입력값
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  }); // 남은 시간

  // 경매 정보 조회
  useEffect(() => {
    let isMounted = true;

    async function fetchAuction() {
      try {
        const res = await fetch(`http://localhost:4000/api/auctions/${id}`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("상품을 찾을 수 없습니다.");
        }

        const data = await res.json();
        if (!isMounted) return;

        setProduct(data);
        setBids(data.bids ?? []);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message);
      }
    }

    fetchAuction();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // 타이머 계산
  useEffect(() => {
    if (!product?.end_time || product.status === "ended") return;

    const calculateTimeLeft = async () => {
      const now = new Date().getTime();
      const end = new Date(product.end_time).getTime();
      const difference = end - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        // 경매 시간이 끝나면 경매 정보 다시 불러오기 (자동 종료 처리)
        try {
          const res = await fetch(`http://localhost:4000/api/auctions/${id}`);
          if (res.ok) {
            const data = await res.json();
            setProduct(data);
            setBids(data.bids ?? []);
          }
        } catch (error) {
          console.error(error);
        }
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [product?.end_time, product?.status, id]);

  // 입찰 금액 입력 핸들러 (숫자만 허용)
  const handleBidChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setBidAmount(value);
  };

  // 입찰 금액 포맷팅 (천 단위 콤마)
  const formatBidAmount = (value) => {
    if (!value) return "";
    return Number(value).toLocaleString();
  };

  // 입찰하기 핸들러
  const handleBidSubmit = async (e) => {
    e.preventDefault();
    if (!product) return;

    const value = Number(bidAmount.replace(/,/g, ""));
    if (Number.isNaN(value) || value <= 0) {
      alert("유효한 금액을 입력하세요.");
      return;
    }

    // 입찰가는 현재가보다 높아야 함
    if (value <= product.current_price) {
      alert(
        `입찰가는 현재가(${product.current_price.toLocaleString()}원)보다 높아야 합니다.`
      );
      return;
    }

    const bidderId = 2; // TODO: 실제 로그인한 사용자 ID로 변경

    try {
      const res = await fetch(`http://localhost:4000/api/auctions/${id}/bids`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: value,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "입찰 실패");
        return;
      }

      alert("입찰 성공!");
      setBidAmount("");

      // 경매 정보 다시 불러오기
      const refreshRes = await fetch(
        `http://localhost:4000/api/auctions/${id}`,
        { credentials: "include" }
      );
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setProduct(refreshData);
        setBids(refreshData.bids ?? []);
      }
    } catch (error) {
      console.error(error);
      alert("서버 오류가 발생했습니다.");
    }
  };

  // 즉시 구매하기 핸들러
  const handleImmediatePurchase = async () => {
    // 즉시 구매가가 현재가보다 작거나 같으면 불가
    if (
      Number(product.immediate_purchase_price) <= Number(product.current_price)
    ) {
      alert("현재가가 즉시 구매가보다 높아 즉시 구매할 수 없습니다.");
      return;
    }

    const buyerId = 2; // TODO: 실제 로그인한 사용자 ID로 변경

    if (
      !window.confirm(
        `정말 ${Number(
          product.immediate_purchase_price
        ).toLocaleString()}원에 즉시 구매하시겠습니까?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:4000/api/auctions/${id}/purchase`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "즉시 구매 실패");
        return;
      }

      alert("즉시 구매 성공!");

      // 경매 정보 다시 불러오기
      const refreshRes = await fetch(
        `http://localhost:4000/api/auctions/${id}`,
        { credentials: "include" }
      );
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setProduct(refreshData);
        setBids(refreshData.bids ?? []);
      }
    } catch (error) {
      console.error(error);
      alert("서버 오류가 발생했습니다.");
    }
  };

  // 에러 또는 상품 정보가 없을 때
  if (error || !product) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.errorState}>
          <p>{error ?? "상품 정보를 불러올 수 없습니다."}</p>
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
          <span className={styles.breadcrumbCurrent}>
            {product.category_name}
          </span>
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
                        ? `${Number(
                            product.immediate_purchase_price
                          ).toLocaleString()}원`
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

                {/* Timer or Ended Status */}
                {product.status === "ended" ? (
                  <div className={styles.timerBox}>
                    <div className={styles.timerLabel}>경매 종료</div>
                    <div className={styles.endedInfo}>
                      <div className={styles.winningPrice}>
                        낙찰가:{" "}
                        {Number(
                          product.winning_bid_amount || product.current_price
                        ).toLocaleString()}
                        원
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.timerBox}>
                    <div className={styles.timerLabel}>남은 경매 시간</div>
                    <div className={styles.timer}>
                      {String(timeLeft.days).padStart(2, "0")}일{" "}
                      {String(timeLeft.hours).padStart(2, "0")}시{" "}
                      {String(timeLeft.minutes).padStart(2, "0")}분{" "}
                      {String(timeLeft.seconds).padStart(2, "0")}초
                    </div>
                  </div>
                )}

                {/* Bid Form */}
                {product.status !== "ended" && (
                  <>
                    <div className={styles.bidSection}>
                      <label className={styles.bidLabel}>희망 입찰가</label>
                      <form
                        className={styles.bidForm}
                        onSubmit={handleBidSubmit}
                      >
                        <div className={styles.bidInputWrapper}>
                          <input
                            type="text"
                            value={formatBidAmount(bidAmount)}
                            onChange={handleBidChange}
                            className={styles.bidInput}
                          />
                          <button type="submit" className={styles.bidButton}>
                            입찰
                          </button>
                        </div>
                      </form>
                      <div className={styles.bidderCount}>
                        입찰자 : {bids.length}명
                      </div>
                    </div>

                    {/* Immediate Purchase Button */}
                    {product.immediate_purchase_price && (
                      <button
                        className={styles.immediatePurchaseButton}
                        onClick={handleImmediatePurchase}
                        disabled={
                          Number(product.immediate_purchase_price) <=
                          Number(product.current_price)
                        }
                      >
                        즉시 구매하기
                      </button>
                    )}
                  </>
                )}
              </div>
            </section>

            {/* Seller Info */}
            <section className={styles.sellerInfo}>
              <div className={styles.sellerRow}>
                <span className={styles.sellerTitle}>판매자 정보</span>
                <span className={styles.sellerName}>
                  {product.seller_nickname || "익명"}
                </span>
              </div>
            </section>
          </div>
        </div>

        {/* Product Description */}
        <section className={styles.descriptionSection}>
          <h2 className={styles.descriptionTitle}>물품 설명</h2>
          <div className={styles.descriptionContent}>
            <p>{product.description || "설명이 없습니다."}</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default ProductDetailPage;
