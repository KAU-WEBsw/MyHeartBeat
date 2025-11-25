// React Router를 사용하여 페이지 라우팅 설정
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import MainPage from "./pages/MainPage";
import SignupPage from "./pages/SignupPage";
import ProductDetailPage from "./pages/ProductDetailPage";

function App() {
  return (
    <BrowserRouter> 
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;