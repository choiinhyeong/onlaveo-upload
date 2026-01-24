const ftp = require('basic-ftp');
const path = require('path');

// ✅ 어디서 실행되든 무조건 이 .env를 읽게 고정
require('dotenv').config({ path: '/root/onlaveo-upload/.env' });

module.exports = async (localPath, remotePath) => {
    const client = new ftp.Client(30 * 1000);
    client.ftp.verbose = false;

    const host = process.env.NAS_HOST;
    const port = Number(process.env.NAS_FTP_PORT || 21);
    const user = process.env.NAS_FTP_USER;
    const password = process.env.NAS_FTP_PASS;

    if (!host || !user || !password) {
        throw new Error('Missing NAS env vars: NAS_HOST / NAS_FTP_USER / NAS_FTP_PASS');
    }

    try {
        await client.access({
            host,
            port,
            user,
            password,
            secure: false
        });

        // ✅ 원격 폴더 없으면 생성 (권한 없으면 여기서 550 뜸)
        const remoteDir = path.posix.dirname(remotePath);
        await client.ensureDir(remoteDir);

        await client.uploadFrom(localPath, remotePath);
    } finally {
        client.close();
    }
};
