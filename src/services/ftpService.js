const ftp = require("basic-ftp");

/**
 * 나스 서버로 파일 일괄 업로드
 * @param {Array} fileTasks - [{ localPath, fileName }]
 * @param {string} targetDir - 나스 저장 경로 (예: files/user/20260126/title)
 */
module.exports = async (fileTasks, targetDir) => {
    const client = new ftp.Client();
    // 속도가 느린 환경이므로 타임아웃을 10분으로 넉넉히 설정
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

        console.log("🔗 FTP 연결 성공. 현재 위치:", await client.pwd());

        // PHP의 ftp_mkdir_recursive와 동일: 폴더가 없으면 생성하고 진입
        await client.ensureDir(targetDir);
        console.log(`📂 목적지 이동 완료: ${targetDir}`);

        for (const task of fileTasks) {
            console.log(`🚀 업로드 시작: ${task.fileName}`);
            await client.uploadFrom(task.localPath, task.fileName);
            console.log(`✅ 업로드 완료: ${task.fileName}`);
        }

    } catch (err) {
        console.error("❌ FTP 서비스 상세 에러:", err.message);
        throw err;
    } finally {
        client.close();
    }
};