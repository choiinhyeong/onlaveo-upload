const ftp = require("basic-ftp");
const path = require("path");

module.exports = async (localPath, remotePath) => {
    const client = new ftp.Client();
    // client.ftp.verbose = true; // 통신 과정을 보고 싶다면 주석을 해제하세요.

    try {
        await client.access({
            host: process.env.NAS_HOST,
            user: process.env.NAS_FTP_USER,
            password: process.env.NAS_FTP_PASS,
            port: 21,    // ✅ PHP가 성공했던 그 포트!
            secure: false // ✅ 일반 FTP (보안 연결 없이 PHP와 동일하게)
        });

        console.log("🔗 FTP(21번) 연결 성공");

        // 파일질라와 PHP에서 확인했던 경로로 이동
        // 앞의 슬래시 유무는 나스 설정에 따라 조절될 수 있습니다.
        await client.cd("/onlaveo/files");
        console.log("📂 목적지 폴더 이동 완료");

        const fileName = path.basename(remotePath);

        // ✅ PHP의 ftp_put과 동일한 동작을 수행합니다.
        await client.uploadFrom(localPath, fileName);

        console.log(`✅ 나스 업로드 최종 성공: ${fileName}`);

    } catch (err) {
        console.error("❌ FTP 전송 실패:", err.message);
        throw err;
    } finally {
        client.close();
    }
};