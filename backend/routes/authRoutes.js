import express from 'express';
import { signUp, signIn } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signUp);  // POST /api/auth/signup
router.post('/signin', signIn);  // POST /api/auth/signin

export default router;
