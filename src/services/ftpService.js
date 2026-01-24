const ftp = require('basic-ftp');
const path = require('path');

module.exports = async (localPath, remotePath) => {
    const client = new ftp.Client(30 * 1000);
    client.ftp.verbose = true; // 🔍 디버깅용

    try {
        await client.access({
            host: 'onlaveo.ddns.net',
            port: 21,
            user: 'onlaveo',
            password: 'onlaveoONL4458',
            secure: false,
        });

        const remoteDir = path.posix.dirname(remotePath);
        await client.ensureDir(remoteDir);

        await client.uploadFrom(localPath, remotePath);
    } finally {
        client.close();
    }
};
