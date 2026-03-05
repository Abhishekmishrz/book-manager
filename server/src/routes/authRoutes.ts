import { Router } from 'express';
import { signup, login, logout, getMe, updateMe, deleteAccount } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.patch('/me', protect, updateMe);
router.delete('/me', protect, deleteAccount);

export default router;
