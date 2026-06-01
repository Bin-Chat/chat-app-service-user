import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

import { UserService } from '../user/user.service';

import {
  USER_EVENTS,
  UserRegisteredEvent,
  UserProfileUpdatedEvent,
  UserRoleUpdatedEvent,
  UserStatusUpdatedEvent,
} from './events/user.events';

@Controller()
export class UserEventsConsumer {
  private readonly logger = new Logger(UserEventsConsumer.name);

  // Khoi tao lop va nhan cac dependency can thiet qua dependency injection de xu ly nghiep vu.
  constructor(private userService: UserService) {}

  @EventPattern(USER_EVENTS.REGISTERED)
  // Nhan su kien user dang ky tu Kafka de dong bo cache/projection o service hien tai.
  async handleUserRegistered(@Payload() event: UserRegisteredEvent) {
    this.logger.log(`[user.registered] userId=${event.id} email=${event.email}`);
    await this.userService.createFromEvent(event);
  }

  @EventPattern(USER_EVENTS.PROFILE_UPDATED)
  // Nhan su kien cap nhat ho so user tu Kafka va cap nhat du lieu cache/projection.
  async handleUserProfileUpdated(@Payload() event: UserProfileUpdatedEvent) {
    this.logger.log(`[user.profile_updated] userId=${event.id}`);
    await this.userService.updateFromEvent(event);
  }

  @EventPattern(USER_EVENTS.ROLE_UPDATED)
  // Nhan su kien doi role user tu Kafka de dong bo quyen o service hien tai.
  async handleUserRoleUpdated(@Payload() event: UserRoleUpdatedEvent) {
    this.logger.log(`[user.role_updated] userId=${event.id} role=${event.role}`);
    await this.userService.updateRoleFromEvent(event);
  }

  @EventPattern(USER_EVENTS.STATUS_UPDATED)
  // Nhan su kien khoa/mo user tu Kafka de dong bo trang thai hoat dong.
  async handleUserStatusUpdated(@Payload() event: UserStatusUpdatedEvent) {
    this.logger.log(`[user.status_updated] userId=${event.id} isActive=${event.isActive}`);
    await this.userService.updateStatusFromEvent(event);
  }
}
