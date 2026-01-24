const uploadToNAS = require('../services/ftpService');
const path = require('path');

exports.upload = async (req, res) => {
    try {
        if (!req.file) {
            return res.json({ success: false });
        }

        const fileName = `${Date.now()}_${req.file.originalname}`;
        const remotePath = `/upload/${fileName}`;

        await uploadToNAS(req.file.path, remotePath);

        res.json({
            success: true,
            fileName,
            filePath: remotePath
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false });
    }
};
