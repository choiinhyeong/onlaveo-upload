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
        .replace(/[\/\\]/g, '_')
        .replace(/\s+/g, '_')
        .replace(/[^\w.\-가-힣]/gu, '_');

const decodeHeader = (v) =>
    decodeURIComponent(escape(Buffer.from(v, 'base64').toString('utf8')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            const rawEmail = req.headers['x-reg-email'];
            const rawTitle = req.headers['x-reg-title'];

            if (!rawEmail || !rawTitle) {
                return cb(new Error('Missing upload headers'));
            }

            const regEmail = decodeHeader(rawEmail);
            const regTitle = decodeHeader(rawTitle);

            const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');

            const storageDir = path.join(
                UPLOAD_ROOT,
                safeFolderName(regEmail),
                today,
                safeFolderName(regTitle)
            );

            fs.mkdir(storageDir, { recursive: true }, (err) => {
                if (err) return cb(err);
                cb(null, storageDir);
            });
        } catch (e) {
            cb(e);
        }
    },

    filename: (req, file, cb) => {
        const fileOrder = req.headers['x-file-order'] || '0';
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
