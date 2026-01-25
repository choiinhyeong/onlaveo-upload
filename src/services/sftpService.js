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
        });

        console.log('🔗 SFTP 연결 성공');

        // 파일질라 경로(/onlaveo/files)를 그대로 따라갑니다.
        // 1. 먼저 onlaveo 진입
        await sftp.cwd('onlaveo');
        // 2. 그다음 files 진입
        await sftp.cwd('files');

        const fileName = path.basename(remotePath);
        console.log(`🚀 목적지: /onlaveo/files/${fileName}`);

        // 현재 위치에 파일 업로드
        await sftp.put(localPath, fileName);

        console.log(`✅ 업로드 성공!`);
    } catch (err) {
        console.error('❌ 최종 에러:', err.message);
        throw err;
    } finally {
        await sftp.end();
    }
};