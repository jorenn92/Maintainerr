import {
  Controller,
  Get,
  Patch,
  Body,
  Post,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthenticationService } from './authentication.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Controller('api/authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Get('settings')
  async getAuthenticationSettings() {
    return this.authenticationService.getAuthenticationSettings();
  }

  @Patch('settings')
  async updateAuthenticationSettings(
    @Body()
    body: {
      authEnabled: boolean;
      username?: string;
      password?: string;
      apiKey?: string;
    },
  ) {
    return this.authenticationService.updateAuthenticationSettings(
      body.authEnabled,
      body.username,
      body.password,
      body.apiKey,
    );
  }
  @Post('apikey/generate')
  async regenerateApiKey() {
    const newApiKey = await this.authenticationService.regenerateApiKey();
    return { apiKey: newApiKey };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: { username: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authenticationService.login(body.username, body.password, res);
  }

  @Post('logout')
  logout(@Res() res) {
    res.clearCookie('sessionToken', {
      path: '/',
      httpOnly: true,
      secure: true, // Ensure it's secure
      sameSite: 'strict',
    });
    res.status(200).send({ message: 'Logged out' });
  }

  @Get('status')
  checkAuthentication(@Req() req: Request) {
    return { isAuthenticated: req.cookies?.sessionToken ? true : false };
  }
}
