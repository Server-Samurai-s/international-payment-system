declare module 'xss-clean' {
    import { Request, Response, NextFunction } from 'express';

    interface XssCleanMiddleware {
        (req: Request, res: Response, next: NextFunction): void;
    }

    interface Clean {
        (obj: any): any;
    }

    interface XssClean {
        (): XssCleanMiddleware;
        clean: Clean;
    }

    const xssClean: XssClean;
    export = xssClean;
}