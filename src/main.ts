import { NestFactory } from '@nestjs/core';
import { MyWsAdapter } from './test/test.adapter';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new MyWsAdapter(app))
  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap().catch(error => console.error(error));
