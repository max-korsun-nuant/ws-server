import { Controller, Get, HttpCode, Inject, Post } from '@nestjs/common';
import { TEST_SERVICE_TOKEN, TestService } from './test.service';

@Controller('test')
export class TestController {
	constructor(@Inject(TEST_SERVICE_TOKEN) private readonly testService: TestService) {}
	
	@Post('enable')
	@HttpCode(200)
	enable() {
		this.testService.setIsBlockEnabled(true)
	}


	@Post('disable')
	@HttpCode(200)
	disable() {
		this.testService.setIsBlockEnabled(false)
	}

	@Get()
	get() {
		this.testService.getIsBlockEnabled()
	}
}
