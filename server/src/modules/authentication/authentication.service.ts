import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthenticationSettings } from './entities/authentication_settings.entities';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthenticationService implements OnModuleInit {
  constructor(
    @InjectRepository(AuthenticationSettings)
    private readonly authenticationSettingsRepository: Repository<AuthenticationSettings>,
  ) {}

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
    } else if (!settings.apiKey) {
      // ✅ If settings exist but API key is missing, generate one
      settings.apiKey = this.generateApiKey();
      await this.authenticationSettingsRepository.save(settings);
    }
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
