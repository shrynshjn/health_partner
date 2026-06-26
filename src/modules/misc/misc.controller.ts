import { Controller, Get } from '@nestjs/common';

@Controller('misc')
export class MiscController {
	@Get('time_now')
	getTimeNow() {
		return { time: new Date().toISOString() };
	}
}
