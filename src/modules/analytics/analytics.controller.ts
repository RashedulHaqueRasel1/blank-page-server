import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AnalyticsService } from './analytics.service';

const trackVisit = catchAsync(async (req: Request, res: Response) => {
  const { referrer, ip: bodyIp } = req.body;

  // Extract client IP robustly, taking body, proxies, and socket into account
  const forwarded = req.headers['x-forwarded-for'];
  const ip = bodyIp || (typeof forwarded === 'string'
    ? forwarded.split(',')[0].trim()
    : req.socket.remoteAddress || req.ip || '127.0.0.1');

  const userAgent = req.headers['user-agent'] || 'Unknown';

  const result = await AnalyticsService.trackVisit(ip, userAgent, referrer);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Visit tracked successfully',
    data: result,
  });
});

const getStats = catchAsync(async (req: Request, res: Response) => {
  const result = await AnalyticsService.getStats();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Analytics statistics retrieved successfully',
    data: result,
  });
});

export const AnalyticsController = {
  trackVisit,
  getStats,
};
