const fs = require('fs');
const path = require('path');

const safeFolderName = (name) => name ? name.replace(/[^a-zA-Z0-9가-힣_-]/gu, '_') : 'unknown';

exports.upload = async (req, res) => {
    const file = req.file;
    if (!file) return res.status(400).json({ success: false });

    try {
        const { regEmail, regTitle, fileOrder } = req.body;
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const storageDir = path.join('/root/onlaveo-upload/uploads', safeFolderName(regEmail), today, safeFolderName(regTitle));

        if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });

        const safeName = file.originalname.replace(/\s+/g, '_');
        const saveName = `${fileOrder || 0}_${safeName}`;
        const finalPath = path.join(storageDir, saveName);

        fs.renameSync(file.path, finalPath);

        return res.json({ success: true, fileName: saveName });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
};