import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
import ApiError from '../utils/ApiError';

/**
 * Express middleware helper to validate incoming requests against Zod schemas.
 */
export function validate(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.body = parsed.body;
      req.query = parsed.query;
      req.params = parsed.params;
      next();
    } catch (error: any) {
      const messages = error.errors 
        ? error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ') 
        : error.message;
      next(new ApiError(400, `Validation Failed: ${messages}`));
    }
  };
}
export default validate;
