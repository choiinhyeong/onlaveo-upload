const express = require('express');
const cors = require('cors');
require('dotenv').config();

const uploadRouter = require('./routes/upload');

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors({
    origin: process.env.ALLOWED_ORIGIN || 'https://onlaveo.com',
    credentials: true
}));

// (선택) 헬스체크
app.get('/health', (req, res) => res.json({ ok: true }));

// 업로드 라우터 마운트
app.use('/upload', uploadRouter);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Node Upload Server running on port ${PORT}`);
});
