import { Module } from '@nestjs/common';
import { PrivacyController } from './privacy.controller';

@Module({
	providers: [],
	controllers: [PrivacyController],
	exports: [],
})
export class MiscModule {}
