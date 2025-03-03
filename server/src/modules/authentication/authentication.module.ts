import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationSettings } from './entities/authentication_settings.entities';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationMiddleware } from '../../authentication.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([AuthenticationSettings])],
  providers: [AuthenticationService],
  exports: [AuthenticationService],
  controllers: [AuthenticationController],
})
export class AuthenticationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticationMiddleware).forRoutes('/');
  }
}
