const uploadToNAS = require('../services/ftpService');
const fs = require('fs');

exports.upload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'file is required' });
        }

        const localPath = req.file.path;
        console.log(`[LOCAL] 업로드 시도하는 임시 파일 위치: ${localPath}`);

        if (!fs.existsSync(localPath)) {
            throw new Error(`로컬 파일을 찾을 수 없습니다: ${localPath}`);
        }

        // 파일명 안전하게 변경
        const safeOriginal = (req.file.originalname || 'file').replace(/[^\w.\-]/g, '_');
        const fileName = `${Date.now()}_${safeOriginal}`;

        // ✅ [중요 수정] 이제 서비스 내부에서 cd("/onlaveo/files")를 하므로
        // 서비스에는 '파일명'만 넘겨주면 됩니다.
        await uploadToNAS(localPath, fileName);

        // 업로드 성공 후 로컬 임시 파일 삭제
        fs.unlink(localPath, (err) => {
            if (err) console.error('임시 파일 삭제 실패:', err);
        });

        return res.json({
            success: true,
            fileName,
            filePath: `/onlaveo/files/${fileName}`, // 최종 경로 보고 (나스 실제 경로 기준)
        });
    } catch (e) {
        console.error('❌ 컨트롤러 업로드 에러:', e);

        // 에러 발생 시에도 임시 파일이 남지 않도록 삭제 시도
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(500).json({ success: false, message: String(e.message || e) });
    }
};