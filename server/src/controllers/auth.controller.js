// server/src/controllers/auth.controller.js
const db = require("../config/db");

// ✅ 회원가입
exports.signup = async (req, res) => {
  const { email, password, nickname } = req.body;

  try {
    // 지금은 해시 안 쓰고 그냥 password를 password_hash 컬럼에 저장
    await db.query(
      "INSERT INTO users (email, password_hash, nickname) VALUES (?, ?, ?)",
      [email, password, nickname]
    );

    res.status(201).json({ message: "회원가입 성공" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "회원가입 실패" });
  }
};

// ✅ 로그인
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    // 이메일 없을 때
    if (rows.length === 0) {
      return res
        .status(401)
        .json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }

    const user = rows[0];

    // 비밀번호 비교 (지금은 평문끼리 비교)
    if (user.password_hash !== password) {
      return res
        .status(401)
        .json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }

    // 여기까지 왔으면 로그인 성공
    // 세션에 사용자 정보 저장 (Express session 사용)
    if (req.session) {
      req.session.user = {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
      };
    }

    res.status(200).json({
      message: "로그인 성공",
      user: req.session
        ? req.session.user
        : { id: user.id, email: user.email, nickname: user.nickname },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류" });
  }
};

// 로그인된 사용자 확인 API
exports.me = (req, res) => {
  try {
    res.json({ user: req.session?.user ?? null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ user: null });
  }
};

// 로그아웃
exports.logout = (req, res) => {
  try {
    if (req.session) {
      req.session.destroy(() => {
        res.json({ message: "로그아웃 완료" });
      });
    } else {
      res.json({ message: "로그아웃 완료" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "로그아웃 실패" });
  }
};
