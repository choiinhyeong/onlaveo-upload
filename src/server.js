const express = require('express');
const cors = require('cors');
const multer = require('multer');
const uploadController = require('./controllers/uploadController');

const app = express();
const PORT = 3000;

const upload = multer({
    dest: 'uploads/tmp',
    limits: { fileSize: 1024 * 1024 * 1024 }
});

app.use(cors({
    origin: 'https://onlaveo.com',
    credentials: true
}));

app.post('/upload', upload.single('file'), uploadController);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Upload server on ${PORT}`);
});
