import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationSettings, NotificationSettingsSchema } from './notification-settings.schema';
import { NotificationSettingsService } from './notification-settings.service';
import { NotificationSettingsController } from './notification-settings.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: NotificationSettings.name, schema: NotificationSettingsSchema }])],
  providers: [NotificationSettingsService],
  controllers: [NotificationSettingsController],
  exports: [NotificationSettingsService],
})
export class NotificationSettingsModule {}
