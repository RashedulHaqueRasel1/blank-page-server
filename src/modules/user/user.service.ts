import prisma from '../../lib/prisma';
import { User } from '@prisma/client';

const getAllUsers = async (): Promise<Omit<User, 'password'>[]> => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      firstLogin: true,
      lastLogin: true,
      loginCount: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return users;
};

export const UserService = {
  getAllUsers,
};
