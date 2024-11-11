import { Request, Response, NextFunction } from 'express';

declare function xssClean(req: Request, res: Response, next: NextFunction): void;

export = xssClean;