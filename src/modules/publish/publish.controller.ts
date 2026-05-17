import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PublishService } from './publish.service';
import jwt, { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../errors/ApiError';

const publishPage = catchAsync(async (req: Request, res: Response) => {
  const { customUrl, content, isEditable, expiresHours, authorId, ip, title, password, oneTimeView } = req.body;

  // Extract user ID from token if logged in (optional guest support)
  let userId: string | undefined = undefined;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
      userId = decoded.id;
    } catch (err) {
      // Ignore token verification failure, treat as guest publish
    }
  }

  // Fallback chain for IP detection
  const clientIp = (ip || req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress || '') as string;

  // If user is a guest, set userId to the random authorId (persistent username)
  const finalUserId = userId || authorId || null;

  const result = await PublishService.publishPage({
    customUrl,
    content,
    isEditable,
    expiresHours: expiresHours ? Number(expiresHours) : undefined,
    userId: finalUserId || undefined,
    authorId,
    authorIp: clientIp,
    title,
    password,
    oneTimeView: oneTimeView === true || oneTimeView === 'true',
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Page published successfully',
    data: result,
  });
});

const getPageByUrl = catchAsync(async (req: Request, res: Response) => {
  const { customUrl } = req.params;
  
  // Extract client IP (viewer's IP) from request headers or body
  const clientIp = (req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress || '') as string;
  
  const result = await PublishService.getPageByUrl(customUrl as string, clientIp);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Published page retrieved successfully',
    data: result,
  });
});

const updatePageContent = catchAsync(async (req: Request, res: Response) => {
  const { customUrl } = req.params;
  const { content } = req.body;

  // Extract client IP (editor's IP) from request headers or body
  const clientIp = (req.body.ip || req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress || '') as string;

  const result = await PublishService.updatePageContent(customUrl as string, content, clientIp);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Published page content updated successfully',
    data: result,
  });
});

const softDeletePage = catchAsync(async (req: Request, res: Response) => {
  const { customUrl } = req.params;
  await PublishService.softDeletePage(customUrl as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Published page deleted successfully',
  });
});

const getAllPagesAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await PublishService.getAllPagesAdmin();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All published pages retrieved successfully',
    data: result,
  });
});

const getPagesByAuthor = catchAsync(async (req: Request, res: Response) => {
  const { authorId } = req.params;
  const result = await PublishService.getPagesByAuthor(authorId as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Author published pages retrieved successfully',
    data: result,
  });
});

const updatePageByAuthor = catchAsync(async (req: Request, res: Response) => {
  const { customUrl } = req.params;
  const { authorId, title, content, pinned, ip } = req.body;

  if (!authorId) {
    throw new ApiError(400, 'Author ID is required to perform this update');
  }

  const clientIp = (ip || req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress || '') as string;

  const result = await PublishService.updatePageByAuthor(
    customUrl as string,
    authorId,
    { title, content, pinned },
    clientIp
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Page updated by author successfully',
    data: result,
  });
});

const verifyPagePassword = catchAsync(async (req: Request, res: Response) => {
  const { customUrl } = req.params;
  const { password } = req.body;
  
  const clientIp = (req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress || '') as string;
  
  const result = await PublishService.verifyPagePassword(customUrl as string, password, clientIp);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Password verified, page retrieved successfully',
    data: result,
  });
});

const fetchPageByAuthor = catchAsync(async (req: Request, res: Response) => {
  const { customUrl } = req.params;
  const { authorId } = req.body;
  
  if (!authorId) {
    throw new ApiError(400, 'Author ID is required');
  }

  const result = await PublishService.fetchPageByAuthor(customUrl as string, authorId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Page fetched securely by author',
    data: result,
  });
});

export const PublishController = {
  publishPage,
  getPageByUrl,
  updatePageContent,
  softDeletePage,
  getAllPagesAdmin,
  getPagesByAuthor,
  updatePageByAuthor,
  verifyPagePassword,
  fetchPageByAuthor,
};
