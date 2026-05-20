import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { SubscriberService } from './subscriber.service';

const subscribe = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;

  const ip = (
    req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
    req.ip ||
    req.socket.remoteAddress ||
    '127.0.0.1'
  );
  const userAgent = req.headers['user-agent'] || 'Unknown';

  const result = await SubscriberService.subscribe(email, ip, userAgent);

  if (result.alreadySubscribed) {
    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'You are already subscribed!',
      data: { alreadySubscribed: true },
    });
  }

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Subscribed successfully! Check your email for a confirmation.',
    data: { alreadySubscribed: false, email: result.subscriber.email },
  });
});

const getSubscribers = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const result = await SubscriberService.getSubscribers(page, limit);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Subscribers retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const updateSubscriber = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { isSubscribed, isVerified, subscriptionEndDate } = req.body;

  const parsedEndDate = subscriptionEndDate ? new Date(subscriptionEndDate) : undefined;

  const result = await SubscriberService.updateSubscriber(id, { 
    isSubscribed, 
    isVerified, 
    subscriptionEndDate: parsedEndDate 
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Subscriber updated successfully',
    data: result,
  });
});

const deleteSubscriber = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  await SubscriberService.deleteSubscriber(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Subscriber deleted successfully',
  });
});

const unsubscribe = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.query;

  if (!email || typeof email !== 'string') {
    return res.status(400).send('Invalid unsubscribe link.');
  }

  try {
    await SubscriberService.unsubscribe(email);
  } catch (error) {
    // Subscriber might not exist, but let's show success anyway to prevent revealing database content
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Unsubscribed Successfully</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at top left, #172554 0%, transparent 30%),
                      radial-gradient(circle at top right, #4c1d95 0%, transparent 30%),
                      linear-gradient(135deg, #020617 0%, #0f172a 50%, #111827 100%);
          font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: white;
        }
        .container {
          max-width: 480px;
          width: 90%;
          text-align: center;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 40px 30px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
        }
        .icon {
          font-size: 50px;
          background: rgba(244, 63, 94, 0.1);
          border: 1px solid rgba(244, 63, 94, 0.2);
          width: 80px;
          height: 80px;
          line-height: 80px;
          border-radius: 50%;
          margin: 0 auto 24px;
        }
        h1 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 12px;
          color: #f43f5e;
        }
        p {
          font-size: 15px;
          color: #94a3b8;
          line-height: 1.6;
          margin-bottom: 30px;
        }
        .btn {
          display: inline-block;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          color: white;
          text-decoration: none;
          padding: 12px 30px;
          border-radius: 999px;
          font-weight: 600;
          font-size: 14px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">🔕</div>
        <h1>Unsubscribed Successfully</h1>
        <p>You have been successfully unsubscribed from <strong>Blank Page</strong>. We're sorry to see you go! You will no longer receive newsletter updates from us.</p>
        <a href="https://blank-page-v1.vercel.app/" class="btn">Go to Blank Page</a>
      </div>
    </body>
    </html>
  `);
});

export const SubscriberController = {
  subscribe,
  getSubscribers,
  updateSubscriber,
  deleteSubscriber,
  unsubscribe,
};
