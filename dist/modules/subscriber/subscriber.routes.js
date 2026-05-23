"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const subscriber_controller_1 = require("./subscriber.controller");
const router = express_1.default.Router();
// Public: Subscribe with email
router.post('/subscribe', 
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
subscriber_controller_1.SubscriberController.subscribe);
// Public: Unsubscribe from mailing list
router.get('/unsubscribe', subscriber_controller_1.SubscriberController.unsubscribe);
// Admin: Get all subscribers with pagination
router.get('/admin/list', (0, auth_1.default)('ADMIN'), subscriber_controller_1.SubscriberController.getSubscribers);
// Admin: Update subscriber (toggle isSubscribed / isVerified)
router.patch('/admin/:id', (0, auth_1.default)('ADMIN'), 
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
subscriber_controller_1.SubscriberController.updateSubscriber);
// Admin: Delete a subscriber
router.delete('/admin/:id', (0, auth_1.default)('ADMIN'), subscriber_controller_1.SubscriberController.deleteSubscriber);
exports.default = router;
