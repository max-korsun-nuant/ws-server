import { Injectable, Scope } from '@nestjs/common';

@Injectable({
	scope: Scope.DEFAULT
})
export class TestService {
	private isBlockEnabled: boolean;

	constructor() {
		this.isBlockEnabled = true
	}
	
	setIsBlockEnabled(flag: boolean) {
		this.isBlockEnabled = flag
		console.log("change-enabled", flag)
	}

	getIsBlockEnabled() {
		return this.isBlockEnabled
	}
}

export const TEST_SERVICE_TOKEN = 'TEST_SERVICE_TOKEN';