import express from 'express';
import auth from '../../middlewares/auth';
import { SubscriberController } from './subscriber.controller';

const router = express.Router();

// Public: Subscribe with email
router.post(
  '/subscribe',
  /*  #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        email: { type: "string", example: "user@example.com" }
                    },
                    required: ["email"]
                }
            }
        }
    }
  */
  SubscriberController.subscribe
);

// Public: Unsubscribe from mailing list
router.get('/unsubscribe', SubscriberController.unsubscribe);

// Admin: Get all subscribers with pagination
router.get('/admin/list', auth('ADMIN'), SubscriberController.getSubscribers);

// Admin: Update subscriber (toggle isSubscribed / isVerified)
router.patch(
  '/admin/:id',
  auth('ADMIN'),
  /*  #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        isSubscribed: { type: "boolean", example: false },
                        isVerified: { type: "boolean", example: true },
                        subscriptionEndDate: { type: "string", format: "date-time", example: "2030-12-31T23:59:59.000Z" }
                    }
                }
            }
        }
    }
  */
  SubscriberController.updateSubscriber
);

// Admin: Delete a subscriber
router.delete('/admin/:id', auth('ADMIN'), SubscriberController.deleteSubscriber);

export default router;
