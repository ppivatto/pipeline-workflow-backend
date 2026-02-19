import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();

async function bootstrap(expressInstance: any) {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
  );
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  return app;
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  bootstrap(server).then(app => {
    const port = process.env.PORT ?? 3000;
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  });
} else {
  // For Vercel, we need to export the handler
  bootstrap(server);
}

export default server;
