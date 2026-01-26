exports.upload = async (req, res) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).json({ success: false, message: 'No file' });

        return res.json({
            success: true,
            fileName: file.filename,
            savedPath: file.path
        });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
};
