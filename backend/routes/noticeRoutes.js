import express from 'express';
const router = express.Router();
import * as noticeController from '../controllers/noticeController.js';

router.get('/', noticeController.getNotices);
router.post('/', noticeController.createNotice);
router.put('/:id', noticeController.updateNotice);
router.delete('/:id', noticeController.deleteNotice);

export default router;  // Default export
