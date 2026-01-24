const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const uploadController = require('../controllers/uploadController');

// multer tmp 폴더 (디스크에 잠깐 저장)
const upload = multer({
    dest: path.join(__dirname, '../../uploads/tmp')
});

// POST /upload
router.post('/', upload.single('file'), uploadController.upload);

module.exports = router;
