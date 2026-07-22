"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const typing_test_controller_1 = require("./typing-test.controller");
const router = express_1.default.Router();
router.get('/library/random', typing_test_controller_1.TypingTestController.getRandomSavedText);
router.post('/sessions', typing_test_controller_1.TypingTestController.createSession);
router.patch('/sessions/:sessionId/complete', typing_test_controller_1.TypingTestController.completeSession);
exports.default = router;
