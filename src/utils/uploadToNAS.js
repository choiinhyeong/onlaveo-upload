const ftp = require('basic-ftp');

module.exports = async function uploadToNAS(localPath, fileName) {
    const client = new ftp.Client();

    try {
        await client.access({
            host: process.env.NAS_HOST,
            user: process.env.NAS_FTP_USER,
            password: process.env.NAS_FTP_PASS,
            port: 22
        });

        await client.ensureDir('/onlaveo/files');
        await client.uploadFrom(localPath, `/onlaveo/files/${fileName}`);
    } finally {
        client.close();
    }
};
