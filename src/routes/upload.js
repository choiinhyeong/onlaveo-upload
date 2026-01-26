// routes/upload.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadController = require('../controllers/uploadController');

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
const UPLOAD_ROOT = '/root/onlaveo-upload/uploads';

const safeFolderName = (name) =>
    name ? name.replace(/[^a-zA-Z0-9가-힣_-]/gu, '_') : 'unknown';

const safeFileName = (name) =>
    (name || 'file')
        .replace(/[\/\\]/g, '_')                 // 경로 문자 제거
        .replace(/\s+/g, '_')                    // 공백 -> _
        .replace(/[^\w.\-가-힣]/gu, '_');        // 나머지 위험문자 -> _

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            // ⚠️ multer가 destination 호출할 때 req.body가 비어있을 수 있음
            // 그래서 프론트에서 FormData에 텍스트 필드(regEmail/regTitle/fileOrder)를
            // 파일보다 "먼저 append" 해야 unknown 안 생김.
            const regEmail = req.body?.regEmail || 'unknown';
            const regTitle = req.body?.regTitle || 'unknown';

            const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
            const storageDir = path.join(
                UPLOAD_ROOT,
                safeFolderName(regEmail),
                today,
                safeFolderName(regTitle)
            );

            // ✅ 비동기 mkdir
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
        const safeName = safeFileName(file.originalname);
        const saveName = `${fileOrder}_${safeName}`;
        cb(null, saveName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE }
});

// POST /upload  (=> /upload 로 마운트되어 있으니 실제는 POST /upload)
router.post('/', upload.single('file'), uploadController.upload);

module.exports = router;
