const ftp = require("basic-ftp");
const path = require("path");

/**
 * 나스 서버로 파일 업로드 (FTP 21번 포트 방식)
 */
module.exports = async (localPath, remotePath) => {
    const client = new ftp.Client();

    // 타임아웃 60초 설정 (대용량 파일 대비)
    client.ftp.timeout = 60000;

    try {
        await client.access({
            host: process.env.NAS_HOST,
            user: process.env.NAS_FTP_USER,
            password: process.env.NAS_FTP_PASS,
            port: 21,
            secure: false
        });

        // ✅ [핵심] 패시브 모드 최적화 설정
        client.ftp.ipFamily = 4;                // IPv4 강제
        client.ftp.pasvUrlReplacement = true;   // 나스가 내부 사설 IP를 응답할 경우 호스트 주소로 자동 교체

        console.log("🔗 FTP(21번) 연결 및 로그인 성공 (IPv4/PASV 최적화)");

        // 나스 내 저장 폴더로 이동
        await client.cd("/onlaveo/files");
        console.log("📂 나스 목적지 폴더 진입 완료");

        const fileName = path.basename(remotePath);

        // 전송 상태 모니터링
        client.trackProgress(info => {
            console.log(`📊 전송 중: ${info.name} (${info.bytesOverall} bytes 완료)`);
        });

        // 실제 업로드 실행
        await client.uploadFrom(localPath, fileName);

        console.log(`✅ 나스 업로드 최종 성공: ${fileName}`);

    } catch (err) {
        console.error("❌ FTP 서비스 상세 에러:", err.message);
        throw err;
    } finally {
        client.close();
        console.log("🔌 FTP 연결 종료");
    }
};