// Shared event contracts between Auth Service (producer) and User Service (consumer).
// Both services must stay in sync with these interfaces.

export const USER_EVENTS = {
  REGISTERED: 'user.registered',
  PROFILE_UPDATED: 'user.profile_updated',
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

export interface AvatarDeletedEvent {
  /** Full CloudFront CDN URL của ảnh cũ cần xóa */
  oldAvatarUrl: string;
}
