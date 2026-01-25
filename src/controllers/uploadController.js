const uploadToNAS = require('../services/ftpService');
const fs = require('fs');

// PHP: preg_replace('/[^a-zA-Z0-9가-힣_-]/u', '_', $name);
const safeFolderName = (name) => {
    return name.replace(/[^a-zA-Z0-9가-힣_-]/gu, '_');
};

exports.upload = async (req, res) => {
    const uploadedLocalPaths = [];
    try {
        const files = req.files || (req.file ? [req.file] : []);
        if (files.length === 0) return res.status(400).json({ success: false, message: "파일 없음" });

        const { regEmail, regTitle } = req.body;

        // PHP: $today = date("Ymd");
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");

        const folderEmail = safeFolderName(regEmail || 'unknown');
        const folderTitle = safeFolderName(regTitle || 'untitled');

        // ✅ 파일질라 스크린샷 기준 최종 디렉토리 구조 (/onlaveo/files/...)
        const targetBaseDir = `/onlaveo/files/${folderEmail}/${today}/${folderTitle}`;

        const fileTasks = files.map((file, index) => {
            uploadedLocalPaths.push(file.path);

            // PHP: $saveName = $fileOrder . "_" . $originFileName;
            // 여기서는 안전을 위해 index와 원래 파일명을 조합합니다.
            const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
            const saveName = `${index}_${safeOriginal}`;

            return {
                localPath: file.path,
                fileName: saveName
            };
        });

        // NAS 업로드 실행
        await uploadToNAS(fileTasks, targetBaseDir);

        // 로컬 임시 파일 삭제
        uploadedLocalPaths.forEach(p => { if (fs.existsSync(p)) fs.unlinkSync(p); });

        return res.json({
            success: true,
            message: "NAS 업로드 성공",
            dir: targetBaseDir,
            count: fileTasks.length
        });

    } catch (e) {
        console.error("❌ 컨트롤러 에러:", e.message);
        uploadedLocalPaths.forEach(p => { if (fs.existsSync(p)) fs.unlinkSync(p); });
        return res.status(500).json({ success: false, message: e.message });
    }
};