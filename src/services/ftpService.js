const ftp = require("basic-ftp");

module.exports = async (fileTasks, targetDir) => {
    const client = new ftp.Client();
    client.ftp.timeout = 600000; // 10분 설정

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

        // 폴더를 한 번만 만들고 들어갑니다.
        await client.ensureDir(targetDir);

        console.log(`🚀 일괄 전송 시작 (총 ${fileTasks.length}개)`);

        // ✅ 반복문 안에서 업로드만 수행 (연결 유지)
        for (const task of fileTasks) {
            console.log(`📡 전송 중: ${task.fileName}`);
            await client.uploadFrom(task.localPath, task.fileName);
        }

        console.log(`✅ 모든 파일 전송 완료!`);

    } catch (err) {
        console.error("❌ FTP 에러:", err.message);
        throw err;
    } finally {
        client.close(); // 마지막에 딱 한 번만 닫습니다.
    }
};