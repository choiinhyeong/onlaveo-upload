const SftpClient = require('ssh2-sftp-client');
const path = require('path');

module.exports = async (localPath, remotePath) => {
    const sftp = new SftpClient();

    const config = {
        host: process.env.NAS_HOST,
        username: process.env.NAS_FTP_USER,
        password: process.env.NAS_FTP_PASS,
        port: 22, // SFTP 활성화 시 설정한 포트
        readyTimeout: 30000,
    };

    try {
        await sftp.connect(config);

        // 1. 경로 보정: 이미지에서 확인된 대로 '/onlaveo/files'가 기준이 되도록 설정
        let finalPath = remotePath.startsWith('/onlaveo')
            ? remotePath
            : path.posix.join('/onlaveo', remotePath);

        // 2. 폴더 체크: 이미 존재한다고 하셨으므로, 에러 방지를 위해 존재 여부만 확인
        const remoteDir = path.posix.dirname(finalPath);
        const dirExists = await sftp.exists(remoteDir);

        // 폴더가 없을 때만 생성을 시도하여 루트(/) 권한 충돌 방지
        if (!dirExists) {
            await sftp.mkdir(remoteDir, true);
        }

        // 3. 파일 업로드: fastPut을 사용하여 안정적으로 전송
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