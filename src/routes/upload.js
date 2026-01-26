// routes/upload.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadController = require('../controllers/uploadController');

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
const UPLOAD_ROOT = '/root/onlaveo-upload/uploads';
const TMP_DIR = path.join(UPLOAD_ROOT, '_tmp'); // tmp는 고정 경로로만

fs.mkdirSync(TMP_DIR, { recursive: true });

const safeFileName = (name) =>
    (name || 'file')
        .replace(/[\/\\]/g, '_')
        .replace(/\s+/g, '_')
        .replace(/[^\w.\-가-힣]/gu, '_');

const storage = multer.diskStorage({
    // ✅ destination은 req.body에 의존하지 말고 무조건 tmp로
    destination: (req, file, cb) => {
        cb(null, TMP_DIR);
    },
    // ✅ filename도 일단 충돌 안 나게 임시명으로
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname || '');
        const unique = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
        cb(null, `uploading_${unique}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE }
});

// POST /upload
router.post('/', upload.single('file'), uploadController.upload);

module.exports = router;
