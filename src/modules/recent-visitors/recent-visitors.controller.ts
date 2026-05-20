import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { RecentVisitorsService } from './recent-visitors.service';
import ApiError from '../../errors/ApiError';

const getRecentVisitors = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const result = await RecentVisitorsService.getRecentVisitors(page, limit);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Recent visitors retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getVisitorById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const visitor = await RecentVisitorsService.getVisitorById(id);

  if (!visitor) {
    throw new ApiError(404, 'Visitor not found');
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Visitor retrieved successfully',
    data: visitor,
  });
});

const deleteVisitor = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  await RecentVisitorsService.deleteVisitor(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Visitor deleted successfully',
  });
});

export const RecentVisitorsController = {
  getRecentVisitors,
  getVisitorById,
  deleteVisitor,
};
