import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import styles from "./AuctionListPage.module.css";
//import placeholder from "../assets/placeholder.svg";
const placeholder = "/assets/placeholder.svg"; // CRA dev 서버에서 /public 경로 이미지를 그대로 사용

// formatCurrency: 모든 금액을 한국 원화 표기로 통일
// - input: 숫자 또는 문자열로 들어온 가격
// - output: ₩ 기호가 붙은 3자리 콤마 문자열
const formatCurrency = (value = 0) =>
  `₩${Number(value).toLocaleString("ko-KR")}`;

// timeLeft: 경매 종료 시간까지 남은 시간을 "일 + 시간" 형태로 변환
// - end: ISO 문자열 또는 Date 로 변환 가능한 값
// - 차이가 0 이하이면 "종료" 문자열을 반환하여 UI 가 종료됨을 인지하도록 함
const timeLeft = (end, status) => {
  if (status === "ended") return "종료";
  const endDate = new Date(end);
  const diff = endDate.getTime() - Date.now();
  if (diff <= 0) return "종료";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  return `${days}일 ${hours}시간`;
};

// isEnded: 종료 여부만 판단하는 단순 함수 → UI 로직에서만 사용
const isEnded = (status, end) =>
  status === "ended" || new Date(end).getTime() <= Date.now();

function AuctionListPage() {
  const navigate = useNavigate();
  // auctions: 서버에서 받아온 경매 목록 전체
  // sortBy: UI 오른쪽 상단의 select 박스에서 최근순/가격순을 조절
  const [auctions, setAuctions] = useState([]);
  const [sortBy, setSortBy] = useState("latest");

  // fetchAuctions: 서버에 경매 목록을 요청하고 상태를 업데이트
  // - 목록은 한 번에 받아와 단순히 카드 형태로만 보여줌
  const fetchAuctions = async () => {
    try {
      // GET /api/auctions : 서버 컨트롤러에서 페이지네이션 + 정렬 적용
      const res = await fetch(`/api/auctions?sort=${sortBy}`);
      const data = await res.json(); // { items: Auction[] }
      if (res.ok) {
        setAuctions(data.items || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // sort 가 바뀔 때마다 경매 목록 다시 불러오기
  useEffect(() => {
    fetchAuctions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  return (
    <div className={styles.page}>
      {/* Header: 전체 사이트의 공용 내비게이션 */}
      <Header />
      <main className={styles.content}>
        <section className={styles.mainArea}>
          <div className={styles.listHeader}>
            <div>
              <h2>경매 목록</h2>
            </div>
            <div className={styles.listActions}>
              <button
                className={styles.primaryButton}
                onClick={() => navigate("/auction/new")}
              >
                상품 등록하기
              </button>
              {/* 목록 정렬: select 요소로 구현하면 접근성이 좋고 브라우저 기본 UI 를 쓸 수 있음 */}
              <select
                className={styles.sortSelect}
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                }}
              >
                <option value="latest">최신순</option>
                <option value="price">가격 높은 순</option>
              </select>
            </div>
          </div>

          {/* 카드 그리드: 3열 정방형 카드, 각 article이 한 경매 */}
          <div className={styles.grid}>
            {auctions.map((item) => {
              // ended: 종료 여부는 isEnded 함수 하나로만 판단
              const ended = isEnded(item.status, item.end_time);
              return (
                <article className={styles.card} key={item.id}>
                  <div className={styles.cardImage}>
                    <img src={item.image_url || placeholder} alt={item.title} />
                    {/* status badge: 진행중은 초록, 종료는 회색 (module.css에서 지정) */}
                    <span
                      className={`${styles.status} ${
                        ended ? styles.statusEnded : styles.statusOngoing
                      }`}
                    >
                      {ended ? "종료" : "진행 중"}
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
                          {timeLeft(item.end_time, item.status)}
                        </p>
                      </div>
                    </div>
                    {/* CTA: 종료된 경매는 상세보기, 진행중은 입찰 → 같은 버튼 위치에서 액션만 바뀜 */}
                    <button
                      className={`${styles.bidButton} ${
                        ended ? styles.bidButtonEnded : ""
                      }`}
                      onClick={() => navigate(`/product/${item.id}`)}
                    >
                      {ended ? "상세보기" : "입찰하기"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

export default AuctionListPage;
