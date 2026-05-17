import { Response } from 'express';

type IApiReponse<T> = {
  statusCode: number;
  success: boolean;
  message?: string | null;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
  data?: T | null;
  d?: string;
};

const sendResponse = <T>(res: Response, data: IApiReponse<T>): void => {
  const responseData: any = {
    statusCode: data.statusCode,
    success: data.success,
    message: data.message || null,
    meta: data.meta || null || undefined,
    data: data.data || null || undefined,
    d: data.d,
  };

  res.status(data.statusCode).json(responseData);
};

export default sendResponse;
