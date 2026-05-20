import express from 'express';
import auth from '../../middlewares/auth';
import { RecentVisitorsController } from './recent-visitors.controller';

const router = express.Router();

// Admin: Get all recent visitors (paginated)
router.get('/admin/list', auth('ADMIN'), RecentVisitorsController.getRecentVisitors);

// Admin: Get a single visitor by ID
router.get('/admin/:id', auth('ADMIN'), RecentVisitorsController.getVisitorById);

// Admin: Delete a visitor record
router.delete('/admin/:id', auth('ADMIN'), RecentVisitorsController.deleteVisitor);

export default router;
