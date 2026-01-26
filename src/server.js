require('dotenv').config({ path: '/root/onlaveo-upload/.env' });
const express = require('express');
const cors = require('cors');
const uploadRouter = require('./routes/upload');

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors({
    origin: [process.env.ALLOWED_ORIGIN || 'https://onlaveo.com', 'https://www.onlaveo.com'],
    credentials: true
}));

// 메타데이터 용량 제한 해제
app.use(express.json({ limit: '2048mb' }));
app.use(express.urlencoded({ limit: '2048mb', extended: true }));

app.use('/upload', uploadRouter);

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Node Server running on port ${PORT}`);
});

// 서버 타임아웃 10분으로 증설
server.timeout = 600000;
server.keepAliveTimeout = 610000;