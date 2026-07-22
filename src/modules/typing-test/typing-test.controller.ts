import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import ApiError from '../../errors/ApiError';
import { TypingTestService } from './typing-test.service';

const createSession = catchAsync(async (req: Request, res: Response) => {
  const {
    ownerId,
    accountUserId,
    authorId,
    language,
    duration,
    mode,
    wordTarget,
    targetText,
    targetWordCount,
    source,
  } = req.body;

  if (!ownerId || !targetText || !language) {
    throw new ApiError(400, 'ownerId, language and targetText are required');
  }

  const result = await TypingTestService.createSession({
    ownerId,
    accountUserId,
    authorId,
    language,
    duration: Number(duration),
    mode: mode === 'words' ? 'words' : 'time',
    wordTarget: typeof wordTarget === 'number' ? wordTarget : wordTarget ? Number(wordTarget) : null,
    targetText,
    targetWordCount: Number(targetWordCount) || 0,
    source: source === 'database' ? 'database' : source === 'fallback' ? 'fallback' : 'ai',
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Typing test session saved',
    data: {
      id: result.id,
    },
  });
});

const completeSession = catchAsync(async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const { ownerId, typedText, elapsedSeconds, result } = req.body;

  if (!ownerId || typeof typedText !== 'string' || !result) {
    throw new ApiError(400, 'ownerId, typedText and result are required');
  }

  const updated = await TypingTestService.completeSession({
    sessionId: String(sessionId),
    ownerId,
    typedText,
    elapsedSeconds: Number(elapsedSeconds) || 0,
    result,
  });

  if (!updated) {
    throw new ApiError(404, 'Typing test session not found');
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Typing test result saved',
    data: {
      id: updated.id,
      completedAt: updated.completedAt,
    },
  });
});

const getRandomSavedText = catchAsync(async (req: Request, res: Response) => {
  const language = String(req.query.language || '');
  const duration = Number(req.query.duration) || 30;
  const rawWordTarget = req.query.wordTarget;
  const wordTarget = rawWordTarget ? Number(rawWordTarget) : null;

  if (!language) {
    throw new ApiError(400, 'language is required');
  }

  const result = await TypingTestService.getRandomSavedText({
    language,
    duration,
    wordTarget,
  });

  if (!result) {
    throw new ApiError(404, 'No saved typing text found for this language');
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Saved typing text retrieved',
    data: result,
  });
});

export const TypingTestController = {
  createSession,
  completeSession,
  getRandomSavedText,
};
