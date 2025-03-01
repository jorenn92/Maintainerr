import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthenticationService } from './modules/authentication/authentication.service';
import * as jwt from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
  user?: any;
}

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  constructor(private readonly authenticationService: AuthenticationService) {}

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const settings =
      await this.authenticationService.getAuthenticationSettings();

    // Set the X-Auth-Enabled header
    res.setHeader('X-Auth-Enabled', settings.authEnabled ? 'true' : 'false');

    const sessionToken = req.cookies?.sessionToken;
    const apiKeyHeader = req.headers['x-api-key'];
    const referer = req.headers['referer'];
    const origin = req.headers['origin'];

    // ✅ Always allow UI requests (regardless of authentication)
    if (origin || referer) {
      return next();
    }

    // ✅ Allow the login/logout/status endpoints without authentication
    if (
      req.path.startsWith('/api/authentication/login') ||
      req.path.startsWith('/api/authentication/logout') ||
      req.path.startsWith('/api/authentication/status')
    ) {
      return next();
    }

    // ✅ Non-UI Requests Require API Key or Session Token
    if (sessionToken) {
      try {
        const secret = this.authenticationService.getJwtSecret();
        const decoded = jwt.verify(sessionToken, secret);
        req.user = decoded;
        return next(); // ✅ Valid session token → allow
      } catch (error) {
        console.warn('[Middleware] Invalid or Expired JWT:', error.message);
        throw new UnauthorizedException('Invalid or expired session token');
      }
    }

    if (!apiKeyHeader) {
      console.warn('[Middleware] Missing API Key - Unauthorized.');
      throw new UnauthorizedException('Missing API key');
    }

    if (apiKeyHeader !== settings.apiKey) {
      console.warn('[Middleware] Invalid API Key - Unauthorized.');
      throw new UnauthorizedException('Invalid API key');
    }

    next();
  }
}
