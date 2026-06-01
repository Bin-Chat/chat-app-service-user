// Shared event contracts between Auth Service (producer) and User Service (consumer).
// Both services must stay in sync with these interfaces.

export const USER_EVENTS = {
  REGISTERED: 'user.registered',
  PROFILE_UPDATED: 'user.profile_updated',
  ROLE_UPDATED: 'user.role_updated',
  STATUS_UPDATED: 'user.status_updated',
  AVATAR_DELETED: 'upload.avatar_deleted',
};

export interface UserRegisteredEvent {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  createdAt: Date;
}

export interface UserProfileUpdatedEvent {
  id: string;
  fullName: string | null;
  avatar: string | null;
  updatedAt: Date;
}

export interface UserRoleUpdatedEvent {
  id: string;
  role: string;
}

export interface UserStatusUpdatedEvent {
  id: string;
  isActive: boolean;
}

export interface AvatarDeletedEvent {
  /** Full CloudFront CDN URL của ảnh cũ cần xóa */
  oldAvatarUrl: string;
}
