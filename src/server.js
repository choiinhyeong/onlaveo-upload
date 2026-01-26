require('dotenv').config({ path: '/root/onlaveo-upload/.env' });

const express = require('express');
const cors = require('cors');
const uploadRouter = require('./routes/upload');

const app = express();
const PORT = Number(process.env.PORT || 3000);

// 1. CORS 설정 (기존 보안 설정 유지)
app.use(cors({
    origin: [
        process.env.ALLOWED_ORIGIN || 'https://onlaveo.com',
        'https://www.onlaveo.com',
    ],
    credentials: true
}));

// 2. 바디 파서 설정 (일괄 업로드 시 메타데이터 용량 확보)
app.use(express.json({ limit: '1024mb' }));
app.use(express.urlencoded({ limit: '1024mb', extended: true }));

app.get('/health', (req, res) => res.json({ ok: true }));

// 3. 라우터 연결
app.use('/upload', uploadRouter);

console.log('[BOOT] PORT =', PORT);

// 4. 서버 시작 및 타임아웃 최적화
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Node Upload Server running on port ${PORT}`);
});

/**
 * [중요] 타임아웃 설정 추가
 * 사진 30장이나 1GB 영상을 보낼 때 서버가 중간에 연결을 끊지 않도록 합니다.
 * 600000ms = 10분
 */
server.timeout = 600000;
server.keepAliveTimeout = 610000;
server.headersTimeout = 620000;