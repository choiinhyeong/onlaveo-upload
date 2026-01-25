const ftp = require("basic-ftp");

/**
 * 나스 서버로 여러 파일 일괄 업로드
 * @param {Array} files - [{ localPath, fileName }] 형태의 배열
 * @param {string} targetDir - 나스 저장 경로
 */
module.exports = async (files, targetDir) => {
    const client = new ftp.Client();
    client.ftp.timeout = 120000; // 40장을 대비해 타임아웃을 2분으로 늘림

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

        // 1. 목적지 폴더 한 번만 생성 및 이동
        await client.ensureDir(targetDir);

        // 2. 연결을 유지한 채로 파일 배열을 순회하며 업로드
        for (const file of files) {
            console.log(`🚀 업로드 시작: ${file.fileName}`);
            await client.uploadFrom(file.localPath, file.fileName);
        }

        console.log(`✅ 총 ${files.length}개 파일 업로드 완료`);

    } catch (err) {
        console.error("❌ FTP 일괄 업로드 에러:", err.message);
        throw err;
    } finally {
        client.close(); // 모든 작업이 끝나고 단 한 번만 닫음
    }
};