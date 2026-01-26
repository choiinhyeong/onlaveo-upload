const fs = require('fs');
const path = require('path');

/**
 * 폴더명 및 파일명 안전하게 변환 (특수문자 및 공백 처리)
 */
const safeFolderName = (name) => {
    return name ? name.replace(/[^a-zA-Z0-9가-힣_-]/gu, '_') : 'unknown';
};

/**
 * [1] 개별 파일 업로드 (주로 대용량 영상용)
 */
exports.upload = async (req, res) => {
    // 단일 파일 혹은 배열의 첫 번째 파일 가져오기
    const file = req.file || (req.files && req.files[0]);

    try {
        if (!file) {
            return res.status(400).json({ success: false, message: "파일이 없습니다." });
        }

        const { regEmail, regTitle, fileOrder } = req.body;
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");

        // 저장 경로 설정
        const projectRoot = '/root/onlaveo-upload';
        const storageDir = path.join(
            projectRoot,
            'uploads',
            safeFolderName(regEmail),
            today,
            safeFolderName(regTitle)
        );

        if (!fs.existsSync(storageDir)) {
            fs.mkdirSync(storageDir, { recursive: true });
        }

        // 파일명 결정 (순서_파일명)
        const safeOriginalName = file.originalname.replace(/\s+/g, '_');
        const saveName = `${fileOrder || 0}_${safeOriginalName}`;
        const finalPath = path.join(storageDir, saveName);

        // 임시 파일 이동
        if (fs.existsSync(file.path)) {
            fs.renameSync(file.path, finalPath);
            console.log(`✅ 개별 파일 저장 완료: ${saveName}`);
        }

        return res.json({
            success: true,
            fileName: saveName
        });

    } catch (e) {
        console.error("❌ 개별 업로드 에러:", e.message);
        return res.status(500).json({ success: false, message: e.message });
    } finally {
        // 임시 파일 잔재 삭제
        if (file && fs.existsSync(file.path)) {
            try { fs.unlinkSync(file.path); } catch (err) {}
        }
    }
};

/**
 * [2] 사진 여러 장 묶음 업로드 (네트워크 오버헤드 감소용)
 */
exports.uploadBatch = async (req, res) => {
    const files = req.files; // multer.array('files')로 들어온 파일들

    try {
        if (!files || files.length === 0) {
            return res.status(400).json({ success: false, message: "업로드된 파일이 없습니다." });
        }

        const { regEmail, regTitle, fileOrder } = req.body;
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");

        const projectRoot = '/root/onlaveo-upload';
        const storageDir = path.join(
            projectRoot,
            'uploads',
            safeFolderName(regEmail),
            today,
            safeFolderName(regTitle)
        );

        if (!fs.existsSync(storageDir)) {
            fs.mkdirSync(storageDir, { recursive: true });
        }

        const fileList = [];

        // 루프를 돌며 모든 파일 처리
        files.forEach((file, index) => {
            // 프론트에서 보낸 순서 배열(fileOrder[])에서 해당 인덱스 값 추출
            const order = Array.isArray(fileOrder) ? fileOrder[index] : (fileOrder || index);
            const safeOriginalName = file.originalname.replace(/\s+/g, '_');
            const saveName = `${order}_${safeOriginalName}`;
            const finalPath = path.join(storageDir, saveName);

            if (fs.existsSync(file.path)) {
                fs.renameSync(file.path, finalPath);
                fileList.push(saveName);
            }
        });

        console.log(`✅ 묶음 저장 완료: ${fileList.length}건`);
        return res.json({
            success: true,
            fileList: fileList
        });

    } catch (e) {
        console.error("❌ 묶음 업로드 에러:", e.message);
        return res.status(500).json({ success: false, message: e.message });
    } finally {
        // 모든 임시 파일 정리
        if (files) {
            files.forEach(file => {
                if (fs.existsSync(file.path)) {
                    try { fs.unlinkSync(file.path); } catch (err) {}
                }
            });
        }
    }
};