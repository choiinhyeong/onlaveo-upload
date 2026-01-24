const SftpClient = require('ssh2-sftp-client');

module.exports = async (localPath, remotePath) => {
    const sftp = new SftpClient();

    try {
        await sftp.connect({
            host: process.env.NAS_HOST,
            username: process.env.NAS_FTP_USER,
            password: process.env.NAS_FTP_PASS,
            port: 22,
            readyTimeout: 30000,
        });

        // ✅ [핵심] 모든 경로 체크 로직 삭제
        // 터미널에서 확인한 절대 경로를 그대로 사용합니다.
        const finalRemotePath = remotePath.startsWith('/onlaveo')
            ? remotePath
            : `/onlaveo/${remotePath.replace(/^\/+/, '')}`;

        console.log(`📡 즉시 업로드 시도: ${finalRemotePath}`);

        // ✅ mkdir 과정 없이 바로 put 실행
        // 폴더가 이미 있으므로 mkdir을 실행하면 권한 에러만 발생합니다.
        await sftp.put(localPath, finalRemotePath);

        console.log(`🚀 나스 업로드 성공!`);
    } catch (err) {
        console.error('❌ SFTP 업로드 상세 에러:', err.message);
        throw err;
    } finally {
        try { await sftp.end(); } catch (_) {}
    }
};