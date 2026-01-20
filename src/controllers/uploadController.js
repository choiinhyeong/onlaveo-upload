const fs = require('fs');
const path = require('path');
const pool = require('../config/db');
const safeName = require('../utils/safeName');

const BASE_DIR = path.join(__dirname, '../../uploads');

exports.handleUpload = async (req, res) => {
    const mode = req.body.mode;

    try {
        /* ===============================
           CASE 1: 게시글 생성
        ================================ */
        if (mode === 'board') {
            const { regEmail, regTitle, boardType } = req.body;

            const [result] = await pool.execute(
                `INSERT INTO boards (email, title, type, state, regDt)
         VALUES (?, ?, ?, '1', NOW())`,
                [regEmail, regTitle, boardType]
            );

            return res.json({
                success: true,
                message: 'Board Created',
                boardSeq: result.insertId
            });
        }

        /* ===============================
           CASE 2: 파일 업로드
        ================================ */
        if (mode === 'file') {
            if (!req.file) {
                return res.json({ success: false, message: 'No File' });
            }

            const {
                boardSeq,
                fileOrder,
                regEmail,
                regTitle,
                description,
                duration,
                startSec,
                endSec
            } = req.body;

            const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const dirPath = path.join(
                BASE_DIR,
                safeName(regEmail),
                today,
                safeName(regTitle)
            );

            fs.mkdirSync(dirPath, { recursive: true });

            const safeFileName = `${fileOrder}_${safeName(req.file.originalname)}`;
            const destPath = path.join(dirPath, safeFileName);

            fs.renameSync(req.file.path, destPath);

            await pool.execute(
                `INSERT INTO files
        (boardSeq, fileName, originFileName, mimeType, size,
         fileOrder, description, duration, startSec, endSec, regDt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                [
                    boardSeq,
                    safeFileName,
                    req.file.originalname,
                    req.file.mimetype,
                    req.file.size,
                    fileOrder,
                    description || '',
                    duration || 0,
                    startSec || 0,
                    endSec || 0
                ]
            );

            return res.json({
                success: true,
                message: 'Upload Success',
                boardSeq
            });
        }

        return res.json({ success: false, message: 'Invalid Mode' });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
