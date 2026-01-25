const fs = require('fs');
const path = require('path');

// 폴더명 안전하게 처리
const safeFolderName = (name) => {
    return name ? name.replace(/[^a-zA-Z0-9가-힣_-]/gu, '_') : 'unknown';
};

exports.upload = async (req, res) => {
    try {
        const files = req.files || (req.file ? [req.file] : []);
        if (files.length === 0) return res.status(400).send("파일이 없습니다.");

        const { regEmail, regTitle } = req.body;
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");

        const folderEmail = safeFolderName(regEmail);
        const folderTitle = safeFolderName(regTitle);

        // ✅ 1. 절대 경로로 지정 (서버 터미널에서 pwd 쳤을 때 나오는 경로 확인)
        // 만약 소스가 /root/onlaveo-upload 폴더에 있다면 아래처럼 적으세요.
        const projectRoot = '/root/onlaveo-upload';
        const storageDir = path.join(projectRoot, 'uploads', folderEmail, today, folderTitle);

        // ✅ 2. 폴더가 없으면 생성
        if (!fs.existsSync(storageDir)) {
            fs.mkdirSync(storageDir, { recursive: true });
            console.log(`📁 폴더 생성됨: ${storageDir}`);
        }

        files.forEach((file, index) => {
            const safeFileName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
            const saveName = `${Date.now()}_${index}_${safeFileName}`;
            const finalPath = path.join(storageDir, saveName);

            // ✅ 3. multer가 tmp에 넣은 파일을 새 위치로 이동
            if (fs.existsSync(file.path)) {
                fs.renameSync(file.path, finalPath);
                console.log(`✅ 이동 완료: ${file.path} -> ${finalPath}`);
            } else {
                console.error(`❌ 원본 파일(tmp)을 찾을 수 없음: ${file.path}`);
            }
        });

        return res.json({ success: true, message: "서버 로컬 저장 완료!" });

    } catch (e) {
        console.error("❌ 업로드 에러 상세:", e);
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