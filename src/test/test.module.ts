import { Module } from '@nestjs/common';
import { EventEmitterModule, EventEmitter2 } from '@nestjs/event-emitter';

import { TestGateway } from "./test.gateway";
import { TestController } from './test.controller';
import { TestService, TEST_SERVICE_TOKEN } from './test.service';

const testService = new TestService();

@Module({
	providers: [TestGateway, {
		provide: TEST_SERVICE_TOKEN,
		useValue: testService
	}],
	controllers: [TestController]
})
export class TestModule {}
