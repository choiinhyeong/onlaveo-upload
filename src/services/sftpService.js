const SftpClient = require('ssh2-sftp-client');
const path = require('path');

module.exports = async (localPath, remotePath) => {
    const sftp = new SftpClient();

    try {
        await sftp.connect({
            host: process.env.NAS_HOST,
            username: process.env.NAS_FTP_USER,
            password: process.env.NAS_FTP_PASS,
            port: 22,
            readyTimeout: 40000,
        });

        console.log('🔗 SFTP 연결 성공');

        // 파일질라에서 본 경로대로 순차 진입 (이미 검증된 단계)
        await sftp.cwd('onlaveo');
        await sftp.cwd('files');

        const fileName = path.basename(remotePath);
        console.log(`🚀 전송 시도: ${fileName}`);

        // ✅ [핵심 변경] put 대신 fastPut을 사용하고 옵션을 강하게 겁니다.
        // chunkSize를 16KB로 대폭 줄이고, 하나씩(concurrency: 1) 보냅니다.
        await sftp.fastPut(localPath, fileName, {
            concurrency: 1,        // 병렬 전송 끄기 (안정성 위주)
            chunkSize: 16384,      // 패킷 크기를 최소화하여 나스 거부 방지
            step: (total_transferred, chunk, total_size) => {
                console.log(`📊 전송 중: ${Math.round((total_transferred / total_size) * 100)}%`);
            }
        });

        console.log(`✅ 나스 업로드 성공!`);

    } catch (err) {
        console.error('❌ 최종 에러:', err.message);
        throw err;
    } finally {
        try { await sftp.end(); } catch (_) {}
    }
};