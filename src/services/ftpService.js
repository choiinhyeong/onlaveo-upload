const ftp = require("basic-ftp");
const path = require("path");

/**
 * 나스 서버로 파일 업로드 (FTP 21번 포트 방식)
 */
module.exports = async (localPath, remotePath) => {
    const client = new ftp.Client();

    // 타임아웃을 60초로 설정하여 대용량 파일이나 느린 연결에 대비
    client.ftp.timeout = 60000;

    try {
        await client.access({
            host: process.env.NAS_HOST,
            user: process.env.NAS_FTP_USER,
            password: process.env.NAS_FTP_PASS,
            port: 21,           // PHP에서 성공했던 포트
            secure: false       // 일반 FTP 모드 (보안 연결 미사용)
        });

        // ✅ IPv4 연결 강제: 패시브 모드 타임아웃 방지를 위한 핵심 설정
        client.ftp.ipFamily = 4;

        console.log("🔗 FTP(21번) 연결 및 로그인 성공 (IPv4)");

        // ✅ 나스 내 실제 저장 폴더로 이동
        // 파일질라에서 확인한 /onlaveo/files 경로 기준
        await client.cd("/onlaveo/files");
        console.log("📂 나스 목적지 폴더 진입 완료");

        // 전달받은 remotePath에서 파일명만 추출
        const fileName = path.basename(remotePath);

        // ✅ 전송 상태 실시간 모니터링 (pm2 logs에서 확인 가능)
        client.trackProgress(info => {
            console.log(`📊 전송 중: ${info.name} (${info.bytesOverall} bytes 완료)`);
        });

        // ✅ 실제 업로드 실행
        await client.uploadFrom(localPath, fileName);

        console.log(`✅ 나스 업로드 최종 성공: ${fileName}`);

    } catch (err) {
        console.error("❌ FTP 서비스 상세 에러:", err.message);
        throw err; // 에러를 컨트롤러로 던져서 처리하게 함
    } finally {
        // 성공/실패 여부와 상관없이 연결을 안전하게 닫음
        client.close();
        console.log("🔌 FTP 연결 종료");
    }
};