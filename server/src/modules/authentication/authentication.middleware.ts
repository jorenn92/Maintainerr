import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  constructor(private readonly authenticationService: AuthenticationService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const settings =
      await this.authenticationService.getAuthenticationSettings();

    console.log(`[Middleware] Request to: ${req.path}`); // ✅ Log every request path

    if (!settings.authEnabled) {
      console.log('[Middleware] Authentication is disabled. Skipping.');
      return next();
    }

    console.log(
      '[Middleware] Authentication is enabled, but not enforced yet.',
    );
    next();
  }
}
