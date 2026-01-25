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

        // 1. 현재 접속된 위치가 어디인지 로그로 찍어 확인합니다.
        const currentDir = await sftp.pwd();
        console.log(`📡 SFTP 접속 현재 위치(PWD): ${currentDir}`);

        // 2. 파일명만 추출
        const fileName = path.basename(remotePath);

        // 3. 경로를 완전히 단순화합니다.
        // /onlaveo/files 인지 그냥 files 인지 서버가 알아서 판단하게 합니다.
        // 터미널에서 cd onlaveo -> cd files가 성공했으므로 이 순차적 경로를 사용합니다.
        let finalPath = '';
        if (currentDir === '/') {
            finalPath = `onlaveo/files/${fileName}`;
        } else if (currentDir.includes('onlaveo')) {
            finalPath = `files/${fileName}`;
        } else {
            // 예외 상황 대비: 최대한 원본 경로 유지
            finalPath = remotePath.replace(/^\/+/, '');
        }

        console.log(`🚀 최종 업로드 시도 경로: ${finalPath}`);

        // 4. 즉시 업로드 (mkdir 없이)
        await sftp.put(localPath, finalPath);

        console.log(`✅ 나스 업로드 성공!`);
    } catch (err) {
        console.error('❌ SFTP 최종 에러:', err.message);
        throw err;
    } finally {
        try { await sftp.end(); } catch (_) {}
    }
};