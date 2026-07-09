import { Request } from 'express';

export interface PaginationQuery {
  page: number;
  limit: number;
  skip: number;
}

/**
 * Utility to parse page, limit, and skip parameters from Express request queries.
 */
export function getPaginationOptions(req: Request): PaginationQuery {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
