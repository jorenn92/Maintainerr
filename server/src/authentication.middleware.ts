import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthenticationService } from './modules/authentication/authentication.service';

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  constructor(private readonly authenticationService: AuthenticationService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const settings =
      await this.authenticationService.getAuthenticationSettings();

    // Set the X-Auth-Enabled header
    res.setHeader('X-Auth-Enabled', settings.authEnabled ? 'true' : 'false');

    const sessionToken = req.cookies?.sessionToken;
    const apiKeyHeader = req.headers['x-api-key'];
    const referer = req.headers['referer'];
    const origin = req.headers['origin'];

    // ✅ Allow UI requests without API key when auth is disabled
    if (!settings.authEnabled && (origin || referer)) {
      return next();
    }

    // ✅ Allow the login and logout endpoints without API key or session token
    if (
      req.path.startsWith('/api/authentication/login') ||
      req.path.startsWith('/api/authentication/logout')
    ) {
      return next();
    }

    // ✅ If sessionToken is present, allow request
    if (sessionToken) {
      return next();
    }

    // ✅ Require API key for API requests when session token is missing
    if (!apiKeyHeader) {
      console.warn('[Middleware] Missing API Key - Unauthorized.');
      throw new UnauthorizedException('Missing API key');
    }

    // ✅ Validate API key
    if (apiKeyHeader !== settings.apiKey) {
      console.warn('[Middleware] Invalid API Key - Unauthorized.');
      throw new UnauthorizedException('Invalid API key');
    }

    next();
  }
}
