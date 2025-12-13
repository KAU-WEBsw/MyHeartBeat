import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import styles from "./MyPage.module.css";
//import placeholder from "../assets/placeholder.svg";
const placeholder = "/assets/placeholder.svg"; // 모든 페이지에서 같은 플레이스홀더 사용

// 금융값 표기 유틸: 경매 상세와 동일하게 ₩ + 콤마 포맷 유지
const formatCurrency = (value = 0) => `₩${Number(value).toLocaleString("ko-KR")}`;

// 경매 종료까지 남은 시간을 텍스트로 변환
const timeLeft = (end) => {
  const endDate = new Date(end);
  const diff = endDate.getTime() - Date.now();
  if (diff <= 0) return "종료";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  return `${days}일 ${hours}시간`;
};

// icons: SVG 를 직접 정의해 외부 라이브러리 없이도 일관된 아이콘 사용
// - currentColor: 부모 텍스트 색을 그대로 가져와 CSS 로 쉽게 테마 변경 가능
// - strokeWidth: 2px 로 통일하여 카드 아이콘 두께가 균일하게 보이도록 함
const icons = {
  calendar: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="16" rx="2" ry="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="16" y1="3" x2="16" y2="7" />
    </svg>
  ),
  hammer: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 21l6-6" />
      <path d="M3 11l6 6 4-4-6-6-4 4z" />
      <path d="M14 7l-1-1 4-4 2 2-4 4z" />
    </svg>
  ),
  trophy: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10v5a5 5 0 01-10 0V4z" />
      <path d="M5 6H3v2a4 4 0 004 4" />
      <path d="M19 6h2v2a4 4 0 01-4 4" />
    </svg>
  ),
  won: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9h18" />
      <path d="M3 15h18" />
      <path d="M7 3l2 18" />
      <path d="M12 3l0 18" />
      <path d="M17 3l-2 18" />
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  eye: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  pencil: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 21v-4l11-11 4 4-11 11H3z" />
      <path d="M14 4l4 4" />
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21s-6.5-4.35-9-8.5C1.26 10.12 2 7 5 6c2-.6 3.5.5 4.5 1.5C10.5 6.5 12 5.4 14 6c3 .9 3.74 4.12 2 6.5-2.5 4.15-9 8.5-9 8.5z" />
    </svg>
  ),
};

// emptyDashboard: 초기 렌더링에서도 안전하게 접근할 수 있도록 기본 값 정의
const emptyDashboard = {
  profile: {
    name: "",
    email: "",
    avatarUrl: "",
  },
  // stats 기본값: 숫자형 프로퍼티가 undefined 이면 카드에서 NaN이 뜨므로 모두 0으로 초기화
  stats: { listed: 0, bidding: 0, wins: 0, totalAmount: 0 },
  myAuctions: [],
  bidHistory: [],
};

// Badge: 진행 상황을 한눈에 보여주는 클립형 라벨
function Badge({ status }) {
  const ended = status === "ended";
  return (
    <span className={`${styles.badge} ${ended ? styles.badgeGray : styles.badgeGreen}`}>
      {ended ? "종료" : "진행 중"}
    </span>
  );
}

