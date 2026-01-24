const uploadToNAS = require('../services/sftpService');
const fs = require('fs'); // 파일 확인용

exports.upload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'file is required' });
        }

        // 1. 로컬 경로 확인 (에러 로그 추적용)
        const localPath = req.file.path;
        console.log(`[LOCAL] 업로드 시도하는 임시 파일 위치: ${localPath}`);

        if (!fs.existsSync(localPath)) {
            throw new Error(`로컬 파일을 찾을 수 없습니다: ${localPath}`);
        }

        const safeOriginal = (req.file.originalname || 'file').replace(/[^\w.\-]/g, '_');
        const fileName = `${Date.now()}_${safeOriginal}`;

        // ✅ sftpService 내부에서 /onlaveo를 붙여주므로 여기서는 'files/파일명'만 전달
        const remotePath = `files/${fileName}`;

        await uploadToNAS(localPath, remotePath);

        // ✅ 업로드 성공 후 로컬 임시 파일 삭제 (용량 관리)
        fs.unlink(localPath, (err) => {
            if (err) console.error('임시 파일 삭제 실패:', err);
        });

        return res.json({
            success: true,
            fileName,
            filePath: `/onlaveo/${remotePath}`, // 최종 경로 보고
        });
    } catch (e) {
        console.error('❌ 컨트롤러 업로드 에러:', e);
        return res.status(500).json({ success: false, message: String(e.message || e) });
    }
};

// ftp 방식일때
// const fs = require('fs/promises');
// require('dotenv').config();
//
// const uploadToNAS = require('../services/ftpService');
//
// exports.upload = async (req, res) => {
//     let localTmpPath = null;
//
//     try {
//         if (!req.file) {
//             return res.status(400).json({ success: false, message: 'file is required' });
//         }
//
//         localTmpPath = req.file.path;
//
//         // 원본 파일명 최소 정리(특수문자/공백)
//         const safeOriginalName = (req.file.originalname || 'file')
//             .replace(/[/\\?%*:|"<>]/g, '_')
//             .replace(/\s+/g, '_');
//
//         const fileName = `${Date.now()}_${safeOriginalName}`;
//
//         // ✅ NAS 최종 경로 (네가 말한: /onlaveo/files/)
//         const baseDir = (process.env.NAS_TARGET_DIR || '/onlaveo/files').replace(/\/+$/, '');
//         const remotePath = `${baseDir}/${fileName}`;
//
//         await uploadToNAS(localTmpPath, remotePath);
//
//         // ✅ NAS 업로드 성공 후 tmp 파일 삭제
//         await fs.unlink(localTmpPath);
//
//         return res.json({
//             success: true,
//             fileName,
//             filePath: remotePath
//         });
//     } catch (e) {
//         console.error(e);
//
//         // 실패해도 tmp 정리 시도
//         if (localTmpPath) {
//             try { await fs.unlink(localTmpPath); } catch (_) {}
//         }
//
//         return res.status(500).json({ success: false });
//     }
// };
