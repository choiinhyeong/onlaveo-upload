const fs = require('fs');
const path = require('path');

const safeFolderName = (name) => {
    return name ? name.replace(/[^a-zA-Z0-9가-힣_-]/gu, '_') : 'unknown';
};

exports.upload = async (req, res) => {
    // single이든 array든 대응 가능하게 처리
    const files = req.files || (req.file ? [req.file] : []);

    try {
        if (files.length === 0) return res.status(400).json({ success: false, message: "파일 없음" });

        const { regEmail, regTitle, fileOrder } = req.body;
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const storageDir = path.join('/root/onlaveo-upload/uploads', safeFolderName(regEmail), today, safeFolderName(regTitle));

        if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });

        let savedName = "";
        files.forEach((file, index) => {
            const order = Array.isArray(fileOrder) ? fileOrder[index] : fileOrder;
            const safeOriginalName = file.originalname.replace(/\s+/g, '_');
            const saveName = `${order}_${safeOriginalName}`;
            const finalPath = path.join(storageDir, saveName);

            if (fs.existsSync(file.path)) {
                fs.renameSync(file.path, finalPath);
                savedName = saveName;
            }
        });

        return res.json({ success: true, fileName: savedName });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: e.message });
    } finally {
        files.forEach(file => { if (fs.existsSync(file.path)) try { fs.unlinkSync(file.path); } catch (err) {} });
    }
};