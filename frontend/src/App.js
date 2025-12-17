// React Router를 사용하여 페이지 라우팅 설정 
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MainPage from "./pages/MainPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AuctionCreatePage from "./pages/AuctinoCreatePage";
import AuctionListPage from "./pages/AuctionListPage";
import MyPage from "./pages/MyPage";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/auction/new" element={<AuctionCreatePage />} />
        <Route path="/auction/list" element={<AuctionListPage />} />
        <Route path="/mypage" element={<MyPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
