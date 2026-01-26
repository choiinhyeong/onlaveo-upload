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

// 메타데이터 JSON이 혹시 들어와도 안전하게(파일 자체는 multipart라 여긴 영향 적음)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/upload', uploadRouter);

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Node Server running on port ${PORT}`);
});

// 업로드/대용량 대응(nginx도 timeout 맞춰야 함)
server.timeout = 600000;
server.keepAliveTimeout = 610000;
