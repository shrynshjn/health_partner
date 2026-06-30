import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { NotificationSettingsService } from './notification-settings.service';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto';

@ApiTags('notification-settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notification-settings')
export class NotificationSettingsController {
  constructor(private readonly service: NotificationSettingsService) {}

  @Get()
  get(@CurrentUser() user: any) {
    return this.service.get(user.userId);
  }

  @Put()
  update(@CurrentUser() user: any, @Body() dto: UpdateNotificationSettingsDto) {
    return this.service.update(user.userId, dto);
  }
}
