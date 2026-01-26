exports.upload = async (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ success: false, message: 'file required' });
    }

    return res.json({
        success: true,
        fileName: file.filename
    });
};
