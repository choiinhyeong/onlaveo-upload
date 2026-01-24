const fs = require('fs');
const path = require('path');
const pool = require('../config/db');
const uploadToNAS = require('../config/ftp');

// PHP safeFolderName 동일
function safeName(name = '') {
    return name.replace(/[^a-zA-Z0-9가-힣_-]/g, '_');
}

module.exports = async (req, res) => {
    try {
        const mode = req.body.mode;

        /* ===============================
           CASE 1: 게시글 생성
        =============================== */
        if (mode === 'board') {
            const { regEmail, regTitle, boardType = '1' } = req.body;

            if (!regEmail || !regTitle) {
                return res.json({ success: false, message: '필수값 누락' });
            }

            const [result] = await pool.execute(
                `
                INSERT INTO boards (email, title, type, state, regDt)
                VALUES (?, ?, ?, '1', NOW())
                `,
                [regEmail, regTitle, boardType]
            );

            return res.json({
                success: true,
                message: 'Board Created',
                boardSeq: String(result.insertId)
            });
        }

        /* ===============================
           CASE 2: 파일 업로드
        =============================== */
        if (mode === 'file') {
            const file = req.file;
            if (!file) {
                return res.json({ success: false, message: '파일 없음' });
            }

            const {
                boardSeq,
                regEmail,
                regTitle,
                fileOrder,
                description = '',
                duration = 0,
                startSec = 0,
                endSec = 0
            } = req.body;

            const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const folderEmail = safeName(regEmail);
            const folderTitle = safeName(regTitle);

            const nasDir = `/onlaveo/${folderEmail}/${today}/${folderTitle}`;
            const saveName = `${fileOrder}_${safeName(file.originalname)}`;

            // files 테이블 INSERT
            await pool.execute(
                `
                INSERT INTO files
                (boardSeq, fileName, originFileName, mimeType, size,
                 fileOrder, description, duration, startSec, endSec, regDt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
                `,
                [
                    boardSeq,
                    saveName,
                    file.originalname,
                    file.mimetype,
                    file.size,
                    fileOrder,
                    description,
                    duration,
                    startSec,
                    endSec
                ]
            );

            // NAS 업로드
            await uploadToNAS(file.path, nasDir, saveName);

            fs.unlinkSync(file.path);

            return res.json({
                success: true,
                message: '파일 저장 성공',
                boardSeq: String(boardSeq)
            });
        }

        return res.json({ success: false, message: '잘못된 mode' });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: '서버 오류'
        });
    }
};
