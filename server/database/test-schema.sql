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

-- ------------------------------
-- 5) likes (찜)
-- ------------------------------
CREATE TABLE likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    auction_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (auction_id) REFERENCES auctions(id),

    UNIQUE (user_id, auction_id)
);


-- ================================
--  SEED: 기본 데이터 삽입
-- ================================

-- users
INSERT INTO users (email, password_hash, nickname) VALUES
('test1@example.com', 'hashed_pw1', '테스터1'),
('test2@example.com', 'hashed_pw2', '테스터2'),
('alice@example.com', 'pw3', 'Alice'),
('bob@example.com', 'pw4', 'Bob'),
('charlie@example.com', 'pw5', 'Charlie');

-- categories
INSERT INTO categories (name) VALUES
('전자제품'),
('패션'),
('미술품'),
('기타'),
('수집품'),
('주얼리'),
('인테리어');

-- auctions (여러 시나리오 포함)
INSERT INTO auctions (
    seller_id, category_id, title, description, image_url,
    start_price, current_price, min_bid_increment,
    immediate_purchase_price,
    status, start_time, end_time
) VALUES
-- 1 정상 진행 중 (전자제품)
(1, 1, '중고 아이패드 판매', '깨끗하게 사용한 아이패드입니다.', 'https://example.com/ipad.jpg',
 200000, 200000, 5000, 300000, 'ongoing', NOW(), DATE_ADD(NOW(), INTERVAL 3 DAY)
),

-- 2 진행 중 (미술품)
(2, 3, '유화 그림 판매', '직접 그린 유화 작품입니다.', 'https://example.com/art.jpg',
 50000, 50000, 2000, NULL, 'ongoing', NOW(), DATE_ADD(NOW(), INTERVAL 5 DAY)
),

-- 3 즉시 구매가 있는 패션 상품
(3, 2, '루이비통 스카프', '정품, 상태 최상', 'https://example.com/lv.jpg',
 150000, 150000, 5000, 350000, 'ongoing', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY)
),

-- 4 이미 종료된 상품
(4, 4, '엔틱 의자', '1940년대 고가구', 'https://example.com/chair.jpg',
 120000, 180000, 3000, NULL, 'ended', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)
),

-- 5 높은 입찰 경쟁 상품
(5, 1, '맥북 프로 16인치', '2022 M1 Max', 'https://example.com/macbook.jpg',
 1500000, 1650000, 10000, 2500000, 'ongoing', NOW(), DATE_ADD(NOW(), INTERVAL 2 DAY)
),

-- 6 카테고리 NULL (특수 케이스)
(1, NULL, '카테고리 없는 상품', '테스트용', 'https://example.com/no-cat.jpg',
 30000, 30000, 1000, NULL, 'ongoing', NOW(), DATE_ADD(NOW(), INTERVAL 1 DAY)
),

-- 7 인테리어 상품
(2, 7, 'LED 무드등', '은은한 무드등', 'https://example.com/light.jpg',
 20000, 25000, 500, NULL, 'ongoing', NOW(), DATE_ADD(NOW(), INTERVAL 4 DAY)
);

-- bids (여러 시나리오)
INSERT INTO bids (auction_id, bidder_id, amount) VALUES
-- 아이패드
(1, 2, 205000),
(1, 1, 210000),

-- 유화 그림
(2, 1, 52000),

-- 맥북 경쟁 입찰
(5, 3, 1550000),
(5, 4, 1600000),
(5, 5, 1650000);

-- likes (찜 시나리오)
INSERT INTO likes (user_id, auction_id) VALUES
(1, 1),  -- test1 아이패드 찜
(1, 3),  -- test1 LV 스카프 찜
(2, 5),  -- test2 맥북 찜
(3, 4);  -- Alice 엔틱 의자 찜
