// Simple migration: add seller_nickname column if it doesn't exist
const db = require("../src/config/db");

(async () => {
  try {
    console.log("Checking auctions table for seller_nickname column...");
    const [rows] = await db.query(
      "SHOW COLUMNS FROM auctions LIKE 'seller_nickname'"
    );
    if (rows && rows.length > 0) {
      console.log("Column seller_nickname already exists. Nothing to do.");
      process.exit(0);
    }

    console.log("Adding seller_nickname column to auctions table...");
    await db.query(
      "ALTER TABLE auctions ADD COLUMN seller_nickname VARCHAR(50) NULL"
    );
    console.log("Column added successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Failed to add column:", err);
    process.exit(1);
  }
})();
