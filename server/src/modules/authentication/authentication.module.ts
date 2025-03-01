import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationSettings } from './entities/authentication_settings.entities';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationMiddleware } from '../../authentication.middleware';
import * as crypto from 'crypto';

@Module({
  imports: [TypeOrmModule.forFeature([AuthenticationSettings])],
  providers: [
    AuthenticationService,
    {
      provide: 'JWT_SECRET',
      useValue: crypto.randomBytes(32).toString('hex'), // ✅ Generates a new secret on each restart
    },
  ],
  exports: [AuthenticationService],
  controllers: [AuthenticationController],
})
export class AuthenticationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticationMiddleware).forRoutes('/');
  }
}
