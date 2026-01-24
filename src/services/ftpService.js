const ftp = require('basic-ftp');

module.exports = async (localPath, remotePath) => {
    const client = new ftp.Client();
    try {
        await client.access({
            host: 'NAS_IP',
            user: 'FTP_ID',
            password: 'FTP_PW',
            secure: false
        });

        await client.uploadFrom(localPath, remotePath);
    } finally {
        client.close();
    }
};
