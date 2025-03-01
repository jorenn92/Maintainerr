import {
  Injectable,
  OnModuleInit,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthenticationSettings } from './entities/authentication_settings.entities';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthenticationService implements OnModuleInit {
  constructor(
    @InjectRepository(AuthenticationSettings)
    private readonly authenticationSettingsRepository: Repository<AuthenticationSettings>,
    @Inject('JWT_SECRET') private jwtSecret: string,
  ) {}
  getJwtSecret(): string {
    return this.jwtSecret; // ✅ Expose JWT secret via getter
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
        apiKey: this.generateApiKey(), // ✅ Generate API key
      });

      await this.authenticationSettingsRepository.save(settings);
    }
  }

  async login(
    username: string,
    password: string,
    res: Response,
  ): Promise<{ success: boolean; message: string }> {
    const settings = await this.getAuthenticationSettings();

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

    const secret = this.getJwtSecret(); // ✅ Get JWT secret

    if (!secret || typeof secret !== 'string') {
      console.error('[Login] Invalid JWT Secret:', secret);
      throw new UnauthorizedException('Server misconfiguration');
    }

    // ✅ Generate JWT token
    const sessionToken = jwt.sign(
      { username }, // ✅ Store username in JWT
      secret, // ✅ Sign token with correct secret
      { expiresIn: '1h' }, // ✅ Token expires in 1 hour
    );

    // ✅ Securely store authentication session in HttpOnly cookie
    res.cookie('sessionToken', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return { success: true, message: 'Login successful' };
  }

  generateApiKey(): string {
    return Buffer.from(`Maintainerr${Date.now()}${randomUUID()}`).toString(
      'base64',
    );
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
