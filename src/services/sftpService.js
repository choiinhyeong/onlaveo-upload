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

        console.log('🔗 SFTP 연결 성공');

        // ✅ 수정: cd 대신 cwd를 사용하여 한 단계씩 이동합니다.
        // 1단계: onlaveo 폴더로 이동
        await sftp.cwd('onlaveo');
        console.log('📂 1단계: onlaveo 진입 성공');

        // 2단계: files 폴더로 이동
        await sftp.cwd('files');
        console.log('📂 2단계: files 진입 성공');

        // 3단계: 파일명만 추출해서 현재 폴더에 업로드
        const fileName = path.basename(remotePath);
        console.log(`🚀 최종 업로드 파일명: ${fileName}`);

        // 현재 위치(onlaveo/files)에 파일 업로드
        await sftp.put(localPath, fileName);

        console.log(`✅ 나스 업로드 최종 성공!`);

    } catch (err) {
        console.error('❌ SFTP 상세 에러:', err.message);
        throw err;
    } finally {
        try { await sftp.end(); } catch (_) {}
    }
};