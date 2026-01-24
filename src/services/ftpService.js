const ftp = require('basic-ftp');
const path = require('path');
require('dotenv').config();

module.exports = async (localPath, remotePath) => {
    const client = new ftp.Client(30 * 1000);
    client.ftp.verbose = false;

    const host = "onlaveo.ddns.net";
    const port = Number(21);
    const user = "onlaveo";
    const password = "onlaveoONL4458";

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

        // remotePath의 디렉토리 없으면 생성
        const remoteDir = path.posix.dirname(remotePath);
        await client.ensureDir(remoteDir);

        // 업로드
        await client.uploadFrom(localPath, remotePath);
    } finally {
        client.close();
    }
};
