const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadController = require('../controllers/uploadController');

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

const safeFolderName = (name) =>
    name ? String(name).replace(/[^a-zA-Z0-9가-힣_-]/gu, '_') : 'unknown';

function buildStorageDir(req) {
    // req.body는 "필드가 파일보다 먼저 올 때" 정상 세팅됨
    const regEmail = safeFolderName(req.body?.regEmail);
    const regTitle = safeFolderName(req.body?.regTitle);

    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return path.join('/root/onlaveo-upload/uploads', regEmail, today, regTitle);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            const dir = buildStorageDir(req);

            // 그래도 비어있을 수 있으니 마지막 방어
            fs.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        } catch (e) {
            cb(e);
        }
    },
    filename: (req, file, cb) => {
        try {
            const fileOrder = req.body?.fileOrder ? String(req.body.fileOrder) : '0';
            const original = file.originalname || 'file';
            const safeName = original.replace(/\s+/g, '_');
            cb(null, `${fileOrder}_${safeName}`);
        } catch (e) {
            cb(e);
        }
    }
});

const upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE }
});

router.post('/', upload.single('file'), uploadController.upload);

module.exports = router;
