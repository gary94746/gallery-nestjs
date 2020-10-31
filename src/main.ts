import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { config } from 'aws-sdk';

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: '*',
  });

  const configService = app.get(ConfigService);
  config.update({
    accessKeyId: configService.get('aws_access_key_id'),
    secretAccessKey: configService.get('aws_secret_access_key'),
    region: configService.get('aws_region'),
  });

  await app.listen(PORT);
}
bootstrap();
