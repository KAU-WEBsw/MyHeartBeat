// src/pages/SignupPage.js
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ 추가
import "./SignupPage.css";

function SignupPage() {
  const navigate = useNavigate(); // ✅ 추가

  const [form, setForm] = useState({
    email: "",
    password: "",
    nickname: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:4000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "회원가입 실패!");
        return;
      }

      alert("회원가입 성공!");

      // ✅ 성공하면 메인 페이지로 이동
      navigate("/main");
    } catch (error) {
      console.error(error);
      alert("서버 오류! 회원가입 실패");
    }
  };

  return (
    <div className="page-root signup-container">
      <div className="signup-box">
        <h2>회원가입</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="email"
            placeholder="이메일"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="비밀번호"
            onChange={handleChange}
            required
          />
          <input
            name="nickname"
            placeholder="닉네임"
            onChange={handleChange}
            required
          />
          <button type="submit">가입하기</button>
        </form>
      </div>
    </div>
  );
}

export default SignupPage;
