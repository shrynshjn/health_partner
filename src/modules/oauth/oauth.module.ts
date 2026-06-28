import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { OAuthController } from './oauth.controller';

@Module({
  imports: [AuthModule],
  controllers: [OAuthController],
})
export class OAuthModule {}
