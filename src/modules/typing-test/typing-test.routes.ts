import express from 'express';
import { TypingTestController } from './typing-test.controller';

const router = express.Router();

router.get('/library/random', TypingTestController.getRandomSavedText);
router.post('/sessions', TypingTestController.createSession);
router.patch('/sessions/:sessionId/complete', TypingTestController.completeSession);

export default router;
