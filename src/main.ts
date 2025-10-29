import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  // Swagger
  const docConfig = new DocumentBuilder()
    .setTitle('Health Partner API')
    .setDescription('Backend for Health Partner (Media, Food, Workout, Water, Sleep, etc.)')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, docConfig);
  SwaggerModule.setup('api-docs', app, document);

  const port = config.get<number>('PORT') || 3000;
  await app.listen(port);
  console.log(`🚀 Server ready on http://localhost:${port}`);
  console.log(`📘 Swagger docs at http://localhost:${port}/api-docs`);
}
bootstrap();
