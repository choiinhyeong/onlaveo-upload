const fs = require('fs');
const path = require('path');

// 폴더명에 사용할 수 없는 특수문자 제거 함수
const safeFolderName = (name) => {
    return name ? name.replace(/[^a-zA-Z0-9가-힣_-]/gu, '_') : 'unknown';
};

exports.upload = async (req, res) => {
    // multer를 통해 들어온 파일 확인
    const files = req.files || (req.file ? [req.file] : []);

    try {
        if (files.length === 0) {
            return res.status(400).json({ success: false, message: "파일이 없습니다." });
        }

        const { regEmail, regTitle, fileOrder } = req.body;
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");

        const folderEmail = safeFolderName(regEmail);
        const folderTitle = safeFolderName(regTitle);

        // 실제 저장될 서버 경로
        const projectRoot = '/root/onlaveo-upload';
        const storageDir = path.join(projectRoot, 'uploads', folderEmail, today, folderTitle);

        // 목적지 폴더 생성
        if (!fs.existsSync(storageDir)) {
            fs.mkdirSync(storageDir, { recursive: true });
        }

        let lastSavedName = "";

        files.forEach((file, index) => {
            // 프론트에서 보낸 순서(fileOrder) 적용
            const order = Array.isArray(fileOrder) ? fileOrder[index] : (fileOrder || index);
            const safeOriginalName = file.originalname.replace(/\s+/g, '_');
            const saveName = `${order}_${safeOriginalName}`;
            const finalPath = path.join(storageDir, saveName);

            // 임시 파일(tmp)을 최종 경로로 이동
            if (fs.existsSync(file.path)) {
                fs.renameSync(file.path, finalPath);
                lastSavedName = saveName;
                console.log(`✅ 저장 완료: ${finalPath}`);
            }
        });

        // 성공 응답 (DB 저장을 위해 fileName 전달)
        return res.json({
            success: true,
            message: "서버 저장 성공",
            fileName: lastSavedName
        });

    } catch (e) {
        console.error("❌ 서버 내부 에러:", e.message);
        return res.status(500).json({ success: false, message: e.message });
    } finally {
        // 혹시라도 남아있을 임시 파일 강제 삭제
        files.forEach(file => {
            if (fs.existsSync(file.path)) {
                try { fs.unlinkSync(file.path); } catch (err) {}
            }
        });
    }
};