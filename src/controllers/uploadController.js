const multer = require('multer');
const fs = require('fs');
const uploadToNAS = require('../utils/uploadToNAS');
const db = require('../config/db');
const safeName = require('../utils/safeName');

const upload = multer({
    dest: 'uploads/'
});

module.exports = [
    upload.single('file'),

    async (req, res) => {
        try {
            const { regEmail, boardSeq, fileOrder } = req.body;
            const file = req.file;

            if (!file) {
                return res.status(400).json({ message: 'file missing' });
            }

            const saveName = safeName(file.originalname);

            // NAS 업로드
            await uploadToNAS(file.path, saveName);

            // DB 저장
            const sql = `
        INSERT INTO board_file
        (board_seq, file_order, file_name, file_org_name, reg_email)
        VALUES (?, ?, ?, ?, ?)
      `;

            await db.execute(sql, [
                boardSeq,
                fileOrder,
                saveName,
                file.originalname,
                regEmail
            ]);

            fs.unlinkSync(file.path);

            res.json({ success: true });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false });
        }
    }
];
