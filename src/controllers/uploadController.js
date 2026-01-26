exports.upload = async (req, res) => {
    const start = Date.now();

    try {
        const file = req.file;
        if (!file) return res.status(400).json({ success: false, message: 'No file' });

        // multer가 이미 최종 저장을 끝냈음
        // file.path 는 최종 파일 경로
        const durationMs = Date.now() - start;

        return res.json({
            success: true,
            fileName: file.filename,
            savedPath: file.path,
            tookMs: durationMs
        });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
};
