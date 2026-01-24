const SftpClient = require('ssh2-sftp-client');
const path = require('path');

module.exports = async (localPath, remotePath) => {
    const sftp = new SftpClient();

    // ⚠️ 테스트용 하드코딩 (성공 확인 후 env로 바꿔도 됨)
    const config = {
        host: 'onlaveo.ddns.net',
        port: 22,
        username: 'onlaveo',
        password: 'onlaveoONL4458',
        // hostVerifier는 보안 강화를 위해 나중에 추가 가능
    };

    try {
        await sftp.connect(config);

        // remotePath 예: /onlaveo/files/xxx
        const remoteDir = path.posix.dirname(remotePath);

        // 디렉토리 없으면 생성
        if (!(await sftp.exists(remoteDir))) {
            await sftp.mkdir(remoteDir, true);
        }

        // 업로드
        await sftp.put(localPath, remotePath);
    } finally {
        try { await sftp.end(); } catch (_) {}
    }
};
