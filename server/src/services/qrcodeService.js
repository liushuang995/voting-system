const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs').promises;

class QrcodeService {
  static async generate(shareUrl) {
    const uploadDir = path.join(__dirname, '../../uploads/qrcodes');

    // Ensure directory exists (async)
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (err) {
      if (err.code !== 'EEXIST') {
        throw err;
      }
    }

    const fileName = `${shareUrl}.png`;
    const filePath = path.join(uploadDir, fileName);

    // 生成二维码指向投票页面
    const voteUrl = `${process.env.CLIENT_URL || 'http://localhost:3001'}/vote/${shareUrl}`;

    try {
      await QRCode.toFile(filePath, voteUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });

      return `/uploads/qrcodes/${fileName}`;
    } catch (err) {
      console.error('生成二维码失败:', err);
      throw err;
    }
  }
}

module.exports = QrcodeService;