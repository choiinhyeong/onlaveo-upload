const ftp = require("basic-ftp");

module.exports = async (fileTasks, targetDir) => {
    const client = new ftp.Client();
    client.ftp.timeout = 600000; // 10분 설정 (2.5Gbps 서버여도 나스 속도 고려)

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

        // ✅ 파일질라 경로에 맞춰 절대 경로로 접근 시도
        // targetDir 예: /onlaveo/files/email/date/title
        console.log(`🔗 FTP 연결 성공. 목적지 생성 및 이동 중: ${targetDir}`);

        await client.ensureDir(targetDir);
        console.log(`📂 이동 완료: ${await client.pwd()}`);

        for (const task of fileTasks) {
            console.log(`🚀 업로드 시작: ${task.fileName}`);
            await client.uploadFrom(task.localPath, task.fileName);
            console.log(`✅ 완료: ${task.fileName}`);
        }

    } catch (err) {
        console.error("❌ FTP 서비스 상세 에러:", err.message);
        throw err;
    } finally {
        client.close();
    }
};