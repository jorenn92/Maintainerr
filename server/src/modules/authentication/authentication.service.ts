import {
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthenticationSettings } from './entities/authentication_settings.entities';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthenticationService implements OnModuleInit {
  constructor(
    @InjectRepository(AuthenticationSettings)
    private readonly authenticationSettingsRepository: Repository<AuthenticationSettings>,
  ) {}

  generateApiKey(): string {
    return Buffer.from(`Maintainerr${Date.now()}${randomUUID()}`).toString(
      'base64',
    );
  }
  generateJwt_secret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async onModuleInit() {
    let settings = await this.authenticationSettingsRepository.findOne({
      where: {},
    });

    if (!settings) {
      settings = this.authenticationSettingsRepository.create({
        authEnabled: false, // ✅ Default authentication disabled
        username: null,
        passwordHash: null,
        jwt_secret: this.generateJwt_secret(), // ✅ Store JWT secret
        apiKey: this.generateApiKey(), // ✅ Generate API key
      });

      await this.authenticationSettingsRepository.save(settings);
    }
  }

  async getJwtSecret(): Promise<string> {
    const settings = await this.authenticationSettingsRepository.findOne({
      where: {},
    });

    if (!settings || !settings.jwt_secret) {
      throw new Error('JWT secret is missing from the database!');
    }

    return settings.jwt_secret;
  }

  async login(
    username: string,
    password: string,
    res: Response,
  ): Promise<{ success: boolean; message: string }> {
    const settings = await this.getAuthenticationSettings();
    const secret = await this.getJwtSecret();

    if (!settings.authEnabled) {
      return { success: false, message: 'Authentication is disabled' };
    }

    if (!settings.username || !settings.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValidUser = username === settings.username;
    const isValidPassword = await bcrypt.compare(
      password,
      settings.passwordHash,
    );

    if (!isValidUser || !isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generating AccessToken
    const accessToken = jwt.sign({ username }, secret, { expiresIn: '1h' });

    // Generating RefreshToken
    const refreshToken = jwt.sign({ username }, secret, { expiresIn: '30d' });

    res.cookie('sessionToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60, // 1h in seconds
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    });

    return { success: true, message: 'Login successful' };
  }

  async refreshToken(req, res: Response): Promise<void> {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      console.warn('[Refresh] No refresh token found in cookies');
      throw new UnauthorizedException('Refresh token missing');
    }

    try {
      const secret = await this.getJwtSecret();
      const decoded = jwt.verify(refreshToken, secret) as { username: string };

      // ✅ Generate a new Access Token (expires in 1 hour)
      const newAccessToken = jwt.sign({ username: decoded.username }, secret, {
        expiresIn: '1h',
      });
      res.json({ success: true, sessionToken: newAccessToken });
    } catch (error) {
      console.error('[Refresh] Token Verification Failed:', error.message);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(res: Response): Promise<{ success: boolean; message: string }> {
    res.clearCookie('sessionToken', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.clearCookie('refreshToken', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return { success: true, message: 'Logged out' };
  }

  async regenerateApiKey(): Promise<string> {
    return this.generateApiKey();
  }

  async getAuthenticationSettings() {
    return this.authenticationSettingsRepository.findOne({ where: {} });
  }

  async updateAuthenticationSettings(
    authEnabled: boolean,
    username?: string,
    password?: string,
    apiKey?: string,
  ): Promise<{ success: boolean; message: string }> {
    let settings = await this.authenticationSettingsRepository.findOne({
      where: { id: 1 },
    });

    if (!settings) {
      settings = this.authenticationSettingsRepository.create({
        authEnabled: false,
        username: null,
        passwordHash: null,
      });
      settings.id = 1;
    }
    settings.authEnabled = authEnabled;

    if (username) {
      settings.username = username;
    }
    if (password) {
      const saltRounds = 10;
      settings.passwordHash = await bcrypt.hash(password, saltRounds);
    }
    if (apiKey) {
      settings.apiKey = apiKey; // ✅ Save only if regenerated
    }
    await this.authenticationSettingsRepository.save(settings);

    return {
      success: true,
      message: 'Authentication settings updated successfully.',
    };
  }
}
