const uploadToNAS = require('../services/sftpService');

exports.upload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'file is required' });
        }

        const safeOriginal = (req.file.originalname || 'file').replace(/[^\w.\-]/g, '_');
        const fileName = `${Date.now()}_${safeOriginal}`;

        // NAS 저장 경로
        const remotePath = `/onlaveo/files/${fileName}`;

        await uploadToNAS(req.file.path, remotePath);

        return res.json({
            success: true,
            fileName,
            filePath: remotePath,
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false });
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
