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

-- users 기본
INSERT INTO users (email, password_hash, nickname) VALUES
('test1@example.com', '$2b$10$abcdef1234567890abcdef1234567890abcdef1234567890abcdef', '테스터1'),
('test2@example.com', '$2b$10$abcdef1234567890abcdef1234567890abcdef1234567890abcdef', '테스터2');

-- categories
INSERT INTO categories (name) VALUES
('명품 / 패션'),
('전자기기'),
('미술품 / 컬렉션'),
('취미 / 기타');

-- auctions 기본 샘플
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
 'https://d1x9f5mf11b8gz.cloudfront.net/class/20210820/6a95147d-e6b4-4fee-b642-a72eebb2b060.jpg',
 50000, 50000, NULL,
 'ongoing', '2024-12-20 10:00:00', '2024-12-25 18:00:00'
);

-- 기본 bids
INSERT INTO bids (auction_id, bidder_id, amount) VALUES
(1, 2, 205000),
(2, 1, 52000);

-- ================================
-- 추가 유저 10명
-- ================================
INSERT INTO users (email, password_hash, nickname) VALUES
('user3@example.com', 'hash3', '유저3'),
('user4@example.com', 'hash4', '유저4'),
('user5@example.com', 'hash5', '유저5'),
('user6@example.com', 'hash6', '유저6'),
('user7@example.com', 'hash7', '유저7'),
('user8@example.com', 'hash8', '유저8'),
('user9@example.com', 'hash9', '유저9'),
('user10@example.com', 'hash10', '유저10'),
('user11@example.com', 'hash11', '유저11'),
('user12@example.com', 'hash12', '유저12');

-- ================================
-- 추가 AUCTIONS 테스트 케이스
-- ================================

-- A: 진행 + 즉구 O
INSERT INTO auctions (
    seller_id, category_id, title, description, image_url,
    start_price, current_price, immediate_purchase_price,
    status, start_time, end_time
) VALUES
(3, 2, '닌텐도 스위치 OLED', '거의 새것', 'https://media.bunjang.co.kr/product/250232252_1_1705764615_w%7Bres%7D.jpg',
 350000, 350000, 400000, 'ongoing', NOW(), DATE_ADD(NOW(), INTERVAL 5 DAY)
);

-- B: 진행 + 즉구 X
INSERT INTO auctions (
    seller_id, category_id, title, description, image_url,
    start_price, current_price, immediate_purchase_price,
    status, start_time, end_time
) VALUES
(4, 1, '샤넬 카드지갑', '정품, 상태 최상', 'https://image-cdn.trenbe.com/productmain/1663755898282-5e40232f-2a75-4307-bb3f-698aba7e5454.jpeg',
 250000, 250000, NULL, 'ongoing', NOW(), DATE_ADD(NOW(), INTERVAL 2 DAY)
);

-- C: 종료됨
INSERT INTO auctions (
    seller_id, category_id, title, description, image_url,
    start_price, current_price, immediate_purchase_price,
    status, start_time, end_time, winner_id, winning_bid_amount
) VALUES
(5, 3, '수채화 작품', '감성 그림', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdG9uzJ2Y6M65QI9Hf5cUAza5B3rSeJnIQOQ&s',
 30000, 55000, NULL,
 'ended', '2024-01-01 12:00:00', '2024-01-02 12:00:00', 2, 55000
);

-- D: 10분 뒤 종료되는 경매
INSERT INTO auctions (
    seller_id, category_id, title, description, image_url,
    start_price, current_price, immediate_purchase_price,
    status, start_time, end_time
) VALUES
(6, 4, '레고 아키텍처', '박스 미개봉', 'https://www.lego.com/cdn/cs/set/assets/blt777738fc4faa11ad/21034_alt1.jpg',
 80000, 80000, 150000,
 'ongoing', NOW(), DATE_ADD(NOW(), INTERVAL 10 MINUTE)
);

-- E: 고가 명품
INSERT INTO auctions (
    seller_id, category_id, title, description, image_url,
    start_price, current_price, immediate_purchase_price,
    status, start_time, end_time
) VALUES
(7, 1, '롤렉스 데이저스트', '정품 보증서 포함', 'https://th.bing.com/th/id/OIP.KCQ1Ivx79QOI9ac-DjpE1wHaHa?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3',
 9000000, 9000000, 11000000,
 'ongoing', NOW(), DATE_ADD(NOW(), INTERVAL 15 DAY)
);

-- ================================
-- 추가 BIDS 테스트 케이스
-- ================================

-- 경매 1 (아이패드)
INSERT INTO bids(auction_id, bidder_id, amount) VALUES
(1, 3, 215000),
(1, 4, 220000),
(1, 5, 250000),
(1, 6, 260000);

-- 경매 2 (유화)
INSERT INTO bids(auction_id, bidder_id, amount) VALUES
(2, 3, 53000),
(2, 4, 54000),
(2, 5, 60000);

-- 경매 3 (닌텐도)
INSERT INTO bids(auction_id, bidder_id, amount) VALUES
(3, 8, 360000),
(3, 9, 370000),
(3, 10, 380000);

-- 경매 4 (샤넬 카드지갑)
INSERT INTO bids(auction_id, bidder_id, amount) VALUES
(4, 11, 255000),
(4, 12, 260000);

-- 경매 5 (종료된 수채화)
INSERT INTO bids(auction_id, bidder_id, amount) VALUES
(5, 2, 50000),
(5, 3, 55000);

-- 경매 6 (레고)
INSERT INTO bids(auction_id, bidder_id, amount) VALUES
(6, 4, 82000),
(6, 5, 83000),
(6, 6, 90000);

-- 경매 7 (롤렉스)
INSERT INTO bids(auction_id, bidder_id, amount) VALUES
(7, 9, 9100000),
(7, 10, 9200000),
(7, 11, 9500000);
