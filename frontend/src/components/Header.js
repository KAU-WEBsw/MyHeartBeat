// src/components/Header.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";

function Header() {
  const navigate = useNavigate();

  return (
    <header className="header">
      {/* 로고 + 타이틀 → 클릭 시 경매 리스트로 이동 */}
      <div
        className="header-left"
        onClick={() => navigate("/auction/list")}
        style={{ cursor: "pointer" }}
      >
        <div className="logo-icon">🔨</div>
        <span className="logo-text">내맘똑</span>
      </div>

      {/* 검색창 */}
      <div className="header-center">
        <input
          className="search-input"
          placeholder="원하는 상품을 검색해보세요..."
        />
      </div>

      {/* 우측 버튼 영역 */}
      <div className="header-right">
        {/* 경매 리스트 */}
        <button
          className="header-text-btn"
          onClick={() => navigate("/auction/list")}
        >
          경매 리스트
        </button>

        {/* 마이페이지 */}
        <button className="header-text-btn" onClick={() => navigate("/mypage")}>
          마이페이지
        </button>

        {/* 경매 등록 */}
        <button
          className="register-text-btn"
          onClick={() => navigate("/auction/new")}
        >
          경매 등록
        </button>

        {/* 프로필 */}
        <div className="profile-avatar">
          <span>MS</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
