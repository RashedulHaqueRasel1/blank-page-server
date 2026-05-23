"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const analytics_controller_1 = require("./analytics.controller");
const router = express_1.default.Router();
router.post('/track-visit', 
/*  #swagger.requestBody = {
      required: true,
      content: {
          "application/json": {
              schema: {
                  type: "object",
                  properties: {
                      d: { type: "string", description: "Base64 encoded payload", example: "eyJpcCI6IjEyNy4wLjAuMSIsInJlZmVycmVyIjoiaHR0cHM6Ly9leGFtcGxlLmNvbSJ9" }
                  },
                  required: ["d"]
              }
          }
      }
  }
*/
analytics_controller_1.AnalyticsController.trackVisit);
router.get('/admin/overview', (0, auth_1.default)('ADMIN'), analytics_controller_1.AnalyticsController.getStats);
exports.default = router;
