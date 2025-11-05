import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('misc')
export class MiscController {
	@Get('time_now')
	getTimeNow(@Res() res: Response) {
		return res.send(new Date().toISOString());
	}
}
