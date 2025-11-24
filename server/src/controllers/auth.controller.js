const db = require("../config/db");

exports.signup = async (req, res) => {
  const { email, password, nickname } = req.body;

  try {
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
