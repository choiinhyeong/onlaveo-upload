const fs = require('fs');
const path = require('path');

const safeFolderName = (name) => {
    return name ? name.replace(/[^a-zA-Z0-9가-힣_-]/gu, '_') : 'unknown';
};

exports.upload = async (req, res) => {
    // multer가 처리한 파일 확인
    const files = req.files || (req.file ? [req.file] : []);

    try {
        if (files.length === 0) {
            return res.status(400).json({ success: false, message: "파일이 전송되지 않았습니다." });
        }

        const { regEmail, regTitle, fileOrder } = req.body;
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");

        const folderEmail = safeFolderName(regEmail);
        const folderTitle = safeFolderName(regTitle);

        const projectRoot = '/root/onlaveo-upload';
        const storageDir = path.join(projectRoot, 'uploads', folderEmail, today, folderTitle);

        // 폴더가 없으면 생성
        if (!fs.existsSync(storageDir)) {
            fs.mkdirSync(storageDir, { recursive: true });
        }

        let lastSavedName = "";

        files.forEach((file, index) => {
            // 프론트에서 보낸 순서 값 사용
            const order = Array.isArray(fileOrder) ? fileOrder[index] : (fileOrder || index);
            const safeOriginalName = file.originalname.replace(/\s+/g, '_');
            const saveName = `${order}_${safeOriginalName}`;
            const finalPath = path.join(storageDir, saveName);

            // 임시 폴더에서 최종 위치로 이동
            if (fs.existsSync(file.path)) {
                fs.renameSync(file.path, finalPath);
                lastSavedName = saveName;
                console.log(`✅ 저장 완료: ${saveName}`);
            }
        });

        return res.json({
            success: true,
            message: "서버 저장 성공",
            fileName: lastSavedName
        });

    } catch (e) {
        console.error("❌ 서버 업로드 에러:", e.message);
        return res.status(500).json({ success: false, message: e.message });
    } finally {
        // 에러가 나더라도 임시 파일은 삭제
        files.forEach(file => {
            if (fs.existsSync(file.path)) {
                try { fs.unlinkSync(file.path); } catch (err) {}
            }
        });
    }
};