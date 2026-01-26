const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const uploadController = require('../controllers/uploadController');

const TMP_DIR = path.join(__dirname, '../../uploads/tmp');

// ✅ 2GB 영상 대응
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

const upload = multer({
    dest: TMP_DIR,
    limits: {
        fileSize: MAX_FILE_SIZE
    }
});

// POST /upload
router.post('/', upload.single('file'), uploadController.upload);

module.exports = router;
