const uploadToNAS = require('../services/ftpService');
const fs = require('fs');

exports.upload = async (req, res) => {
    const uploadedFiles = []; // 업로드 완료 후 삭제할 목록
    try {
        // req.file(단일) 대신 req.files(다중)를 처리하도록 수정
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ success: false, message: '파일이 없습니다.' });
        }

        const { regEmail, regTitle } = req.body;
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const targetBaseDir = `/onlaveo/files/${safeFolderName(regEmail)}/${today}/${safeFolderName(regTitle)}/`;

        // 1. FTP 서비스에 넘길 파일 리스트 정리
        const fileTasks = files.map((file, index) => {
            const saveName = `${Date.now()}_${index}_${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
            uploadedFiles.push(file.path); // 나중에 삭제하기 위해 저장
            return {
                localPath: file.path,
                fileName: saveName
            };
        });

        // 2. 단 한 번의 연결로 모든 파일 업로드 실행
        await uploadToNAS(fileTasks, targetBaseDir);

        // 3. 로컬 임시 파일 일괄 삭제
        uploadedFiles.forEach(path => { if (fs.existsSync(path)) fs.unlinkSync(path); });

        return res.json({ success: true, count: files.length, dir: targetBaseDir });

    } catch (e) {
        uploadedFiles.forEach(path => { if (fs.existsSync(path)) fs.unlinkSync(path); });
        return res.status(500).json({ success: false, message: e.message });
    }
};