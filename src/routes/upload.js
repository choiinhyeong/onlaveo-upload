const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const uploadController = require('../controllers/uploadController');

const upload = multer({
    dest: path.join(__dirname, '../../uploads/tmp')
});

// POST /upload (사진, 영상 모두 이 경로로 동시에 쏩니다)
router.post('/', upload.single('file'), uploadController.upload);

module.exports = router;