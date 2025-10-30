import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller('privacy')
export class PrivacyController {
  @Get()
  getPrivacyPage(@Res() res: Response) {
    return res.sendFile(join(__dirname, '../../public/privacy_policy.html'));
  }
}
