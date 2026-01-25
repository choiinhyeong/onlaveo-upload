const fs = require('fs');
const path = require('path');

// 폴더명으로 사용할 수 없는 문자 제거 함수 (PHP 로직 이식)
const safeFolderName = (name) => {
    return name ? name.replace(/[^a-zA-Z0-9가-힣_-]/gu, '_') : 'unknown';
};

exports.upload = async (req, res) => {
    try {
        const files = req.files || (req.file ? [req.file] : []);
        if (files.length === 0) return res.status(400).send("파일이 없습니다.");

        const { regEmail, regTitle } = req.body;
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");

        // PHP 로직과 동일하게 폴더명 정리
        const folderEmail = safeFolderName(regEmail);
        const folderTitle = safeFolderName(regTitle);

        // ✅ 서버 내부 저장 절대 경로 (프로젝트 루트의 uploads 폴더 기준)
        // __dirname은 현재 파일(controllers) 위치이므로 한 단계 위(..)로 이동
        const storageDir = path.join(__dirname, '../uploads', folderEmail, today, folderTitle);

        // 폴더가 없으면 하위 계층까지 한 번에 생성
        if (!fs.existsSync(storageDir)) {
            fs.mkdirSync(storageDir, { recursive: true });
        }

        files.forEach((file, index) => {
            // 파일명 중복 방지를 위해 타임스탬프와 인덱스 추가
            const safeFileName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
            const saveName = `${Date.now()}_${index}_${safeFileName}`;
            const finalPath = path.join(storageDir, saveName);

            // 임시 폴더에서 최종 저장 위치로 이동
            if (fs.existsSync(file.path)) {
                fs.renameSync(file.path, finalPath);
            }
        });

        console.log(`✅ [성공] ${files.length}개 파일 저장 완료: ${storageDir}`);

        return res.json({
            success: true,
            message: "서버 로컬 저장 완료!",
            count: files.length
        });

    } catch (e) {
        console.error("❌ 업로드 컨트롤러 에러:", e.message);
        return res.status(500).json({ success: false, message: e.message });
    }
};

// NAS에 저장하는거
// const uploadToNAS = require('../services/ftpService');
// const fs = require('fs');
//
// // PHP: preg_replace('/[^a-zA-Z0-9가-힣_-]/u', '_', $name);
// const safeFolderName = (name) => {
//     return name.replace(/[^a-zA-Z0-9가-힣_-]/gu, '_');
// };
//
// exports.upload = async (req, res) => {
//     const uploadedLocalPaths = [];
//     try {
//         const files = req.files || (req.file ? [req.file] : []);
//         if (files.length === 0) return res.status(400).json({ success: false, message: "파일 없음" });
//
//         const { regEmail, regTitle } = req.body;
//
//         // PHP: $today = date("Ymd");
//         const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
//
//         const folderEmail = safeFolderName(regEmail || 'unknown');
//         const folderTitle = safeFolderName(regTitle || 'untitled');
//
//         // ✅ 파일질라 스크린샷 기준 최종 디렉토리 구조 (/onlaveo/files/...)
//         const targetBaseDir = `/onlaveo/files/${folderEmail}/${today}/${folderTitle}`;
//
//         const fileTasks = files.map((file, index) => {
//             uploadedLocalPaths.push(file.path);
//
//             // PHP: $saveName = $fileOrder . "_" . $originFileName;
//             // 여기서는 안전을 위해 index와 원래 파일명을 조합합니다.
//             const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
//             const saveName = `${index}_${safeOriginal}`;
//
//             return {
//                 localPath: file.path,
//                 fileName: saveName
//             };
//         });
//
//         // NAS 업로드 실행
//         await uploadToNAS(fileTasks, targetBaseDir);
//
//         // 로컬 임시 파일 삭제
//         uploadedLocalPaths.forEach(p => { if (fs.existsSync(p)) fs.unlinkSync(p); });
//
//         return res.json({
//             success: true,
//             message: "NAS 업로드 성공",
//             dir: targetBaseDir,
//             count: fileTasks.length
//         });
//
//     } catch (e) {
//         console.error("❌ 컨트롤러 에러:", e.message);
//         uploadedLocalPaths.forEach(p => { if (fs.existsSync(p)) fs.unlinkSync(p); });
//         return res.status(500).json({ success: false, message: e.message });
//     }
// };