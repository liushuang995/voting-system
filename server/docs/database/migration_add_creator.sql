-- 为 votes 表添加 creator_unionid 字段
ALTER TABLE votes ADD COLUMN creator_unionid VARCHAR(100) AFTER qrcode;
ALTER TABLE votes ADD INDEX idx_creator (creator_unionid);
