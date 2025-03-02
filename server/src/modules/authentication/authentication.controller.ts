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
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthenticationService } from './authentication.service';

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

  @Post('refresh')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    return this.authenticationService.refreshToken(req, res);
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    const result = await this.authenticationService.logout(res);
    res.status(200).send(result);
  }

  @Get('status')
  checkAuthentication(@Req() req: Request) {
    return { isAuthenticated: req.cookies?.sessionToken ? true : false };
  }
}
