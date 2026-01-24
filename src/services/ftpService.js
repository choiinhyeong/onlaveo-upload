const ftp = require('basic-ftp');
const path = require('path');

module.exports = async (localPath, remotePath) => {
    const client = new ftp.Client(30 * 1000);

    // 디버깅용: FTP 통신 로그 보고 싶으면 true
    client.ftp.verbose = true;

    try {
        await client.access({
            host: 'onlaveo.ddns.net',
            port: 21,
            user: 'onlaveo',
            password: 'onlaveoONL4458',
            secure: false,
        });

        // 예: remotePath = /onlaveo/files/xxx.txt
        const remoteDir = path.posix.dirname(remotePath);
        await client.ensureDir(remoteDir);

        await client.uploadFrom(localPath, remotePath);
    } finally {
        client.close();
    }
};
