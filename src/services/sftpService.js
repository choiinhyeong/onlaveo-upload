const SftpClient = require('ssh2-sftp-client');
const path = require('path');

module.exports = async (localPath, remotePath) => {
    const sftp = new SftpClient();

    const config = {
        host: process.env.NAS_HOST,
        username: process.env.NAS_FTP_USER,
        password: process.env.NAS_FTP_PASS,
        port: 22,
        readyTimeout: 30000,
    };

    try {
        await sftp.connect(config);

        // 1. 경로 보정: /onlaveo/files/파일명 형태가 되도록 설정
        let finalPath = remotePath.startsWith('/onlaveo')
            ? remotePath
            : path.posix.join('/onlaveo', remotePath);

        console.log(`📡 업로드 시도 경로: ${finalPath}`);

        // 2. [수정] 폴더 생성(mkdir) 시도를 아예 하지 않음
        // 이미 파일질라 이미지에서 /onlaveo/files 경로가 있는 것을 확인했으므로 바로 업로드합니다.
        await sftp.fastPut(localPath, finalPath, {
            concurrency: 1,
            chunkSize: 32768,
        });

        console.log(`🚀 나스 업로드 성공: ${finalPath}`);
    } catch (err) {
        console.error('❌ SFTP 업로드 상세 에러:', err.message);
        throw err;
    } finally {
        try { await sftp.end(); } catch (_) {}
    }
};