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

        // 1단계: onlaveo 폴더로 이동
        // 앞서 ls에서 보였던 그 이름 그대로 들어갑니다.
        await sftp.cd('onlaveo');
        console.log('📂 1단계: onlaveo 진입 완료');

        // 2단계: files 폴더로 이동
        await sftp.cd('files');
        console.log('📂 2단계: files 진입 완료');

        // 3단계: 이제 위치가 /onlaveo/files 이므로 파일명만 사용해서 업로드
        const fileName = path.basename(remotePath);
        console.log(`🚀 최종 업로드 파일명: ${fileName}`);

        // 현재 폴더(.)에 바로 저장
        await sftp.put(localPath, `./${fileName}`);

        console.log(`✅ 나스 업로드 최종 성공!`);

    } catch (err) {
        console.error('❌ SFTP 최종 단계 에러:', err.message);
        throw err;
    } finally {
        try { await sftp.end(); } catch (_) {}
    }
};