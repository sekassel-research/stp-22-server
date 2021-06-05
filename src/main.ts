import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import { AppModule } from './app.module';
import { environment } from './environment';
import { ThrottlerExceptionFilter } from './util/throttler-exception.filter';

// language=markdown
const description = `
## The STP server for summer term 2022

### Rate Limit
All API operations are rate limited.
You cannot send more than **${environment.rateLimit.limit}** HTTP requests
from the same IP address within **${environment.rateLimit.ttl}** seconds.
WebSockets are exempt from this.

${fs.readFileSync(`${__dirname}/../WebSocket.md`).toString()}
`;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  app.useWebSocketAdapter(new WsAdapter(app));
  app.useGlobalFilters(new ThrottlerExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('STP Server')
    .setDescription(description)
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
