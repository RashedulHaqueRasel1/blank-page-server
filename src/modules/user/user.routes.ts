import express from 'express';
import auth from '../../middlewares/auth';
import { UserController } from './user.controller';

const router = express.Router();

router.get('/', auth('ADMIN'), UserController.getAllUsers);

export const UserRoutes = router;
