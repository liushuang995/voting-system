-- 创建数据库
CREATE DATABASE IF NOT EXISTS toupiao_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE toupiao_db;

-- 超管表
CREATE TABLE IF NOT EXISTS super_admins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  status ENUM('active', 'disabled') DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 管理员白名单表
CREATE TABLE IF NOT EXISTS admin_whitelist (
  id INT PRIMARY KEY AUTO_INCREMENT,
  unionid VARCHAR(100) NOT NULL UNIQUE,
  nickname VARCHAR(100),
  password VARCHAR(100),
  status ENUM('active', 'disabled') DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INT
);

-- 投票表
CREATE TABLE IF NOT EXISTS votes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  type ENUM('single', 'multiple') NOT NULL DEFAULT 'single',
  options JSON NOT NULL,
  max_votes_per_user INT NOT NULL DEFAULT 1,
  end_time DATETIME,
  status ENUM('active', 'closed') DEFAULT 'active',
  share_title VARCHAR(100),
  share_desc VARCHAR(200),
  share_img VARCHAR(255),
  share_url VARCHAR(255) NOT NULL UNIQUE,
  qrcode VARCHAR(255),
  creator_unionid VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_share_url (share_url),
  INDEX idx_status (status),
  INDEX idx_creator (creator_unionid)
);

-- 投票记录表
CREATE TABLE IF NOT EXISTS vote_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vote_id INT NOT NULL,
  unionid VARCHAR(100) NOT NULL,
  nickname VARCHAR(100),
  avatar VARCHAR(255),
  options JSON NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vote_id) REFERENCES votes(id) ON DELETE CASCADE,
  INDEX idx_vote_unionid (vote_id, unionid)
);