import express from 'express';
import auth from '../../middlewares/auth';
import { AnalyticsController } from './analytics.controller';

const router = express.Router();

router.post(
  '/track-visit', 
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
  AnalyticsController.trackVisit
);

router.get('/admin/overview', auth('ADMIN'), AnalyticsController.getStats);

export default router;
