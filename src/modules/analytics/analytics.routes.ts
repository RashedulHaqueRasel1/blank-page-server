import express from 'express';
import auth from '../../middlewares/auth';
import { AnalyticsController } from './analytics.controller';

const router = express.Router();

router.post('/track', AnalyticsController.trackVisit);

router.get('/stats', auth('ADMIN'), AnalyticsController.getStats);

export const AnalyticsRoutes = router;
