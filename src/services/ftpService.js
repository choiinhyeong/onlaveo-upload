const ftp = require("basic-ftp");
const path = require("path");

/**
 * 나스 서버로 파일 업로드 (동적 경로 생성 포함)
 */
module.exports = async (localPath, targetDir, fileName) => {
    const client = new ftp.Client();
    client.ftp.timeout = 60000; // 타임아웃 1분

    try {
        await client.access({
            host: process.env.NAS_HOST,
            user: process.env.NAS_FTP_USER,
            password: process.env.NAS_FTP_PASS,
            port: 21,
            secure: false
        });

        // 패시브 모드 및 IPv4 최적화
        client.ftp.ipFamily = 4;
        client.ftp.pasvUrlReplacement = true;

        // ✅ PHP의 ftp_mkdir_recursive와 동일한 기능
        // targetDir가 없으면 전체 경로를 계층적으로 생성하고 이동합니다.
        await client.ensureDir(targetDir);
        console.log(`📂 나스 목적지 준비 완료: ${targetDir}`);

        // 업로드 실행
        await client.uploadFrom(localPath, fileName);
        console.log(`✅ 나스 업로드 최종 성공: ${targetDir}/${fileName}`);

    } catch (err) {
        console.error("❌ FTP 서비스 상세 에러:", err.message);
        throw err;
    } finally {
        client.close();
    }
};