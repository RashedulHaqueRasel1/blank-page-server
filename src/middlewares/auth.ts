import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import ApiError from '../errors/ApiError';

const auth = (...requiredRoles: string[]) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token = req.headers.authorization;
    if (!token) {
      throw new ApiError(401, 'You are not authorized');
    }

    // Handle standard "Bearer <token>" prefix
    if (token.startsWith('Bearer ') || token.startsWith('bearer ')) {
      token = token.slice(7);
    }

    console.log('DEBUG: JWT_SECRET in auth:', config.jwt_secret);
    console.log('DEBUG: Token in auth:', token);

    const verifiedUser = jwt.verify(
      token,
      config.jwt_secret as string
    ) as JwtPayload;

    if (requiredRoles.length && !requiredRoles.includes(verifiedUser.role)) {
      throw new ApiError(403, 'Forbidden');
    }

    req.user = verifiedUser;
    next();
  } catch (error) {
    next(error);
  }
};

export default auth;
