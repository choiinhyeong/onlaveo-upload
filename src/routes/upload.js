// routes/upload.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadController = require('../controllers/uploadController');

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

// 🚨 절대경로로 고정 (여기가 핵심)
const UPLOAD_ROOT = '/root/onlaveo-upload/uploads';

const safeFolderName = (name) =>
    name ? name.replace(/[^a-zA-Z0-9가-힣_-]/gu, '_') : 'unknown';

const safeFileName = (name) =>
    (name || 'file')
        .replace(/[\/\\]/g, '_')
        .replace(/\s+/g, '_')
        .replace(/[^\w.\-가-힣]/gu, '_');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const regEmail = req.body?.regEmail || 'unknown';
        const regTitle = req.body?.regTitle || 'unknown';

        const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');

        const storageDir = path.join(
            UPLOAD_ROOT,
            safeFolderName(regEmail),
            today,
            safeFolderName(regTitle)
        );

        // ✅ 비동기 mkdir (이벤트루프 블로킹 방지)
        fs.mkdir(storageDir, { recursive: true }, (err) => {
            if (err) return cb(err);
            cb(null, storageDir);
        });
    },

    filename: (req, file, cb) => {
        const fileOrder = req.body?.fileOrder || '0';
        const safeName = safeFileName(file.originalname);
        cb(null, `${fileOrder}_${safeName}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE }
});

router.post('/', upload.single('file'), uploadController.upload);

module.exports = router;
