const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const uploadController = require('../controllers/uploadController');

/**
 * [설정] multer 임시 폴더 설정
 * - 파일이 서버에 들어오면 일단 여기에 저장된 후 controller에서 실제 경로로 이동합니다.
 */
const upload = multer({
    dest: path.join(__dirname, '../../uploads/tmp')
});

/**
 * [1] 개별 파일 업로드 (대용량 영상용)
 * - 프론트엔드: fd.append('file', file) 사용
 * - 호출 주소: POST /upload
 */
router.post('/', upload.single('file'), uploadController.upload);

/**
 * [2] 사진/다중 파일 일괄 업로드 (성능 최적화용)
 * - 프론트엔드: fd.append('files', file) 로 여러 번 추가
 * - 호출 주소: POST /upload-batch
 * - 최대 50개까지 한 번에 수용 가능 (필요시 숫자 조정)
 */
router.post('-batch', upload.array('files', 50), uploadController.uploadBatch);

module.exports = router;