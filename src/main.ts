import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { WsAdapter } from '@nestjs/platform-ws';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import { AppModule } from './app.module';
import { environment } from './environment';
import { ErrorResponse, ValidationErrorResponse } from './util/error-response';
import { ThrottlerExceptionFilter } from './util/throttler-exception.filter';

// FIXME Most PATCH endpoints allow putting null as a property value,
//       which kind of corrupts the data.

const generalInfo = fs.readFileSync(`${__dirname}/../docs/REST.md`).toString()
  .replace(/\$\{environment\.(\w+)\.(\w+)}/g, (fullMatch, category, key) => environment[category][key]);
const webSocket = fs.readFileSync(`${__dirname}/../docs/WebSocket.md`).toString()
  .replace(/\$\{environment\.(\w+)}/g, (fullMatch, key) => environment[key]);
const description = generalInfo + webSocket;

const globalPrefix = `api/${environment.version}`;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix(globalPrefix);
  app.enableCors();
  app.useWebSocketAdapter(new WsAdapter(app));
  app.useGlobalFilters(new ThrottlerExceptionFilter());

  app.connectMicroservice({
    transport: Transport.NATS,
    options: environment.nats,
  });

  const config = new DocumentBuilder()
    .setTitle('STP Server')
    .setDescription(description)
    .setVersion(environment.version)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [ErrorResponse, ValidationErrorResponse],
  });
  SwaggerModule.setup(globalPrefix, app, document);

  await app.startAllMicroservicesAsync();
  await app.listen(3000);
}

bootstrap();
