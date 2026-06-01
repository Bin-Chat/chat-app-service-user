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

  constructor(private userService: UserService) {}

  @EventPattern(USER_EVENTS.REGISTERED)
  async handleUserRegistered(@Payload() event: UserRegisteredEvent) {
    this.logger.log(`[user.registered] userId=${event.id} email=${event.email}`);
    await this.userService.createFromEvent(event);
  }

  @EventPattern(USER_EVENTS.PROFILE_UPDATED)
  async handleUserProfileUpdated(@Payload() event: UserProfileUpdatedEvent) {
    this.logger.log(`[user.profile_updated] userId=${event.id}`);
    await this.userService.updateFromEvent(event);
  }

  @EventPattern(USER_EVENTS.ROLE_UPDATED)
  async handleUserRoleUpdated(@Payload() event: UserRoleUpdatedEvent) {
    this.logger.log(`[user.role_updated] userId=${event.id} role=${event.role}`);
    await this.userService.updateRoleFromEvent(event);
  }

  @EventPattern(USER_EVENTS.STATUS_UPDATED)
  async handleUserStatusUpdated(@Payload() event: UserStatusUpdatedEvent) {
    this.logger.log(`[user.status_updated] userId=${event.id} isActive=${event.isActive}`);
    await this.userService.updateStatusFromEvent(event);
  }
}
