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
// Public route to retrieve a page by its custom URL
router.get('/:customUrl', publish_controller_1.PublishController.getPageByUrl);
// Public route to update an editable page
router.patch('/:customUrl', publish_controller_1.PublishController.updatePageContent);
// Route to soft delete a page
router.delete('/:customUrl', publish_controller_1.PublishController.softDeletePage);
exports.PublishRoutes = router;
