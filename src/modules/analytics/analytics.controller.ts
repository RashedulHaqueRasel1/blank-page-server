import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AnalyticsService } from './analytics.service';

const trackVisit = catchAsync(async (req: Request, res: Response) => {
  const { d } = req.body;
  let decryptedPayload: Record<string, any> = {};

  if (d) {
    try {
      const decodedString = Buffer.from(d, 'base64').toString('ascii');
      decryptedPayload = JSON.parse(decodedString);
    } catch (err) {
      // Fail silently if tampering occurs
    }
  }

  const bodyIp = decryptedPayload.ip;
  const referrer = decryptedPayload.referrer;

  // Extract client IP robustly, taking body, proxies, and socket into account
  const forwarded = req.headers['x-forwarded-for'];
  const ip = bodyIp || (typeof forwarded === 'string'
    ? forwarded.split(',')[0].trim()
    : req.socket.remoteAddress || req.ip || '127.0.0.1');

  const userAgent = req.headers['user-agent'] || 'Unknown';

  // Perform visitor tracking in database
  await AnalyticsService.trackVisit(ip, userAgent, referrer);

  // Return HTTP 204 No Content with absolutely NO body for absolute stealth in Network tab
  res.status(204).send();
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
