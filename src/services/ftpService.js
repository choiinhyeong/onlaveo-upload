const ftp = require("basic-ftp");

module.exports = async (files, targetDir) => {
    const client = new ftp.Client();
    // ✅ 타임아웃을 10분(600,000ms)으로 대폭 늘립니다. 현재 속도가 느리기 때문입니다.
    client.ftp.timeout = 600000;

    try {
        await client.access({
            host: process.env.NAS_HOST,
            user: process.env.NAS_FTP_USER,
            password: process.env.NAS_FTP_PASS,
            port: 21,
            secure: false
        });

        client.ftp.ipFamily = 4;
        client.ftp.pasvUrlReplacement = true;

        await client.ensureDir(targetDir);

        for (const file of files) {
            console.log(`🚀 전송 시작: ${file.fileName}`);
            // 개별 파일 전송 성공 여부를 확인하며 진행
            await client.uploadFrom(file.localPath, file.fileName);
            console.log(`✅ 전송 완료: ${file.fileName}`);
        }

    } catch (err) {
        // 상세 에러 로그 확인용
        console.error("❌ FTP 상세 에러 발생 원인:", err.code, err.message);
        throw err;
    } finally {
        client.close();
    }
};