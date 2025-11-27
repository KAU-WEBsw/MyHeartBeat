// src/pages/LoginPage.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LoginPage.module.css"; // ✅ styles로 import

function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "로그인 실패!");
        return;
      }

      alert("로그인 성공!");
      navigate("/main");
    } catch (error) {
      alert("서버 오류! 로그인 실패");
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h2>로그인</h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            name="email"
            placeholder="이메일"
            onChange={handleChange}
            required
          />

          <input
            className={styles.input}
            type="password"
            name="password"
            placeholder="비밀번호"
            onChange={handleChange}
            required
          />

          <button type="submit" className={styles.loginBtn}>
            로그인
          </button>
        </form>

        {/* 회원가입 버튼 */}
        <button
          className={styles.signupBtn}
          onClick={() => navigate("/signup")}
        >
          회원가입 하러가기 →
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
