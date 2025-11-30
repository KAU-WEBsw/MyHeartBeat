import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import styles from "./MyPage.module.css";
//import placeholder from "../assets/placeholder.svg";
const placeholder = "/assets/placeholder.svg";


const formatCurrency = (value = 0) => `₩${Number(value).toLocaleString("ko-KR")}`;

const timeLeft = (end) => {
  const endDate = new Date(end);
  const diff = endDate.getTime() - Date.now();
  if (diff <= 0) return "종료";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  return `${days}일 ${hours}시간`;
};

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

const emptyDashboard = {
  profile: {
    name: "",
    email: "",
    avatarUrl: "",
  },
  stats: { listed: 0, bidding: 0, wins: 0, totalAmount: 0 },
  myAuctions: [],
  bidHistory: [],
};

function Badge({ status }) {
  const ended = status === "ended";
  return (
    <span className={`${styles.badge} ${ended ? styles.badgeGray : styles.badgeGreen}`}>
      {ended ? "종료" : "진행 중"}
    </span>
  );
}

function MyPage() {
  const [data, setData] = useState(emptyDashboard);
  const [tab, setTab] = useState("all");
  const [activeNav, setActiveNav] = useState("auctions");
  const [userIdState, setUserIdState] = useState(null);
  const auctionsRef = useRef(null);
  const bidsRef = useRef(null);
  const navigate = useNavigate();
  const { userId } = useParams();
  const targetUserId = userId || userIdState;
  const computeStatus = (endTime) => {
    const endDate = new Date(endTime);
    if (Number.isNaN(endDate.getTime())) return "ongoing";
    return endDate.getTime() <= Date.now() ? "ended" : "ongoing";
  };

  const scrollTo = (ref, key) => {
    setActiveNav(key || activeNav);
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    // 로그인 정보 로드 (로컬스토리지 → 마이페이지 조회 대상 설정)
    const stored = localStorage.getItem("user");
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
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDashboard();
  }, [targetUserId]);

  const myAuctionsWithStatus = useMemo(
    () => (data.myAuctions || []).map((item) => ({ ...item, status: computeStatus(item.endTime) })),
    [data.myAuctions]
  );

  const bidHistoryWithStatus = useMemo(
    () => (data.bidHistory || []).map((item) => ({ ...item, status: computeStatus(item.endTime) })),
    [data.bidHistory]
  );

  const filteredMyAuctions = useMemo(() => {
    if (tab === "all") return myAuctionsWithStatus;
    if (tab === "ongoing") return myAuctionsWithStatus.filter((a) => a.status === "ongoing");
    return myAuctionsWithStatus.filter((a) => a.status === "ended");
  }, [myAuctionsWithStatus, tab]);

  const navItems = [
    { key: "auctions", label: "내가 올린 경매", icon: icons.hammer, ref: auctionsRef },
    { key: "bids", label: "입찰 내역", icon: icons.calendar, ref: bidsRef },
  ];

  const statCards = [
    { key: "listed", label: "등록 물건", value: data.stats.listed, icon: icons.calendar, onClick: () => scrollTo(auctionsRef, "auctions") },
    { key: "bidding", label: "진행중 입찰", value: data.stats.bidding, icon: icons.hammer, onClick: () => scrollTo(bidsRef, "bids") },
    { key: "wins", label: "낙찰 성공", value: data.stats.wins, icon: icons.trophy },
    { key: "totalAmount", label: "총 거래액", value: formatCurrency(data.stats.totalAmount), icon: icons.won },
  ];

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.container}>
        <aside className={styles.sideNav}>
          <div className={styles.profileCard}>
            <div className={styles.avatarFallback}>{(data.profile?.name || "").slice(0, 1) || "N"}</div>
            <h3>{data.profile?.name || ""}</h3>
            <p>{data.profile?.email || ""}</p>
          </div>
          <nav className={styles.menu}>
            <span className={styles.menuTitle}>대시보드</span>
            <ul>
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
          <div className={styles.statsSticky}>
            <div className={styles.statsRow}>
              {statCards.map((card) => (
                <button key={card.key} className={styles.statCard} onClick={card.onClick}>
                  <div className={styles.statIcon}>{card.icon}</div>
                  <strong>{card.value}</strong>
                  <p>{card.label}</p>
                </button>
              ))}
            </div>
          </div>

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
              진행 중 {myAuctionsWithStatus.filter((a) => a.status === "ongoing").length}
            </button>
            <button
              className={`${styles.tabBtn} ${tab === "ended" ? styles.tabActive : ""}`}
              onClick={() => setTab("ended")}
            >
              종료 {myAuctionsWithStatus.filter((a) => a.status === "ended").length}
            </button>
          </div>

          <div className={styles.cardList}>
            {filteredMyAuctions.map((item) => (
              <article key={item.id} className={styles.itemCard}>
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
                      <p className={timeLeft(item.endTime) === "종료" ? styles.danger : styles.time}>
                        {timeLeft(item.endTime)}
                      </p>
                    </div>
                  </div>
                  <div className={styles.itemActions}>
                    <div className={styles.buttons}>
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
                <span
                  className={`${styles.badge} ${
                    item.status === "ended" ? styles.badgeGray : styles.badgeGreen
                  } ${styles.cardBadge}`}
                >
                  {item.status === "ended" ? "종료" : "진행 중"}
                </span>
              </article>
            ))}
          </div>

          <div ref={bidsRef} className={styles.sectionHeader}>
            <h2>입찰 내역</h2>
          </div>
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
              <div key={item.id} className={styles.tableRow}>
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
