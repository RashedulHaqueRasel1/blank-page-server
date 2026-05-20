import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { AuthValidation } from './auth.validation';
import { AuthController } from './auth.controller';

const router = express.Router();

router.post(
  '/register',
  /*  #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        email: { type: "string", example: "user@example.com" },
                        password: { type: "string", example: "strongpassword123" },
                        role: { type: "string", example: "AUTHOR" }
                    },
                    required: ["email", "password"]
                }
            }
        }
    } 
  */
  validateRequest(AuthValidation.register),
  AuthController.registerUser
);

router.post(
  '/login',
  /*  #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        email: { type: "string", example: "user@example.com" },
                        password: { type: "string", example: "strongpassword123" }
                    },
                    required: ["email", "password"]
                }
            }
        }
    } 
  */
  validateRequest(AuthValidation.login),
  AuthController.loginUser
);

router.get(
  '/profile',
  auth(),
  AuthController.getProfile
);

export default router;
