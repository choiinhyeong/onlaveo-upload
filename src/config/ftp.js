const ftp = require('basic-ftp');

async function uploadToNAS(localPath, remoteFileName) {
    const client = new ftp.Client();
    client.ftp.verbose = false;

    try {
        await client.access({
            host: 'onlaveo.ddns.net',
            port: 21,
            user: 'onlaveo',
            password: 'onlaveoONL4458'
        });

        await client.ensureDir('/onlaveo/files');
        await client.uploadFrom(localPath, `/onlaveo/files/${remoteFileName}`);
    } finally {
        client.close();
    }
}

module.exports = uploadToNAS;
