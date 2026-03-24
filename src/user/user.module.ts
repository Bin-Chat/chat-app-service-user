import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEventsConsumer } from '../kafka/user-events.consumer';
import { AuthModule } from '../auth/auth.module';
import { UserProfile } from './entities/user-profile.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserProfile]), AuthModule],
  providers: [UserService],
  controllers: [UserController, UserEventsConsumer],
  exports: [UserService],
})
export class UserModule {}
