const uploadToNAS = require('../services/ftpService');
const fs = require('fs');
const path = require('path');

// PHP: preg_replace('/[^a-zA-Z0-9가-힣_-]/u', '_', $name);
const safeFolderName = (name) => {
    return name.replace(/[^a-zA-Z0-9가-힣_-]/gu, '_');
};

exports.upload = async (req, res) => {
    const uploadedLocalPaths = [];
    try {
        // 단일 파일(req.file) 또는 다중 파일(req.files) 대응
        const files = req.files || (req.file ? [req.file] : []);
        if (files.length === 0) return res.status(400).json({ success: false, message: "파일 없음" });

        const { regEmail, regTitle } = req.body;

        // PHP와 동일한 날짜 포맷 (Ymd)
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");

        const folderEmail = safeFolderName(regEmail || 'unknown');
        const folderTitle = safeFolderName(regTitle || 'untitled');

        // ✅ 550 에러 방지: 나스 접속 시 'onlaveo'가 루트라면 'files/'부터 시작해야 함
        const targetBaseDir = `files/${folderEmail}/${today}/${folderTitle}`;

        // 전송할 파일 리스트 정리
        const fileTasks = files.map((file, index) => {
            uploadedLocalPaths.push(file.path);

            // PHP: $saveName = $fileOrder . "_" . $originFileName;
            // 여기서는 안전을 위해 index와 타임스탬프를 조합하거나 PHP 규칙을 따릅니다.
            const safeOriginName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
            const saveName = `${index}_${Date.now()}_${safeOriginName}`;

            return {
                localPath: file.path,
                fileName: saveName
            };
        });

        // NAS 업로드 실행 (일괄 전송)
        await uploadToNAS(fileTasks, targetBaseDir);

        // 로컬 임시 파일 삭제
        uploadedLocalPaths.forEach(p => { if (fs.existsSync(p)) fs.unlinkSync(p); });

        return res.json({
            success: true,
            message: "나스 업로드 성공",
            path: targetBaseDir,
            count: fileTasks.length
        });

    } catch (e) {
        console.error("❌ 컨트롤러 에러:", e.message);
        uploadedLocalPaths.forEach(p => { if (fs.existsSync(p)) fs.unlinkSync(p); });
        return res.status(500).json({ success: false, message: e.message });
    }
};