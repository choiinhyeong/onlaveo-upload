const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadController = require('../controllers/uploadController');

// ✅ 2GB 제한
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

const safeFolderName = (name) =>
    name ? name.replace(/[^a-zA-Z0-9가-힣_-]/gu, '_') : 'unknown';

const safeFileName = (name) =>
    (name || 'file').replace(/[^\w.\-가-힣]/gu, '_');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            const { regEmail, regTitle } = req.body;

            const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
            const storageDir = path.join(
                '/root/onlaveo-upload/uploads',
                safeFolderName(regEmail),
                today,
                safeFolderName(regTitle)
            );

            // ✅ 업로드 들어오는 순간에 최종 폴더 생성
            fs.mkdirSync(storageDir, { recursive: true });

            cb(null, storageDir);
        } catch (e) {
            cb(e);
        }
    },

    filename: (req, file, cb) => {
        const { fileOrder } = req.body;

        const original = safeFileName(file.originalname);
        const order = Number(fileOrder || 0);

        const saveName = `${order}_${original}`;
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
