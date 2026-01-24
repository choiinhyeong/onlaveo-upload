const ftp = require('basic-ftp');

module.exports = async function uploadToNAS(localPath, fileName) {
    const client = new ftp.Client();

    try {
        await client.access({
            host: 'onlaveo.ddns.net',
            user: 'onlaveo',
            password: 'onlaveoONL4458',
            port: 21
        });

        await client.ensureDir('/onlaveo/files');
        await client.uploadFrom(localPath, `/onlaveo/files/${fileName}`);
    } finally {
        client.close();
    }
};
