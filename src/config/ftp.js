const ftp = require('basic-ftp');

module.exports = async (localPath, remoteDir, fileName) => {
    const client = new ftp.Client();

    try {
        await client.access({
            host: 'onlaveo.ddns.net',
            user: 'onlaveo',
            password: 'onlaveoONL4458'
        });

        await client.ensureDir(remoteDir);
        await client.uploadFrom(localPath, `${remoteDir}/${fileName}`);
    } finally {
        client.close();
    }
};
