const ftp = require('basic-ftp');
const path = require('path');
const fs = require('fs');

function safe(str) {
    return str.replace(/[^a-zA-Z0-9가-힣_-]/g, '_');
}

async function uploadToNAS(localPath, options) {
    const {
        email,
        title,
        fileOrder,
        originalName
    } = options;

    const client = new ftp.Client();
    client.ftp.verbose = false;

    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    const remoteDir = `/onlaveo/files/${safe(email)}/${today}/${safe(title)}`;
    const saveName = `${fileOrder}_${originalName}`;

    try {
        await client.access({
            host: 'onlaveo.ddns.net',
            port: 21,
            user: 'onlaveo',
            password: 'onlaveoONL4458',
            secure: false
        });

        await client.ensureDir(remoteDir);
        await client.uploadFrom(localPath, `${remoteDir}/${saveName}`);

        return {
            success: true,
            fileName: saveName,
            remotePath: `${remoteDir}/${saveName}`
        };
    } finally {
        client.close();
        fs.unlinkSync(localPath); // tmp 파일 삭제
    }
}

module.exports = uploadToNAS;
