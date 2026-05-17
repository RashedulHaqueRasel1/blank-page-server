import express from 'express';
import auth from '../../middlewares/auth';
import { PublishController } from './publish.controller';

const router = express.Router();

// Public route to publish a new page
router.post('/', PublishController.publishPage);

// Admin-only route to list all published pages
router.get('/admin', auth('ADMIN'), PublishController.getAllPagesAdmin);

// Route to get published pages by author ID
router.get('/author/:authorId', PublishController.getPagesByAuthor);

// Route for author to securely update page title, pin status, or content
router.put('/author/update/:customUrl', PublishController.updatePageByAuthor);

// Route for author to securely fetch full page content (bypassing password)
router.post('/author/fetch/:customUrl', PublishController.fetchPageByAuthor);

// Public route to retrieve a page by its custom URL
router.get('/:customUrl', PublishController.getPageByUrl);

// Public route to update an editable page
router.patch('/:customUrl', PublishController.updatePageContent);

// Route to soft delete a page
router.delete('/:customUrl', PublishController.softDeletePage);

// Route to verify password for a protected page
router.post('/verify/:customUrl', PublishController.verifyPagePassword);

export const PublishRoutes = router;
