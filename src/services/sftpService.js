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
            readyTimeout: 30000,
        });

        // ✅ [핵심 수정] 맨 앞의 /를 제거하여 'onlaveo/files/...' 형태의 상대 경로로 만듭니다.
        // 접속하자마자 onlaveo 폴더가 보이므로, 슬래시가 없는 편이 훨씬 안정적입니다.
        let finalRemotePath = remotePath.replace(/^\/+/, '');

        if (!finalRemotePath.startsWith('onlaveo')) {
            finalRemotePath = path.posix.join('onlaveo', finalRemotePath);
        }

        console.log(`📡 상대 경로 전송 시도: ${finalRemotePath}`);

        // ✅ 폴더 존재 확인 (상대 경로로 체크)
        const remoteDir = path.posix.dirname(finalRemotePath);
        const dirExists = await sftp.exists(remoteDir);

        if (!dirExists) {
            // mkdir 역시 상대 경로로 수행하여 루트 권한 문제를 피합니다.
            await sftp.mkdir(remoteDir, true);
        }

        // ✅ put 메서드를 사용하여 전송
        await sftp.put(localPath, finalRemotePath);

        console.log(`🚀 나스 업로드 성공! 경로: ${finalRemotePath}`);
    } catch (err) {
        console.error('❌ SFTP 업로드 상세 에러:', err.message);
        throw err;
    } finally {
        try { await sftp.end(); } catch (_) {}
    }
};