function MyPage() {
  // data: 서버에서 가져온 전체 대시보드 데이터
  // tab: 'all' | 'ongoing' | 'ended' 탭 상태
  // activeNav: 좌측 사이드 메뉴에서 현재 강조할 항목
  // userIdState: 로그인 사용자 정보 (URL 파라미터 없이도 접근 가능)
  const [data, setData] = useState(emptyDashboard); // 서버 응답 전체
  const [tab, setTab] = useState("all"); // 내가 올린 물건 탭 상태
  const [activeNav, setActiveNav] = useState("auctions"); // 사이드 네비 현재 포커스
  const [userIdState, setUserIdState] = useState(null); // /mypage에서 파라미터가 없을 때 fallback
  const auctionsRef = useRef(null);
  const bidsRef = useRef(null);
  const navigate = useNavigate();
  const { userId } = useParams();
  const targetUserId = userId || userIdState; // URL 우선, 없으면 로그인 사용자
  // computeStatus: 리스트/테이블 모두에서 재사용할 수 있게 공통 함수로 분리
  const computeStatus = (endTime) => {
    const endDate = new Date(endTime);
    if (Number.isNaN(endDate.getTime())) return "ongoing";
    return endDate.getTime() <= Date.now() ? "ended" : "ongoing";
  };

  // scrollTo: 좌측 네비 클릭 시 해당 섹션으로 부드럽게 스크롤
  const scrollTo = (ref, key) => {
    if (key) setActiveNav(key);
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    // 로그인 상태를 클라이언트에서 먼저 파악
    // - /mypage로 진입 시 URL 파라미터가 없으면 현재 로그인 사용자를 자동으로 로드
    const stored = localStorage.getItem("user"); // { id, email, ... } 구조
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.id) setUserIdState(String(parsed.id));
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  useEffect(() => {
    if (!targetUserId) return; // 사용자 ID가 준비된 이후에만 호출
    const fetchDashboard = async () => {
      try {
        const res = await fetch(`/api/mypage/${targetUserId}`);
        const json = await res.json(); // { profile, stats, myAuctions, bidHistory }
        setData(json);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDashboard();
  }, [targetUserId]);

  // myAuctionsWithStatus: 서버에서 내려준 endTime 기준으로 상태를 다시 계산
  const myAuctionsWithStatus = useMemo(
    () => (data.myAuctions || []).map((item) => ({ ...item, status: computeStatus(item.endTime) })),
    [data.myAuctions]
  );

  // bidHistoryWithStatus: 입찰 내역도 동일한 기준으로 status 보정
  const bidHistoryWithStatus = useMemo(
    () => (data.bidHistory || []).map((item) => ({ ...item, status: computeStatus(item.endTime) })),
    [data.bidHistory]
  );

  // filteredMyAuctions: 탭 상태에 따라 보여줄 카드 리스트
  // statusCounts: 탭 버튼에 표시할 진행/종료 개수를 한 번만 계산
  const statusCounts = useMemo(() => {
    return myAuctionsWithStatus.reduce(
      (acc, item) => {
        if (item.status === "ended") acc.ended += 1;
        else acc.ongoing += 1;
        return acc;
      },
      { ongoing: 0, ended: 0 }
    );
  }, [myAuctionsWithStatus]);

  // filteredMyAuctions: 현재 탭과 일치하는 경매만 보여줌
  const filteredMyAuctions = useMemo(() => {
    if (tab === "all") return myAuctionsWithStatus;
    if (tab === "ongoing") return myAuctionsWithStatus.filter((a) => a.status === "ongoing");
    return myAuctionsWithStatus.filter((a) => a.status === "ended");
  }, [myAuctionsWithStatus, tab]);

  // 좌측 네비게이션 항목 정의
  // navItems: 좌측 사이드 메뉴 정의 (아이콘 + 스크롤 타겟 ref)
  const navItems = [
    { key: "auctions", label: "내가 올린 경매", icon: icons.hammer, ref: auctionsRef },
    { key: "bids", label: "입찰 내역", icon: icons.calendar, ref: bidsRef },
  ];

  // 통계 카드 구성: 클릭 시 해당 섹션으로 이동
  // statCards: 대시보드 상단 KPI 카드 → value는 숫자/통화에 따라 서로 다른 포맷
  const statCards = [
    { key: "listed", label: "등록 물건", value: data.stats.listed, icon: icons.calendar, onClick: () => scrollTo(auctionsRef, "auctions") },
    { key: "bidding", label: "진행중 입찰", value: data.stats.bidding, icon: icons.hammer, onClick: () => scrollTo(bidsRef, "bids") },
    { key: "wins", label: "낙찰 성공", value: data.stats.wins, icon: icons.trophy },
    { key: "totalAmount", label: "총 거래액", value: formatCurrency(data.stats.totalAmount), icon: icons.won },
  ];

  return (
    <div className={styles.page}>
      <Header />
      {/* 2-column 레이아웃: 좌측 고정 사이드바 + 우측 스크롤 본문 */}
      <main className={styles.container}>
        <aside className={styles.sideNav}>
          {/* 프로필 카드: 서버 데이터가 없을 때도 initials 로 표시 */}
          <div className={styles.profileCard}>
            <div className={styles.avatarFallback}>{(data.profile?.name || "").slice(0, 1) || "N"}</div>
            <h3>{data.profile?.name || ""}</h3>
            <p>{data.profile?.email || ""}</p>
          </div>
          <nav className={styles.menu}>
            <span className={styles.menuTitle}>대시보드</span>
            <ul>
              {/* 각 메뉴 클릭 시 scrollTo 가 실행되어 해당 섹션 시작 부분으로 이동 */}
              {navItems.map((item) => (
                <li
                  key={item.key}
                  className={`${styles.menuItem} ${activeNav === item.key ? styles.active : ""}`}
                  onClick={() => scrollTo(item.ref, item.key)}
                >
                  <span className={styles.menuIcon}>{item.icon}</span>
                  {item.label}
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <section className={styles.mainArea}>
          {/* 상단 통계 카드 그룹: sticky 영역으로 고정 → 스크롤 시에도 KPI 확인 가능 */}
          <div className={styles.statsSticky}>
            <div className={styles.statsRow}>
              {statCards.map((card) => (
                // 버튼 태그를 사용해 카드 전체 클릭 영역을 확보하고, 일부 카드는 특정 섹션으로 스크롤
                <button key={card.key} className={styles.statCard} onClick={card.onClick}>
                  <div className={styles.statIcon}>{card.icon}</div>
                  <strong>{card.value}</strong>
                  <p>{card.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 내가 올린 물건 섹션 */}
          {/* 내가 올린 물건: CTA 버튼 → 경매 등록 페이지 이동 */}
          <div ref={auctionsRef} className={styles.sectionHeader}>
            <div>
              <h2>내가 올린 물건</h2>
              <p>현재 등록된 경매 관리 목록</p>
            </div>
            <button className={styles.primaryButton} onClick={() => navigate("/auction/new")}>
              <span className={styles.btnIcon}>{icons.plus}</span>
              새 물건 등록
            </button>
          </div>

          {/* 탭: 전체 / 진행중 / 종료 를 버튼 3개로 구현 */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tabBtn} ${tab === "all" ? styles.tabActive : ""}`}
              onClick={() => setTab("all")}
            >
              전체 ({myAuctionsWithStatus.length})
            </button>
            <button
              className={`${styles.tabBtn} ${tab === "ongoing" ? styles.tabActive : ""}`}
              onClick={() => setTab("ongoing")}
            >
              진행 중 {statusCounts.ongoing}
            </button>
            <button
              className={`${styles.tabBtn} ${tab === "ended" ? styles.tabActive : ""}`}
              onClick={() => setTab("ended")}
            >
              종료 {statusCounts.ended}
            </button>
          </div>

          {/* 내가 올린 경매 카드 목록: 각 카드에는 상태 뱃지 + action 버튼 존재 */}
          <div className={styles.cardList}>
            {filteredMyAuctions.map((item) => {
              // 카드 내부에서는 남은 시간을 한 번만 계산해 여러 곳에서 재사용
              const remainingTime = timeLeft(item.endTime);
              return (
                <article key={item.id} className={styles.itemCard}>
                {/* 이미지: 서버가 image_url 제공, 없으면 공통 placeholder */}
                <img src={item.image_url || placeholder} alt={item.title} />
                <div className={styles.itemInfo}>
                  <h3>{item.title}</h3>
                  <div className={styles.itemMeta}>
                    <p className={styles.label}>{item.category}</p>
                    <p className={styles.label}>등록일: {item.registeredAt?.slice(0, 10)}</p>
                  </div>
                  <div className={styles.itemStats}>
                    <div>
                      <p className={styles.label}>현재 입찰가</p>
                      <p className={styles.pricePrimary}>{formatCurrency(item.currentPrice)}</p>
                    </div>
                    <div>
                      <p className={styles.label}>입찰 수</p>
                      <p className={styles.countStrong}>{item.bidCount}</p>
                    </div>
                    <div>
                      <p className={styles.label}>남은 시간</p>
                      <p className={remainingTime === "종료" ? styles.danger : styles.time}>
                        {remainingTime}
                      </p>
                    </div>
                  </div>
                  <div className={styles.itemActions}>
                    <div className={styles.buttons}>
                      {/* Ghost 버튼: 배경을 투명하게 두고 아이콘+텍스트로만 강조 */}
                      <button className={styles.ghost} onClick={() => navigate(`/product/${item.id}`)}>
                        <span className={styles.btnIcon}>{icons.eye}</span>
                        보기
                      </button>
                      <button className={styles.ghost} onClick={() => navigate(`/auction/new?edit=${item.id}`)}>
                        <span className={styles.btnIcon}>{icons.pencil}</span>
                        수정
                      </button>
                    </div>
                  </div>
                </div>
                {/* cardBadge: 카드 오른쪽 상단 고정 뱃지 */}
                <span
                  className={`${styles.badge} ${
                    item.status === "ended" ? styles.badgeGray : styles.badgeGreen
                  } ${styles.cardBadge}`}
                >
                  {item.status === "ended" ? "종료" : "진행 중"}
                </span>
                </article>
              );
            })}
          </div>

          <div ref={bidsRef} className={styles.sectionHeader}>
            <h2>입찰 내역</h2>
          </div>
          {/* 입찰 내역은 테이블 레이아웃으로 구현 → 행 클릭 시 상세로 이동 */}
          <div className={styles.table}>
            <div className={styles.tableHead}>
              <span>물건</span>
              <span>내 입찰가</span>
              <span>현재 최고가</span>
              <span>입찰 수</span>
              <span>남은 시간</span>
              <span>상태</span>
            </div>
            {bidHistoryWithStatus.map((item) => (
              <div
                key={item.id}
                className={styles.tableRow}
                style={{ cursor: "pointer" }}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/product/${item.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/product/${item.id}`);
                  }
                }}
              >
                <div className={styles.productCell}>
                  <img src={item.image_url || placeholder} alt={item.title} />
                  <div>
                    <p className={styles.productTitle}>{item.title}</p>
                    <p className={styles.label}>{item.category}</p>
                  </div>
                </div>
                <span className={styles.countStrong}>{formatCurrency(item.myBid)}</span>
                <span className={styles.pricePrimary}>{formatCurrency(item.currentPrice)}</span>
                <span className={styles.countStrong}>{item.bidCount}</span>
                {/* timeDanger: 남은 시간이 임박하면 붉은색으로 강조 */}
                <span className={styles.timeDanger}>{timeLeft(item.endTime)}</span>
                <Badge status={item.status} />
              </div>
            ))}
          </div>

        </section>
      </main>
    </div>
  );
}

export default MyPage;
