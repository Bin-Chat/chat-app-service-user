import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEventsConsumer } from '../kafka/user-events.consumer';
import { KafkaProducerModule } from '../kafka/kafka-producer.module';
import { AuthModule } from '../auth/auth.module';
import { UserProfile } from './entities/user-profile.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserProfile]), AuthModule, KafkaProducerModule],
  providers: [UserService],
  controllers: [UserController, UserEventsConsumer],
  exports: [UserService],
})
export class UserModule {}
