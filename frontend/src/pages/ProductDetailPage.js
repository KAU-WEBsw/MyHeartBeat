import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import styles from "./ProductDetailPage.module.css";

function ProductDetailPage() {
  const { id } = useParams();
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

  // 로그인한 사용자 정보 가져오기
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch (err) {
        console.error("사용자 정보 오류:", err);
      }
    }
  }, []);

  // 경매 정보 가져오기
  useEffect(() => {
    let isMounted = true;

    async function fetchAuction() {
      try {
        const res = await fetch(`/api/auctions/${id}`, {
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

  // 남은 시간 계산
  useEffect(() => {
    if (!product?.end_time || product.status === "ended") return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(product.end_time).getTime();
      const difference = end - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        // 경매 시간이 끝나면 경매 정보 다시 불러오기
        fetch(`/api/auctions/${id}`, {
          credentials: "include",
        })
          .then((res) => res.json())
          .then((data) => {
            setProduct(data);
            setBids(data.bids ?? []);
          })
          .catch((error) => {
            console.error(error);
          });
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

  // 입찰 금액 입력할 때 숫자만 허용
  const handleBidChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setBidAmount(value);
  };

  // 입찰 금액에 콤마 넣기
  const formatBidAmount = (value) => {
    if (!value) return "";
    return Number(value).toLocaleString();
  };

  // 입찰하기
  const handleBidSubmit = async (e) => {
    e.preventDefault();
    if (!product) return;

    // 로그인 확인
    if (!user) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    const value = Number(bidAmount.replace(/,/g, ""));
    if (Number.isNaN(value) || value <= 0) {
      alert("유효한 금액을 입력하세요.");
      return;
    }

    // 입찰가는 현재가보다 높아야 함
    if (value <= product.current_price) {
      alert(
        `입찰가는 현재가(${Number(product.current_price).toLocaleString()}원)보다 높아야 합니다.`
      );
      return;
    }

    try {
      const res = await fetch(`/api/auctions/${id}/bids`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bidderId: user.id,
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
      const refreshRes = await fetch(`/api/auctions/${id}`, {
        credentials: "include",
      });
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

  // 즉시 구매하기
  const handleImmediatePurchase = async () => {
    // 로그인 확인
    if (!user) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    // 즉시 구매가가 현재가보다 작거나 같으면 불가
    if (
      Number(product.immediate_purchase_price) <= Number(product.current_price)
    ) {
      alert("현재가가 즉시 구매가보다 높아 즉시 구매할 수 없습니다.");
      return;
    }

    const confirmMessage = `정말 ${Number(
      product.immediate_purchase_price
    ).toLocaleString()}원에 즉시 구매하시겠습니까?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const res = await fetch(`/api/auctions/${id}/purchase`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          buyerId: user.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "즉시 구매 실패");
        return;
      }

      alert("즉시 구매 성공!");

      // 경매 정보 다시 불러오기
      const refreshRes = await fetch(`/api/auctions/${id}`, {
        credentials: "include",
      });
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
        <div className={styles.content}>
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
            <section className={styles.infoPanel}>
              <div className={styles.productInfo}>
                <div className={styles.category}>{product.category_name}</div>
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

                {product.status === "ended" ? (
                  <div className={styles.timerBox}>
                    <div className={styles.timerLabel}>경매 종료</div>
                    <div className={styles.endedInfo}>
                      <div className={styles.winningPrice}>
                        낙찰가 :{" "}
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
                        입찰 : {bids.length}회
                      </div>
                    </div>

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
