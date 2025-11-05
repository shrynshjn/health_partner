import { Module } from '@nestjs/common';
import { PrivacyController } from './privacy.controller';
import { MiscController } from './misc.controller';

@Module({
	providers: [],
	controllers: [PrivacyController, MiscController],
	exports: [],
})
export class MiscModule {}
