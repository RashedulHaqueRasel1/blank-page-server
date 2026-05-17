import { z } from 'zod';

const register = z.object({
  body: z.object({
    email: z
      .string({ message: 'Email is required' })
      .email('Invalid email address'),
    password: z
      .string({ message: 'Password is required' })
      .min(6, 'Password must be at least 6 characters long'),
    role: z
      .string({ message: 'Role is required' })
      .optional(),
  }),
});

const login = z.object({
  body: z.object({
    email: z
      .string({ message: 'Email is required' })
      .email('Invalid email address'),
    password: z
      .string({ message: 'Password is required' }),
  }),
});

export const AuthValidation = {
  register,
  login,
};
