import express from 'express';
import auth from '../../middlewares/auth';
import { PublishController } from './publish.controller';

const router = express.Router();

// Public route to publish a new page
router.post('/', PublishController.publishPage);

// Admin-only route to list all published pages
router.get('/admin', auth('ADMIN'), PublishController.getAllPagesAdmin);

// Public route to retrieve a page by its custom URL
router.get('/:customUrl', PublishController.getPageByUrl);

// Public route to update an editable page
router.patch('/:customUrl', PublishController.updatePageContent);

// Route to soft delete a page
router.delete('/:customUrl', PublishController.softDeletePage);

export const PublishRoutes = router;
