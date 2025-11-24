import { useState } from "react";

function Signup() {
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      alert(data.message);
    } catch (err) {
      alert("회원가입 요청 실패!");
      console.error(err);
    }
  };

  return (
    <div style={{ margin: 30 }}>
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit}>
        <input name="email" placeholder="이메일" onChange={handleChange} />
        <br />
        <input
          name="password"
          type="password"
          placeholder="비밀번호"
          onChange={handleChange}
        />
        <br />
        <input name="nickname" placeholder="닉네임" onChange={handleChange} />
        <br />
        <button type="submit">가입하기</button>
      </form>
    </div>
  );
}

export default Signup;
