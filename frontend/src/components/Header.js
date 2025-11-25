import "./Header.css";

function Header() {
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
        <div className="profile-avatar">
          <span>MS</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
