const path = require('path');
require('dotenv').config({ path: '/root/onlaveo-upload/.env' });

const express = require('express');
const cors = require('cors');

const uploadRouter = require('./routes/upload'); // 라우터 쓰는 구조면
// 또는 기존 컨트롤러 직접 라우팅이면 그대로

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors({
    origin: process.env.ALLOWED_ORIGIN || 'https://onlaveo.com',
    credentials: true
}));

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/upload', uploadRouter);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Node Upload Server running on port ${PORT}`);
});
