import { useNavigate } from "react-router-dom";
import styles from "./LandingPage.module.css";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.landingContainer}>
      <img
        src="/assets/floating/camera.png"
        className={`${styles.floatItem} ${styles.item1}`}
      />
      <img
        src="/assets/floating/ring.png"
        className={`${styles.floatItem} ${styles.item2}`}
      />
      <img
        src="/assets/floating/bag.png"
        className={`${styles.floatItem} ${styles.item3}`}
      />
      <img
        src="/assets/floating/chair.png"
        className={`${styles.floatItem} ${styles.item4}`}
      />
      <img
        src="/assets/floating/guitar.png"
        className={`${styles.floatItem} ${styles.item5}`}
      />
      <img
        src="/assets/floating/toy.png"
        className={`${styles.floatItem} ${styles.item6}`}
      />

      <div className={styles.landingCard}>
        <div className={styles.landingLogo}>내맘똑</div>

        <h1 className={styles.landingTitle}>내 맘에 똑드는 경매 플랫폼</h1>

        <p className={styles.landingSubtitle}>
          원하는 물건을 경매로, 합리적인 가격에 만나보세요.
          <br />
          지금 바로 내맘똑에서 새로운 거래를 시작하세요.
        </p>

        <div className={styles.landingButtons}>
          <button className={styles.startBtn} onClick={() => navigate("/main")}>
            시작하기 🚀
          </button>

          <button
            className={styles.signupBtn}
            onClick={() => navigate("/login")}
          >
            로그인 ✨
          </button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
