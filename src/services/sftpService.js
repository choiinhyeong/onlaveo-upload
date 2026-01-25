const SftpClient = require('ssh2-sftp-client');
const path = require('path');

module.exports = async (localPath, remotePath) => {
    const sftp = new SftpClient();

    try {
        await sftp.connect({
            host: process.env.NAS_HOST,
            username: process.env.NAS_FTP_USER,
            password: process.env.NAS_FTP_PASS,
            port: 22,
            readyTimeout: 40000, // 대기 시간을 조금 더 늘림
        });

        console.log('🔗 SFTP 연결 성공');

        // 순차적 폴더 이동 (이미 검증됨)
        await sftp.cwd('onlaveo');
        await sftp.cwd('files');
        console.log('📂 나스 최종 목적지 진입 완료');

        const fileName = path.basename(remotePath);

        // ✅ [핵심 수정] 전송 옵션을 추가합니다.
        // 나스 서버에 따라 기본 패킷 크기가 너무 크면 'No response'를 뱉을 수 있습니다.
        await sftp.put(localPath, fileName, {
            flags: 'w',           // 쓰기 모드
            encoding: null,       // 바이너리 데이터 유지
            mode: 0o666,          // 권한 설정
            autoClose: true       // 완료 후 스트림 닫기
        });

        console.log(`✅ 나스 업로드 최종 성공: ${fileName}`);

    } catch (err) {
        // 만약 'No response'가 계속 뜨면 fastPut으로 교체해볼 수 있습니다.
        console.error('❌ SFTP 상세 에러:', err.message);
        throw err;
    } finally {
        try { await sftp.end(); } catch (_) {}
    }
};