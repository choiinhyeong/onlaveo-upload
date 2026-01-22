const fs = require('fs');
const path = require('path');
const multer = require('multer');

// PHP safeFolderName
const safeFolderName = (name = '') =>
    name.replace(/[^a-zA-Z0-9가-힣_-]/g, '_');

// multer 메모리 저장 (PHP tmp_name 역할)
const upload = multer({ storage: multer.memoryStorage() }).single('file');

module.exports = (req, res) => {
    upload(req, res, async err => {
        if (err) {
            return res.json({ success: false, message: err.message });
        }

        const mode = req.body.mode;

        /* ===============================
           CASE 1 : board 생성
        =============================== */
        if (mode === 'board') {
            const boardSeq = Date.now(); // PHP time()
            return res.json({
                success: true,
                message: 'Board Created (Test Mode)',
                boardSeq: String(boardSeq),
            });
        }

        /* ===============================
           CASE 2 : file 업로드
        =============================== */
        if (mode === 'file') {
            const file = req.file;
            if (!file) {
                return res.json({ success: false, message: 'No File Uploaded' });
            }

            const {
                regEmail = 'guest',
                regTitle = 'no_title',
                boardSeq = 0,
                fileOrder = 0,
            } = req.body;

            const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const baseDir = path.join(__dirname, 'files');
            const targetDir = path.join(
                baseDir,
                safeFolderName(regEmail),
                today,
                safeFolderName(regTitle)
            );

            // PHP mkdir(..., true)
            fs.mkdirSync(targetDir, { recursive: true });

            const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
            const saveName = `${fileOrder}_${safeName}`;
            const destPath = path.join(targetDir, saveName);

            try {
                fs.writeFileSync(destPath, file.buffer);

                return res.json({
                    success: true,
                    message: 'Upload Success',
                    boardSeq: String(boardSeq),
                });
            } catch (e) {
                return res.json({
                    success: false,
                    message: 'File save failed',
                });
            }
        }

        return res.json({ success: false, message: 'Invalid Access Mode' });
    });
};
