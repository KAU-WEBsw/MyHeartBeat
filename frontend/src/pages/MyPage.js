import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import styles from "./MyPage.module.css";
//import placeholder from "../assets/placeholder.svg";
const placeholder = "/assets/placeholder.svg"; // 모든 페이지에서 같은 플레이스홀더 사용

// 금융값 표기 유틸: 경매 상세와 동일하게 ₩ + 콤마 포맷 유지
const formatCurrency = (value = 0) => `₩${Number(value).toLocaleString("ko-KR")}`;

// 경매 종료까지 남은 시간을 텍스트로 변환 (상태가 ended면 즉시 종료 표시)
const timeLeft = (end, status) => {
  if (status === "ended") return "종료";
  const endDate = new Date(end);
  const diff = endDate.getTime() - Date.now();
  if (diff <= 0) return "종료";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  return `${days}일 ${hours}시간`;
};

// emptyDashboard: 초기 렌더링에서도 안전하게 접근할 수 있도록 기본 값 정의
const emptyDashboard = {
  profile: {
    name: "",
    email: "",
  },
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
  // userIdState: 로그인 사용자 정보 (URL 파라미터 없이도 접근 가능)
  const [data, setData] = useState(emptyDashboard); // 서버 응답 전체
  const [userIdState, setUserIdState] = useState(null); // /mypage에서 파라미터가 없을 때 fallback
  const navigate = useNavigate();
  const { userId } = useParams();
  const targetUserId = userId || userIdState; // URL 우선, 없으면 로그인 사용자
  const isEnded = (status, endTime) =>
    status === "ended" || new Date(endTime).getTime() <= Date.now();

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
        const json = await res.json(); // { profile, myAuctions, bidHistory }
        setData(json);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDashboard();
  }, [targetUserId]);

  const myAuctions = data.myAuctions || [];
  const bidHistory = data.bidHistory || [];

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.container}>
        <section className={styles.mainArea}>
          {/* 고정된 대시보드 헤더 대신 상단에 프로필 정보를 배치 */}
          <div className={styles.profileHeader}>
            <div className={styles.avatarFallback}>{(data.profile?.name || "").slice(0, 1) || "N"}</div>
            <div>
              <p className={styles.profileLabel}>닉네임</p>
              <h2>{data.profile?.name || "이름 미등록"}</h2>
            </div>
            <div>
              <p className={styles.profileLabel}>이메일</p>
              <p>{data.profile?.email || "이메일 미등록"}</p>
            </div>
          </div>

          {/* 내가 올린 물건 섹션 */}
          {/* 내가 올린 물건: CTA 버튼 → 경매 등록 페이지 이동 */}
          <div className={styles.sectionHeader}>
            <div>
              <h2>내가 올린 물건</h2>
              <p>현재 등록된 경매 관리 목록</p>
            </div>
            <button className={styles.primaryButton} onClick={() => navigate("/auction/new")}>
              새 물건 등록
            </button>
          </div>

          {/* 내가 올린 경매 카드 목록: 각 카드에는 상태 뱃지 + action 버튼 존재 */}
          <div className={styles.cardList}>
            {myAuctions.map((item) => {
              const remainingTime = timeLeft(item.endTime, item.status);
              const ended = isEnded(item.status, item.endTime);
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
                      <button className={styles.ghost} onClick={() => navigate(`/product/${item.id}`)}>
                        보기
                      </button>
                      <button className={styles.ghost} onClick={() => navigate(`/auction/new?edit=${item.id}`)}>
                        수정
                      </button>
                    </div>
                  </div>
                </div>
                {/* cardBadge: 카드 오른쪽 상단 고정 뱃지 */}
                <span
                  className={`${styles.badge} ${
                    ended ? styles.badgeGray : styles.badgeGreen
                  } ${styles.cardBadge}`}
                >
                  {ended ? "종료" : "진행 중"}
                </span>
                </article>
              );
            })}
          </div>

          <div className={styles.sectionHeader}>
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
            {bidHistory.map((item) => {
              const ended = isEnded(item.status, item.endTime);
              return (
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
                <span className={styles.timeDanger}>{timeLeft(item.endTime, item.status)}</span>
                <Badge status={ended ? "ended" : "ongoing"} />
              </div>
            );
            })}
          </div>

        </section>
      </main>
    </div>
  );
}

export default MyPage;
