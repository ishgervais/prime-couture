import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.use(helmet());
  app.use(cookieParser());
  const allowedOrigins =
    process.env.FRONTEND_URL
      ?.split(',')
      .map((o) => o.trim())
      .filter(Boolean) || [];

  // If no explicit origins are set, allow all without credentials; otherwise use the provided list and allow credentials.
  app.enableCors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: allowedOrigins.length > 0,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidUnknownValues: false,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Prime Couture API')
    .setDescription('Prime Couture ecommerce backend API documentation')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Prime Couture backend running on http://localhost:${port}`);
}

bootstrap();
