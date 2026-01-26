const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const safeFolderName = (name) =>
    name ? name.replace(/[^a-zA-Z0-9가-힣_-]/gu, '_') : 'unknown';

const safeFileName = (name) =>
    (name || 'file').replace(/[^\w.\-가-힣]/gu, '_');

exports.upload = async (req, res) => {
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: 'file required' });

    try {
        const { regEmail, regTitle, fileOrder } = req.body;

        const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const storageDir = path.join(
            '/root/onlaveo-upload/uploads',
            safeFolderName(regEmail),
            today,
            safeFolderName(regTitle)
        );

        await fsp.mkdir(storageDir, { recursive: true });

        const original = safeFileName(file.originalname);
        const saveName = `${Number(fileOrder || 0)}_${original}`;
        const finalPath = path.join(storageDir, saveName);

        // ✅ 동기(sync) 제거
        await fsp.rename(file.path, finalPath);

        return res.json({
            success: true,
            fileName: saveName
        });
    } catch (e) {
        // 임시파일이 남아있을 수 있으니 정리 시도
        try {
            if (file?.path) await fsp.unlink(file.path);
        } catch (_) {}

        return res.status(500).json({ success: false, message: e.message });
    }
};
