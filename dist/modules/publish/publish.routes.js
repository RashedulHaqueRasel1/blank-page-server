"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublishRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const publish_controller_1 = require("./publish.controller");
const router = express_1.default.Router();
// Public route to publish a new page
router.post('/', publish_controller_1.PublishController.publishPage);
// Admin-only route to list all published pages
router.get('/admin', (0, auth_1.default)('ADMIN'), publish_controller_1.PublishController.getAllPagesAdmin);
// Route to get published pages by author ID
router.get('/author/:authorId', publish_controller_1.PublishController.getPagesByAuthor);
// Route for author to securely update page title, pin status, or content
router.put('/author/update/:customUrl', publish_controller_1.PublishController.updatePageByAuthor);
// Route for author to securely fetch full page content (bypassing password)
router.post('/author/fetch/:customUrl', publish_controller_1.PublishController.fetchPageByAuthor);
// Public route to retrieve a page by its custom URL
router.get('/:customUrl', publish_controller_1.PublishController.getPageByUrl);
// Public route to update an editable page
router.patch('/:customUrl', publish_controller_1.PublishController.updatePageContent);
// Route to soft delete a page
router.delete('/:customUrl', publish_controller_1.PublishController.softDeletePage);
// Route to verify password for a protected page
router.post('/verify/:customUrl', publish_controller_1.PublishController.verifyPagePassword);
exports.PublishRoutes = router;
