import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { UserRoutes } from '../modules/user/user.routes';
import { AnalyticsRoutes } from '../modules/analytics/analytics.routes';

const router = express.Router();

type IRoute = {
  path: string;
  route: express.Router;
};

const moduleRoutes: IRoute[] = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/analytics',
    route: AnalyticsRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;


