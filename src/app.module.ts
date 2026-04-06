import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { UserProfile } from './user/entities/user-profile.entity';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USERNAME', 'chatapp'),
        password: config.get('DB_PASSWORD', 'ngocanh123'),
        database: config.get('DB_NAME', 'user_service'),
        entities: [UserProfile],
        synchronize: config.get('NODE_ENV') === 'development',
      }),
    }),
    AuthModule,
    UserModule,
  ],
})
export class AppModule {}
