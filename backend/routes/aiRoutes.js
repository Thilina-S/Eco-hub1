import express from 'express';
import { handleChatRequest } from '../controllers/aiController.js';


const router = express.Router();

router.post('/chat', handleChatRequest);

export default router;