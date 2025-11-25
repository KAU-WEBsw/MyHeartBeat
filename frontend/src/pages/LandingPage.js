// src/pages/LandingPage.js
import "./LandingPage.css";

function LandingPage({ onStart }) {
  return (
    <div className="landing-container">
      <div className="landing-card">
        <div className="landing-logo">내맘똑</div>

        <h1 className="landing-title">내 맘에 똑드는 경매 플랫폼</h1>
        <p className="landing-subtitle">
          원하는 물건을 경매로, 합리적인 가격에 만나보세요.
          <br />
          지금 바로 내맘똑에서 새로운 거래를 시작하세요.
        </p>

        <div className="landing-buttons">
          <button className="start-btn" onClick={onStart}>
            시작하기 🚀
          </button>
          <a href="/signup" className="signup-btn">
            회원가입 ✨
          </a>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
