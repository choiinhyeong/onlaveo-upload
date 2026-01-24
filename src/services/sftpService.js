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

        // 1. 원격 경로 보정 (/onlaveo/files/...)
        let finalRemotePath = remotePath.startsWith('/onlaveo')
            ? remotePath
            : path.posix.join('/onlaveo', remotePath);

        // 2. 로컬 경로 절대 경로화 (안전장치)
        const absoluteLocalPath = path.resolve(localPath);

        console.log(`📡 전송 준비 - Local: ${absoluteLocalPath} -> Remote: ${finalRemotePath}`);

        // 3. fastPut 대신 put 사용 (No such file Local 에러 해결에 더 효과적)
        await sftp.put(absoluteLocalPath, finalRemotePath);

        console.log(`🚀 나스 업로드 성공: ${finalRemotePath}`);
    } catch (err) {
        console.error('❌ SFTP 업로드 상세 에러:', err.message);
        throw err;
    } finally {
        try { await sftp.end(); } catch (_) {}
    }
};