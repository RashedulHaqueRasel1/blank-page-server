import express from 'express';
import AuthRoutes from '../modules/auth/auth.routes';
import UserRoutes from '../modules/user/user.routes';
import AnalyticsRoutes from '../modules/analytics/analytics.routes';
import PublishRoutes from '../modules/publish/publish.routes';
import SubscriberRoutes from '../modules/subscriber/subscriber.routes';
import RecentVisitorsRoutes from '../modules/recent-visitors/recent-visitors.routes';

const router = express.Router();

router.use('/auth', AuthRoutes);
router.use('/users', UserRoutes);
router.use('/analytics', AnalyticsRoutes);
router.use('/pages', PublishRoutes);
router.use('/subscribers', SubscriberRoutes);
router.use('/visitors', RecentVisitorsRoutes);

export default router;
