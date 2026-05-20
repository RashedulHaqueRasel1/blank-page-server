import express from 'express';
import auth from '../../middlewares/auth';
import { UserController } from './user.controller';

const router = express.Router();

router.get('/admin/all-users', auth('ADMIN'), UserController.getAllUsers);

export default router;
