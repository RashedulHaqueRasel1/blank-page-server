"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const recent_visitors_controller_1 = require("./recent-visitors.controller");
const router = express_1.default.Router();
// Admin: Get all recent visitors (paginated)
router.get('/admin/list', (0, auth_1.default)('ADMIN'), recent_visitors_controller_1.RecentVisitorsController.getRecentVisitors);
// Admin: Get a single visitor by ID
router.get('/admin/:id', (0, auth_1.default)('ADMIN'), recent_visitors_controller_1.RecentVisitorsController.getVisitorById);
// Admin: Delete a visitor record
router.delete('/admin/:id', (0, auth_1.default)('ADMIN'), recent_visitors_controller_1.RecentVisitorsController.deleteVisitor);
exports.default = router;
