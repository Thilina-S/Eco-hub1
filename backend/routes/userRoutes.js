import express from 'express';
import { getAllUsers, deleteUserById } from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getAllUsers);
router.delete('/:id', authMiddleware, deleteUserById);

export default router;
