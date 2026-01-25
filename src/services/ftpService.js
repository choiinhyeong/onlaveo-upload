const ftp = require("basic-ftp");
const path = require("path");

/**
 * 나스 서버로 파일 업로드 (FTP 21번 포트 방식)
 */
module.exports = async (localPath, remotePath) => {
    const client = new ftp.Client();
    // 타임아웃을 60초로 넉넉하게 설정
    client.ftp.timeout = 60000;

    try {
        await client.access({
            host: process.env.NAS_HOST,
            user: process.env.NAS_FTP_USER,
            password: process.env.NAS_FTP_PASS,
            port: 21,           // PHP 성공 포트
            secure: false       // 일반 FTP 모드
        });

        console.log("🔗 FTP(21번) 연결 및 로그인 성공");

        // ✅ 파일질라 경로 구조 반영: /onlaveo/files 로 이동
        // 만약 에러가 나면 'onlaveo/files' (앞의 / 제거)로 시도해보세요.
        await client.cd("/onlaveo/files");
        console.log("📂 나스 목적지 폴더 진입 완료");

        const fileName = path.basename(remotePath);

        // ✅ 전송 상태 모니터링 로그 추가
        client.trackProgress(info => {
            console.log(`📊 전송 중: ${info.name} (${info.bytesOverall} bytes 완료)`);
        });

        // ✅ 실제 업로드 실행 (PHP의 ftp_put 역할)
        await client.uploadFrom(localPath, fileName);

        console.log(`✅ 나스 업로드 최종 성공: ${fileName}`);

    } catch (err) {
        console.error("❌ FTP 서비스 상세 에러:", err.message);
        throw err;
    } finally {
        // 연결 종료
        client.close();
        console.log("🔌 FTP 연결 종료");
    }
};