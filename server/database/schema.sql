-- ================================
--  SCHEMA: 테이블 생성
-- ================================

DROP DATABASE IF EXISTS auction_db;
CREATE DATABASE auction_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE auction_db;

-- ------------------------------
-- 1) users (회원)
-- ------------------------------
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------
-- 2) categories (카테고리)
-- ------------------------------
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- ------------------------------
-- 3) auctions (경매)
-- ------------------------------
CREATE TABLE auctions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    seller_id INT NOT NULL,
    category_id INT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    start_price DECIMAL(10,2) NOT NULL,
    current_price DECIMAL(10,2) NOT NULL,
    immediate_purchase_price DECIMAL(10,2) NULL,
    status ENUM('ongoing','ended') DEFAULT 'ongoing',

    -- ✅ 프론트에서 안 보내도 되도록 기본값 현재 시간
    start_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    end_time DATETIME NOT NULL,
    winner_id INT NULL,
    winning_bid_amount DECIMAL(10,2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (seller_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (winner_id) REFERENCES users(id)
);

-- ------------------------------
-- 4) bids (입찰)
-- ------------------------------
CREATE TABLE bids (
    id INT AUTO_INCREMENT PRIMARY KEY,
    auction_id INT NOT NULL,
    bidder_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (auction_id) REFERENCES auctions(id),
    FOREIGN KEY (bidder_id) REFERENCES users(id)
);

-- ================================
--  SEED: 기본 데이터 삽입
-- ================================

-- users
INSERT INTO users (email, password_hash, nickname) VALUES
('test1@example.com', '$2b$10$abcdef1234567890abcdef1234567890abcdef1234567890abcdef', '테스터1'),
('test2@example.com', '$2b$10$abcdef1234567890abcdef1234567890abcdef1234567890abcdef', '테스터2');

-- categories (프론트 카테고리와 맞춤)
INSERT INTO categories (name) VALUES
('명품 / 패션'),       -- id = 1
('전자기기'),          -- id = 2
('미술품 / 컬렉션'),   -- id = 3
('취미 / 기타');       -- id = 4

-- auctions (샘플 데이터)
INSERT INTO auctions (
    seller_id, category_id, title, description, image_url,
    start_price, current_price,
    immediate_purchase_price,
    status, start_time, end_time
) VALUES
(1, 1,
 '중고 아이패드 판매',
 '깨끗하게 사용한 아이패드입니다.',
 'https://istore.xcache.kinxcdn.com/prd/data/goods/1/2024/11/342_temp_17307911200801large.jpg',
 200000, 200000, 300000,
 'ongoing', '2024-12-20 10:00:00', '2025-12-31 23:59:59'
),
(2, 3,
 '유화 그림 판매',
 '직접 그린 유화 작품입니다.',
 'https://example.com/art.jpg',
 50000, 50000, NULL,
 'ongoing', '2024-12-20 10:00:00', '2024-12-25 18:00:00'
);

-- bids (기본 예시)
INSERT INTO bids (auction_id, bidder_id, amount) VALUES
(1, 2, 205000),
(1, 1, 210000),
(2, 1, 52000);
