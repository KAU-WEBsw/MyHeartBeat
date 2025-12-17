import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import styles from "./ProductDetailPage.module.css";

// 경매 상품 상세 페이지
function ProductDetailPage() {
  const { id } = useParams(); // URL에서 상품 ID 추출
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [bids, setBids] = useState([]);
  const [error, setError] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [user, setUser] = useState(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // 로그인 사용자 정보 가져오기 (컴포넌트 마운트 시)
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (err) {}
    }
  }, []);

  // 경매 정보 가져오기 (id 변경 시 재실행)
  useEffect(() => {
    async function fetchAuction() {
      try {
        const res = await fetch(`/api/auctions/${id}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("상품을 찾을 수 없습니다.");
        const data = await res.json();
        setProduct(data);
        setBids(data.bids || []);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchAuction();
  }, [id]);

  // 남은 시간 계산 (1초마다 업데이트)
  useEffect(() => {
    if (!product || !product.end_time || product.status === "ended") return;

    const calculateTimeLeft = async () => {
      const now = new Date().getTime();
      const end = new Date(product.end_time).getTime();
      const difference = end - now;

      // 경매 종료 시 최신 정보 다시 불러오기
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        try {
          const res = await fetch(`/api/auctions/${id}`, {
            credentials: "include",
          });
          const data = await res.json();
          setProduct(data);
          setBids(data.bids || []);
        } catch (error) {}
        return;
      }

      // 밀리초 → 일/시/분/초 변환
      const oneSecond = 1000;
      const oneMinute = oneSecond * 60;
      const oneHour = oneMinute * 60;
      const oneDay = oneHour * 24;

      const days = Math.floor(difference / oneDay);
      const remainingAfterDays = difference % oneDay;
      const hours = Math.floor(remainingAfterDays / oneHour);
      const remainingAfterHours = remainingAfterDays % oneHour;
      const minutes = Math.floor(remainingAfterHours / oneMinute);
      const remainingAfterMinutes = remainingAfterHours % oneMinute;
      const seconds = Math.floor(remainingAfterMinutes / oneSecond);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval); // 컴포넌트 언마운트 시 타이머 정리
  }, [product, id]);

  // 입찰 금액 입력 핸들러
  const handleBidChange = (e) => {
    setBidAmount(e.target.value);
  };

  // 입찰하기
  const handleBidSubmit = async (e) => {
    e.preventDefault(); // 폼 기본 동작(새로고침) 방지
    if (!product) return;

    if (!user) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    // 입찰가 유효성 검사
    const value = Number(bidAmount);
    if (!value || value <= 0) return alert("유효한 금액을 입력하세요.");
    if (value <= product.current_price) return alert("입찰가는 현재가보다 높아야 합니다.");

    try {
      const res = await fetch(`/api/auctions/${id}/bids`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bidderId: user.id, amount: value }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message || "입찰 실패");

      alert("입찰 성공!");
      setBidAmount("");

      // 최신 정보 다시 불러오기
      const refreshRes = await fetch(`/api/auctions/${id}`, { 
        credentials: "include" 
      });
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setProduct(refreshData);
        setBids(refreshData.bids || []);
      }
    } catch {
      alert("서버 오류가 발생했습니다.");
    }
  };

  // 즉시 구매하기
  const handleImmediatePurchase = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    if (!window.confirm("즉시 구매하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/auctions/${id}/purchase`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buyerId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message || "즉시 구매 실패");

      alert("즉시 구매 성공!");

      // 최신 정보 다시 불러오기
      const refreshRes = await fetch(`/api/auctions/${id}`, {
        credentials: "include",
      });
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setProduct(refreshData);
        setBids(refreshData.bids || []);
      }
    } catch {
      alert("서버 오류가 발생했습니다.");
    }
  };

  // 에러 또는 로딩 상태
  if (error || !product) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.errorState}>
          <p>{error || "상품 정보를 불러올 수 없습니다."}</p>
        </main>
      </div>
    );
  }

  // 메인 UI
  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <div className={styles.content}>
          {/* 상품 이미지 */}
          <section className={styles.gallery}>
            <div className={styles.imageContainer}>
              <img
                src={product.image_url}
                alt={product.title}
                className={styles.mainImage}
              />
            </div>
          </section>

          <div className={styles.rightColumn}>
            {/* 상품 정보 */}
            <section className={styles.infoPanel}>
              <div className={styles.productInfo}>
                <div className={styles.category}>{product.category_name}</div>
                <h1 className={styles.title}>{product.title}</h1>

                {/* 가격 정보 */}
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

                {/* 경매 상태에 따른 표시 */}
                {product.status === "ended" ? (
                  <div className={styles.timerBox}>
                    <div className={styles.endedInfo}>
                      <div className={styles.winningPrice}>
                        경매 종료 낙찰가 :{" "}
                        {Number(product.winning_bid_amount || product.current_price).toLocaleString()}원
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

                {/* 입찰 섹션 (경매 진행 중일 때만) */}
                {product.status !== "ended" && (
                  <>
                    <div className={styles.bidSection}>
                      <label className={styles.bidLabel}>희망 입찰가</label>
                      <form className={styles.bidForm} onSubmit={handleBidSubmit}>
                        <div className={styles.bidInputWrapper}>
                          <input
                            type="text"
                            value={bidAmount}
                            onChange={handleBidChange}
                            className={styles.bidInput}
                          />
                          <button type="submit" className={styles.bidButton}>
                            입찰
                          </button>
                        </div>
                      </form>
                      <div className={styles.bidderCount}>입찰 : {bids.length}회</div>
                    </div>

                    {/* 즉시 구매 버튼 */}
                    {product.immediate_purchase_price && (
                      <button
                        className={styles.immediatePurchaseButton}
                        onClick={handleImmediatePurchase}
                        disabled={
                          Number(product.immediate_purchase_price) <
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

            {/* 판매자 정보 */}
            <section className={styles.sellerInfo}>
              <div className={styles.sellerRow}>
                <span className={styles.sellerTitle}>판매자 정보</span>
                <span className={styles.sellerName}>{product.seller_nickname}</span>
              </div>
            </section>
          </div>
        </div>

        {/* 상품 설명 */}
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
