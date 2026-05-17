"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const analytics_controller_1 = require("./analytics.controller");
const router = express_1.default.Router();
router.post('/init', analytics_controller_1.AnalyticsController.trackVisit);
router.get('/stats', (0, auth_1.default)('ADMIN'), analytics_controller_1.AnalyticsController.getStats);
exports.AnalyticsRoutes = router;
