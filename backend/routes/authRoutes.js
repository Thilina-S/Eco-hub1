import express from 'express';
import { signUp, signIn, requestPasswordReset, resetPassword } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signUp);  // POST /api/auth/signup
router.post('/signin', signIn);  // POST /api/auth/signin

// 👇 Password recovery routes
router.post('/request-reset', requestPasswordReset);
router.post('/reset-password/:token', resetPassword);

export default router;
