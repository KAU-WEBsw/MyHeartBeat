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
    min_bid_increment DECIMAL(10,2) NOT NULL,
    immediate_purchase_price DECIMAL(10,2) NULL,
    status ENUM('ongoing','ended') DEFAULT 'ongoing',
    start_time DATETIME NOT NULL,
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

-- categories
INSERT INTO categories (name) VALUES
('전자제품'),
('패션'),
('미술품'),
('기타');

-- auctions
INSERT INTO auctions (
    seller_id, category_id, title, description, image_url,
    start_price, current_price, min_bid_increment,
    immediate_purchase_price,
    status, start_time, end_time
) VALUES
(1, 1, '중고 아이패드 판매', '깨끗하게 사용한 아이패드입니다.', 'https://example.com/ipad.jpg',
 200000, 200000, 5000, 300000,
 'ongoing', NOW(), DATE_ADD(NOW(), INTERVAL 3 DAY)
),
(2, 3, '유화 그림 판매', '직접 그린 유화 작품입니다.', 'https://example.com/art.jpg',
 50000, 50000, 2000, NULL,
 'ongoing', NOW(), DATE_ADD(NOW(), INTERVAL 5 DAY)
);

-- bids (기본 예시)
INSERT INTO bids (auction_id, bidder_id, amount) VALUES
(1, 2, 205000),
(1, 1, 210000),
(2, 1, 52000);

