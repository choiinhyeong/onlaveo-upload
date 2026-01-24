const SftpClient = require('ssh2-sftp-client');
const path = require('path'); // 상단에 path 모듈 추가

module.exports = async (localPath, remotePath) => {
    const sftp = new SftpClient();

    const config = {
        host: process.env.NAS_HOST,
        username: process.env.NAS_FTP_USER, // 라이브러리에 따라 user 대신 username 권장
        password: process.env.NAS_FTP_PASS,
        port: 22,
        readyTimeout: 30000,
        keepaliveInterval: 10000,
        keepaliveCountMax: 3,
    };

    try {
        await sftp.connect(config);

        // ✅ [핵심 수정] 터미널에서 확인한 실제 공유 폴더 경로(/onlaveo)를 강제 결합
        // 만약 전달받은 remotePath가 'files/image.jpg'라면 -> '/onlaveo/files/image.jpg'가 됩니다.
        const finalPath = remotePath.startsWith('/onlaveo')
            ? remotePath
            : path.posix.join('/onlaveo', remotePath);

        // ✅ [추가] 폴더가 없으면 에러가 나므로 업로드 전 폴더 생성 확인
        const remoteDir = path.posix.dirname(finalPath);
        await sftp.mkdir(remoteDir, true);

        // ✅ fastPut을 유지하되 보정된 경로(finalPath) 사용
        await sftp.fastPut(localPath, finalPath, {
            concurrency: 1,
            chunkSize: 32768,
        });

        console.log(`🚀 SFTP 업로드 성공: ${finalPath}`);
    } catch (err) {
        console.error('❌ SFTP 서비스 상세 에러:', err.message);
        throw err;
    } finally {
        try { await sftp.end(); } catch (_) {}
    }
};