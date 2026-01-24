const uploadToNAS = require('../services/ftpService');

module.exports = async (req, res) => {
    try {
        const {
            regEmail,
            regTitle,
            fileOrder
        } = req.body;

        if (!req.file) {
            return res.json({ success: false, message: '파일 없음' });
        }

        const result = await uploadToNAS(req.file.path, {
            email: regEmail,
            title: regTitle,
            fileOrder,
            originalName: req.file.originalname
        });

        if (!result.success) {
            return res.json({ success: false, message: 'NAS 업로드 실패' });
        }

        return res.json({
            success: true,
            fileName: result.fileName,
            path: result.remotePath
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
