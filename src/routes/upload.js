const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadController = require('../controllers/uploadController');

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // ✅ 2GB

const safeFolderName = (name) =>
    name ? name.replace(/[^a-zA-Z0-9가-힣_-]/gu, '_') : 'unknown';

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

            fs.mkdirSync(storageDir, { recursive: true });
            cb(null, storageDir);
        } catch (e) {
            cb(e);
        }
    },
    filename: (req, file, cb) => {
        const fileOrder = req.body?.fileOrder || '0';
        const safeName = (file.originalname || 'file').replace(/\s+/g, '_');
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
