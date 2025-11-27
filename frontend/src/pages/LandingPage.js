// src/pages/LandingPage.js
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* 🔹 둥둥 떠다니는 귀여운 아이콘들 */}
      <img
        src="/assets/floating/camera.png"
        className="float-item item1"
        alt="camera"
      />
      <img
        src="/assets/floating/ring.png"
        className="float-item item2"
        alt="ring"
      />
      <img
        src="/assets/floating/bag.png"
        className="float-item item3"
        alt="bag"
      />
      <img
        src="/assets/floating/chair.png"
        className="float-item item4"
        alt="chair"
      />
      <img
        src="/assets/floating/guitar.png"
        className="float-item item5"
        alt="guitar"
      />
      <img
        src="/assets/floating/toy.png"
        className="float-item item6"
        alt="toy"
      />

      {/* 메인 카드 */}
      <div className="landing-card">
        <div className="landing-logo">내맘똑</div>

        <h1 className="landing-title">내 맘에 똑드는 경매 플랫폼</h1>

        <p className="landing-subtitle">
          원하는 물건을 경매로, 합리적인 가격에 만나보세요.
          <br />
          지금 바로 내맘똑에서 새로운 거래를 시작하세요.
        </p>

        <div className="landing-buttons">
          <button className="start-btn" onClick={() => navigate("/main")}>
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
