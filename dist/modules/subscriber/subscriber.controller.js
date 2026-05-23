"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriberController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const subscriber_service_1 = require("./subscriber.service");
const subscribe = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { email } = req.body;
    const ip = (((_a = req.headers['x-forwarded-for']) === null || _a === void 0 ? void 0 : _a.toString().split(',')[0].trim()) ||
        req.ip ||
        req.socket.remoteAddress ||
        '127.0.0.1');
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const result = yield subscriber_service_1.SubscriberService.subscribe(email, ip, userAgent);
    if (result.alreadySubscribed) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 200,
            success: true,
            message: 'You are already subscribed!',
            data: { alreadySubscribed: true },
        });
    }
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'Subscribed successfully! Check your email for a confirmation.',
        data: { alreadySubscribed: false, email: result.subscriber.email },
    });
}));
const getSubscribers = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = yield subscriber_service_1.SubscriberService.getSubscribers(page, limit);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Subscribers retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
}));
const updateSubscriber = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const { isSubscribed, isVerified, subscriptionEndDate } = req.body;
    const parsedEndDate = subscriptionEndDate ? new Date(subscriptionEndDate) : undefined;
    const result = yield subscriber_service_1.SubscriberService.updateSubscriber(id, {
        isSubscribed,
        isVerified,
        subscriptionEndDate: parsedEndDate
    });
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Subscriber updated successfully',
        data: result,
    });
}));
const deleteSubscriber = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    yield subscriber_service_1.SubscriberService.deleteSubscriber(id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Subscriber deleted successfully',
    });
}));
const unsubscribe = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.query;
    if (!email || typeof email !== 'string') {
        return res.status(400).send('Invalid unsubscribe link.');
    }
    try {
        yield subscriber_service_1.SubscriberService.unsubscribe(email);
    }
    catch (error) {
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
}));
exports.SubscriberController = {
    subscribe,
    getSubscribers,
    updateSubscriber,
    deleteSubscriber,
    unsubscribe,
};
