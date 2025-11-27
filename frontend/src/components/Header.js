// src/components/Header.js
import { useNavigate } from "react-router-dom";
import "./Header.css";

function Header() {
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo-icon">🔨</div>
        <span className="logo-text">내맘똑</span>
      </div>

      <div className="header-center">
        <input
          className="search-input"
          placeholder="원하는 상품을 검색해보세요..."
        />
      </div>

      <div className="header-right">
        {/* 배경 없는 텍스트 버튼 */}
        <button
          className="register-text-btn"
          onClick={() => navigate("/auction/new")}
        >
          경매 등록
        </button>

        <div className="profile-avatar">
          <span>MS</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
