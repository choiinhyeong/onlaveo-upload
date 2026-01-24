const SftpClient = require('ssh2-sftp-client');

module.exports = async (localPath, remotePath) => {
    const sftp = new SftpClient();

    const config = {
        host: process.env.NAS_HOST,
        user: process.env.NAS_FTP_USER,
        password: process.env.NAS_FTP_PASS,
        port: 22,

        // ✅ 연결 성립/인증 대기 시간 늘리기
        readyTimeout: 30000,

        // ✅ 전송 중 idle 끊김 방지 (NAS/공유기에서 유용)
        keepaliveInterval: 10000,
        keepaliveCountMax: 3,
    };

    try {
        await sftp.connect(config);

        // ✅ put 스트림 대신 fastPut이 더 안정적인 NAS들이 있음
        // concurrency 낮추고(=부하 줄이기), chunkSize 조절
        await sftp.fastPut(localPath, remotePath, {
            concurrency: 1,
            chunkSize: 32768,
            step: (transferred, chunk, total) => {
                // 필요하면 진행률 로그 찍을 수 있음 (지금은 주석)
                // console.log(`SFTP ${remotePath}: ${transferred}/${total}`);
            },
        });
    } finally {
        try { await sftp.end(); } catch (_) {}
    }
};
