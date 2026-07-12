import { Router } from 'express';
import authRoutes from './auth.routes.js';
import studentRoutes from './student.routes.js';
import jobRoutes from './job.routes.js';
import employerRoutes from './employer.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

// Mount modules
router.use('/auth', authRoutes);
router.use('/student', studentRoutes);
router.use('/jobs', jobRoutes);
router.use('/employer', employerRoutes);
router.use('/admin', adminRoutes);

export default router;
