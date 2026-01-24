const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const upload = multer({
    dest: 'uploads/tmp'
});

router.post('/file', upload.single('file'), async (req, res) => {
    try {
        const {
            regEmail,
            regTitle,
            boardSeq,
            fileOrder,
            description,
            duration,
            startSec,
            endSec
        } = req.body;

        const file = req.file;
        if (!file) {
            return res.json({ success: false, message: 'No file uploaded' });
        }

        const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const safe = (s) => s.replace(/[^a-zA-Z0-9가-힣_-]/g, '_');

        const targetDir = path.join(
            'uploads',
            safe(regEmail),
            today,
            safe(regTitle)
        );

        fs.mkdirSync(targetDir, { recursive: true });

        const saveName = `${fileOrder}_${file.originalname}`;
        const destPath = path.join(targetDir, saveName);

        fs.renameSync(file.path, destPath);

        // 👉 여기서 DB INSERT 가능
        // await db.query(...)

        res.json({
            success: true,
            file: saveName
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
