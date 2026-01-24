const SftpClient = require('ssh2-sftp-client');

module.exports = async (localPath, remotePath) => {
    const sftp = new SftpClient();

    const config = {
        host: process.env.NAS_HOST,
        user: process.env.NAS_FTP_USER,
        password: process.env.NAS_FTP_PASS,
        port: 22,
    };

    try {
        await sftp.connect(config);

        // ✅ mkdir 하지 않음 (권한/경로 꼬임 방지)
        // remotePath 예: "files/1700000000_hosts"
        await sftp.put(localPath, remotePath);
    } finally {
        try { await sftp.end(); } catch (_) {}
    }
};
