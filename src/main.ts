import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();
let cachedApp: any;

async function bootstrap() {
  if (!cachedApp) {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(server),
    );
    app.enableCors();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
    }));
    await app.init();
    cachedApp = app;
  }
  return cachedApp;
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  bootstrap().then(app => {
    const port = process.env.PORT ?? 3000;
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  });
}

export default async (req: any, res: any) => {
  await bootstrap();
  server(req, res);
};
