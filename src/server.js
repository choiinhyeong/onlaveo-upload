require('dotenv').config({ path: '/root/onlaveo-upload/.env' });

const express = require('express');
const cors = require('cors');

const uploadRouter = require('./routes/upload');

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors({
    origin: [
        process.env.ALLOWED_ORIGIN || 'https://onlaveo.com',
        'https://www.onlaveo.com',
    ],
    credentials: true
}));

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/upload', uploadRouter);

// ✅ 이 로그가 찍히면 "listen까지 도달"한 거고, 포트도 확정됨
console.log('[BOOT] PORT =', PORT);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Node Upload Server running on port ${PORT}`);
});
