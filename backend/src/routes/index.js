import { Router } from 'express';
import authRoutes from './authRoutes.js';
import noteRoutes from './noteRoutes.js';
import folderRoutes from './folderRoutes.js';
import tagRoutes from './tagRoutes.js';
import searchRoutes from './searchRoutes.js';
import uploadRoutes from './uploadRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/notes', noteRoutes);
router.use('/folders', folderRoutes);
router.use('/tags', tagRoutes);
router.use('/search', searchRoutes);
router.use('/uploads', uploadRoutes);

export default router;
