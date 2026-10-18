import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { type ZodTypeAny } from 'zod';
import { BadRequestError } from '../errors/AppError';

export interface ValidationSchemas {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
}

const collectIssues = (
  details: Record<string, string>,
  scope: string,
  error: import('zod').ZodError,
): void => {
  for (const issue of error.issues) {
    const path = issue.path.length > 0 ? issue.path.join('.') : scope;
    details[path] = issue.message;
  }
};

export const validate = (schemas: ValidationSchemas): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const details: Record<string, string> = {};

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (result.success) {
        req.params = result.data as Request['params'];
      } else {
        collectIssues(details, 'params', result.error);
      }
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (result.success) {
        Object.defineProperty(req, 'query', { value: result.data, writable: true, configurable: true });
      } else {
        collectIssues(details, 'query', result.error);
      }
    }

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (result.success) {
        req.body = result.data;
      } else {
        collectIssues(details, 'body', result.error);
      }
    }

    if (Object.keys(details).length > 0) {
      next(new BadRequestError('Validasi gagal', details));
      return;
    }

    next();
  };
};
