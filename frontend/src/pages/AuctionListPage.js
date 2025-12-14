import { useEffect, useMemo, useState } from "react";
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
const timeLeft = (end) => {
  const endDate = new Date(end);
  const diff = endDate.getTime() - Date.now();
  if (diff <= 0) return "종료";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  return `${days}일 ${hours}시간`;
};

function AuctionListPage() {
  const navigate = useNavigate();
  // auctions: 서버에서 받아온 경매 목록 전체
  // categories: 사용자에게 보여줄 카테고리 목록 (API 또는 fallback)
  // categoryFilter: 현재 선택된 카테고리 (빈 문자열이면 필터 없음)
  // page: 현재 페이지네이션 번호
  // totalPages / totalCount: API 응답 메타 정보 → 페이지네이션을 계산하는 데 사용
  // sortBy: UI 오른쪽 상단의 select 박스에서 최근순/인기순/가격순을 조절
  const [auctions, setAuctions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState("latest");

  // fetchAuctions: 서버에 경매 목록을 요청하고 상태를 업데이트
  // - URLSearchParams 로 동일한 쿼리 문자열을 여러 곳에서 재사용할 수 있게 구성
  // - category, sort, page 정보를 query string 으로 전달
  // - 응답에는 items/total/pageSize 가 포함된다고 가정
  const fetchAuctions = async () => {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("pageSize", 9); // 3열 카드 레이아웃이기 때문에 9개(3줄) 단위 페이징
    if (categoryFilter) params.append("category", categoryFilter);
    params.append("sort", sortBy);

    try {
      // GET /api/auctions : 서버 컨트롤러에서 페이지네이션 + 정렬 적용
      const res = await fetch(`/api/auctions?${params.toString()}`);
      const data = await res.json(); // { items: Auction[], total: number, pageSize: number }
      if (res.ok) {
        // normalized: 종료된 경매도 상세보기를 허용하기 때문에 status 필드를 클라이언트에서 덮어씀
        const items = data.items || [];
        const now = Date.now();
        const normalized = items.map((item) => {
          const ended = new Date(item.end_time).getTime() <= now;
          return {
            ...item,
            status: ended ? "ended" : item.status || "ongoing",
          };
        });
        setAuctions(normalized);
        const total = data.total || items.length;
        const size = data.pageSize || 9;
        setTotalCount(total);
        setTotalPages(Math.max(1, Math.ceil(total / size)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // fetchCategories: 좌측 사이드바의 카테고리를 서버에서 받아옴
  // - 실패하거나 빈 응답이면 fallback 목록(categoryList) 사용
  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/auctions/categories");
      const data = await res.json(); // { categories: string[] }
      if (res.ok && Array.isArray(data.categories)) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 최초 마운트 시 카테고리 목록 1회 로딩
  useEffect(() => {
    fetchCategories();
  }, []);

  // categoryFilter / page / sort 가 바뀔 때마다 경매 목록 다시 불러오기
  useEffect(() => {
    fetchAuctions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, page, sortBy]);

  // handleCategory: 같은 카테고리를 다시 누르면 전체보기로 토글
  const handleCategory = (cat) => {
    setCategoryFilter(cat === categoryFilter ? "" : cat);
    setPage(1);
  };

  // pages: 최대 5개의 페이지 버튼을 보여주기 위해 계산
  const pages = useMemo(() => {
    const arr = [];
    const maxButtons = 5;
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + maxButtons - 1);
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }, [page, totalPages]);

  // categoryList: API 응답이 없을 때 보여줄 기본 카테고리 네 가지
  // categoryList: DB에 카테고리가 비어있을 때도 UX 가 비지 않도록 고정 목록 제공
  const categoryList = categories.length
    ? categories
    : ["명품 / 패션", "전자기기", "미술품 / 컬렉션", "취미 / 기타"];

  return (
    <div className={styles.page}>
      {/* Header: 전체 사이트의 공용 내비게이션 */}
      <Header />
      <main className={styles.content}>
        <aside className={styles.sidebar}>
          {/* 좌측 상단 CTA: 경매 등록 페이지로 이동 */}
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
                  // 클릭 시 handleCategory 가 필터 상태를 토글
                  onClick={() => handleCategory(cat)}
                >
                  {cat}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <section className={styles.mainArea}>
          <div className={styles.listHeader}>
            <div>
              <h2>경매 목록</h2>
              <p>총 {totalCount}개의 경매가 있습니다</p>
            </div>
            {/* 목록 정렬: select 요소로 구현하면 접근성이 좋고 브라우저 기본 UI 를 쓸 수 있음 */}
            <select
              className={styles.sortSelect}
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
            >
              {/* option 순서: 기본값은 최신순, 인기순과 고가순은 보조 지표라 뒤로 배치 */}
              <option value="latest">최신순</option>
              <option value="popular">입찰수 많은 순</option>
              <option value="price">가격 높은 순</option>
            </select>
          </div>

          {/* 카드 그리드: 3열 정방형 카드, 각 article이 한 경매 */}
          <div className={styles.grid}>
            {auctions.map((item) => {
              // ended: 서버 status 와 별개로 종료 시간을 추가 확인
              const ended =
                item.status === "ended" || timeLeft(item.end_time) === "종료";
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
                          {timeLeft(item.end_time)}
                        </p>
                      </div>
                    </div>
                    {/* CTA: 종료된 경매는 상세보기, 진행중은 입찰 → 같은 버튼 위치에서 액션만 바뀜 */}
                    <button
                      className={styles.bidButton}
                      onClick={() => {
                        // 로그인 정보는 로컬스토리지의 user 키에서 추출
                        const stored = localStorage.getItem("user");
                        if (!stored) {
                          // 전역 모달이 필요한 곳이 많아서 CustomEvent 로 UI 트리거
                          const ev = new CustomEvent("show-login-modal", {
                            detail: { message: "로그인 시 사용할 수 있는 기능입니다." },
                          });
                          window.dispatchEvent(ev);
                          return;
                        }
                        navigate(`/product/${item.id}`);
                      }}
                    >
                      {ended ? "상세보기" : "입찰하기"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {/* 전역에서 트리거되는 로그인 모달 처리: 간단한 DOM 레벨 모달 */}
          <LoginRequiredModal />

          {/* 페이지네이션: 좌우 화살표 + 최대 5개 버튼, hover/focus 스타일은 CSS에서 지정 */}
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

// ---------------------------
// LoginRequiredModal 컴포넌트
// ---------------------------
function LoginRequiredModal() {
  // 모달 가시성/메시지를 지역 상태로 관리 (필요할 때만 렌더)
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // handler: CustomEvent 로 전달된 message 를 수신
    const handler = (e) => {
      setMessage(e?.detail?.message || "로그인 시 사용할 수 있는 기능입니다.");
      setVisible(true);
    };
    window.addEventListener("show-login-modal", handler);
    return () => window.removeEventListener("show-login-modal", handler);
  }, []);

  if (!visible) return null;

  return (
    // design note: overlay 투명도 0.4, 중앙 카드 폭 320px → 로그인 모달과 일관된 크기
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
      <div style={{ background: "#fff", padding: 24, borderRadius: 8, width: 320, textAlign: "center" }}>
        <p style={{ marginBottom: 16 }}>{message}</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <button
            onClick={() => {
              setVisible(false);
              window.location.href = "/login";
            }}
            style={{ padding: "8px 12px" }}
          >
            로그인
          </button>
          <button
            onClick={() => setVisible(false)}
            style={{ padding: "8px 12px" }}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
