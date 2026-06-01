import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

// Khoi dong NestJS service, nap middleware/cau hinh global va mo cong de container nhan request.
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // Register Kafka microservice transport (event consumer)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'user-service',
        brokers: [process.env.KAFKA_BROKER || 'redpanda:9092'],
      },
      consumer: {
        groupId: 'user-service-consumer',
      },
    },
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.setGlobalPrefix('api');

  await app.startAllMicroservices();

  const port = process.env.PORT || 3020;
  await app.listen(port);
  console.log(`User service running on port ${port}`);
}
bootstrap();
