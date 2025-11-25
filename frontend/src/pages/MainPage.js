// src/pages/MainPage.js
import "./MainPage.css";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

function MainPage() {
  const navigate = useNavigate();
  return (
    <div className="page-root">
      {/* 공통 헤더 */}
      <Header />

      {/* 메인 콘텐츠 */}
      <main className="main">
        <div className="main-placeholder">
          <p>여기에 경매 리스트/배너 들어갈 예정 😊</p>
          <br />
          {/* 경매 상세 페이지 예비 */}
          <button 
            className="detail-button"
            onClick={() => navigate("/product/1")}
          >1번 경매 상세 페이지 이동</button>
        </div>
      </main>


      {/* 공통 푸터 */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-col">
            <h4>내맘똑</h4>
            <p>
              프리미엄 경매 플랫폼으로
              <br />
              안전하고 투명한 거래를 제공합니다.
            </p>
            <div className="footer-sns">
              <span>Instagram</span>
              <span>Twitter</span>
              <span>Facebook</span>
            </div>
          </div>

          <div className="footer-col">
            <h4>경매</h4>
            <ul>
              <li>진행 중 경매</li>
              <li>예정 경매</li>
              <li>종료 경매</li>
              <li>경매 일정</li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>고객지원</h4>
            <ul>
              <li>자주 묻는 질문</li>
              <li>경매 가이드</li>
              <li>고객센터</li>
              <li>문의하기</li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>회사정보</h4>
            <ul>
              <li>회사소개</li>
              <li>이용약관</li>
              <li>개인정보처리방침</li>
              <li>채용정보</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">© 2025 내맘똑. All rights reserved.</div>
      </footer>
    </div>
  );
}

export default MainPage;
