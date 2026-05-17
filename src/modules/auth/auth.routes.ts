import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { AuthValidation } from './auth.validation';
import { AuthController } from './auth.controller';

const router = express.Router();

router.post(
  '/register',
  validateRequest(AuthValidation.register),
  AuthController.registerUser
);

router.post(
  '/login',
  validateRequest(AuthValidation.login),
  AuthController.loginUser
);

router.get(
  '/profile',
  auth(),
  AuthController.getProfile
);

export const AuthRoutes = router;
