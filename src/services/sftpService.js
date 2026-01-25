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

        // ✅ 수정: pwd() 대신 cwd()를 사용합니다.
        const currentDir = await sftp.cwd();
        console.log(`📡 SFTP 접속 현재 위치(CWD): ${currentDir}`);

        const fileName = path.basename(remotePath);

        let finalPath = '';
        // 현재 위치에 따라 경로를 유연하게 조립합니다.
        if (currentDir === '/') {
            finalPath = `onlaveo/files/${fileName}`;
        } else if (currentDir.includes('onlaveo')) {
            // 이미 onlaveo 폴더 내부라면 files부터 시작
            finalPath = `files/${fileName}`;
        } else {
            // 그 외의 경우 슬래시를 제거한 상대 경로로 시도
            finalPath = remotePath.replace(/^\/+/, '');
        }

        console.log(`🚀 최종 업로드 시도 경로: ${finalPath}`);

        // 즉시 업로드 시도
        await sftp.put(localPath, finalPath);

        console.log(`✅ 나스 업로드 성공!`);
    } catch (err) {
        console.error('❌ SFTP 최종 에러:', err.message);
        throw err;
    } finally {
        try { await sftp.end(); } catch (_) {}
    }
};