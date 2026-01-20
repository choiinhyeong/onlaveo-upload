const express = require('express');
const multer = require('multer');
const controller = require('../controllers/uploadController');

const router = express.Router();

const upload = multer({ dest: 'uploads/tmp' });

router.post('/', upload.single('file'), controller.handleUpload);

module.exports = router;
