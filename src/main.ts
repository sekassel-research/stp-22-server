import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import { AppModule } from './app.module';
import { environment } from './environment';
import { ErrorResponse, ValidationErrorResponse } from './util/error-response';
import { ThrottlerExceptionFilter } from './util/throttler-exception.filter';

const generalInfo = fs.readFileSync(`${__dirname}/../GeneralInfo.md`).toString()
  .replace(/\$\{environment\.(\w+)\.(\w+)}/g, (fullMatch, category, key) => environment[category][key]);
const webSocket = fs.readFileSync(`${__dirname}/../WebSocket.md`).toString();
const description = generalInfo + webSocket;

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
  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [ErrorResponse, ValidationErrorResponse],
  });
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}

bootstrap();
