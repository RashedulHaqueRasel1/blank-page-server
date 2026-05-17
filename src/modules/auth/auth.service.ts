import prisma from '../../lib/prisma';
import { hashHelper } from '../../utils/hashHelper';
import { jwtHelper } from '../../utils/jwtHelper';
import config from '../../config';
import ApiError from '../../errors/ApiError';
import { User } from '@prisma/client';

const registerUser = async (payload: User): Promise<Omit<User, 'password'>> => {
  const isExist = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (isExist) {
    throw new ApiError(400, 'User already exists with this email');
  }

  // Hash password
  payload.password = await hashHelper.hashPassword(payload.password);

  const newUser = await prisma.user.create({
    data: payload,
  });

  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

const loginUser = async (payload: Pick<User, 'email' | 'password'>) => {
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Verify password
  const isPasswordMatch = await hashHelper.comparePassword(
    payload.password,
    user.password
  );

  if (!isPasswordMatch) {
    throw new ApiError(401, 'Invalid password');
  }

  const now = new Date();
  const updateData: Record<string, any> = {
    lastLogin: now,
    loginCount: { increment: 1 },
  };

  if (!user.firstLogin) {
    updateData.firstLogin = now;
  }

  // Update user login metrics in the database
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  });

  // Generate tokens
  const token = jwtHelper.generateToken(
    { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role },
    config.jwt_secret as string,
    '30d' // Token valid for 30 days
  );

  return {
    token,
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
    },
  };
};

const getProfile = async (userId: string): Promise<Omit<User, 'password'>> => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const AuthService = {
  registerUser,
  loginUser,
  getProfile,
};
