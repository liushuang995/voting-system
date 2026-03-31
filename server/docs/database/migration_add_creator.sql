-- 为 votes 表添加 creator_unionid 字段
ALTER TABLE votes ADD COLUMN creator_unionid VARCHAR(100) AFTER qrcode;
ALTER TABLE votes ADD INDEX idx_creator (creator_unionid);

-- 为 admin_whitelist 表添加 password 字段
ALTER TABLE admin_whitelist ADD COLUMN password VARCHAR(100) AFTER nickname;
