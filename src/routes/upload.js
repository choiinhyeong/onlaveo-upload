// routes/upload.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadController = require('../controllers/uploadController');

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // ✅ 2GB

const safeFolderName = (name) =>
    name ? name.replace(/[^a-zA-Z0-9가-힣_-]/gu, '_') : 'unknown';

// ✅ (권장) 파일명에 들어갈 문자열도 좀 더 안전하게
const safeFileName = (name) =>
    (name || 'file')
        .replace(/[\/\\]/g, '_')        // 경로 문자 제거
        .replace(/\s+/g, '_')           // 공백 -> _
        .replace(/[^\w.\-가-힣]/gu, '_'); // 기타 위험 문자 제거

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            const regEmail = req.body?.regEmail || 'unknown';
            const regTitle = req.body?.regTitle || 'unknown';

            const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
            const storageDir = path.join(
                '/root/onlaveo-upload/uploads',
                safeFolderName(regEmail),
                today,
                safeFolderName(regTitle)
            );

            // ✅ 기존: fs.mkdirSync(storageDir, { recursive: true });
            // ✅ 변경: 비동기 mkdir (이벤트루프 블로킹 방지)
            fs.mkdir(storageDir, { recursive: true }, (err) => {
                if (err) return cb(err);
                cb(null, storageDir);
            });
        } catch (e) {
            cb(e);
        }
    },

    filename: (req, file, cb) => {
        const fileOrder = req.body?.fileOrder || '0';

        // 원본명 안전화
        const safeName = safeFileName(file.originalname);
        const saveName = `${fileOrder}_${safeName}`;

        cb(null, saveName);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: MAX_FILE_SIZE
    }
});

// POST /upload
router.post('/', upload.single('file'), uploadController.upload);

module.exports = router;
