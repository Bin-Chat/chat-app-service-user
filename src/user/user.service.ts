import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';

import {
  UserRegisteredEvent,
  UserProfileUpdatedEvent,
  UserRoleUpdatedEvent,
  UserStatusUpdatedEvent,
  AvatarDeletedEvent,
  USER_EVENTS,
} from '../kafka/events/user.events';
import { KafkaProducerService } from '../kafka/kafka-producer.service';

import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserProfile } from './entities/user-profile.entity';

@Injectable()
export class UserService {
  // Khoi tao lop va nhan cac dependency can thiet qua dependency injection de xu ly nghiep vu.
  constructor(
    @InjectRepository(UserProfile)
    private profileRepo: Repository<UserProfile>,
    private kafkaProducer: KafkaProducerService
  ) {}

  // ── Kafka event handlers ──────────────────────────────────────────────────

  // Tao projection ho so user tu event dang ky, dam bao idempotent khi event bi gui lai.
  async createFromEvent(event: UserRegisteredEvent): Promise<void> {
    const existing = await this.profileRepo.findOne({ where: { id: event.id } });
    if (existing) return; // idempotent — ignore duplicate events

    const profile = this.profileRepo.create({
      id: event.id,
      email: event.email,
      fullName: event.fullName,
      role: event.role ?? 'user',
      createdAt: new Date(event.createdAt),
    });
    await this.profileRepo.save(profile);
  }

  // Cap nhat projection ho so user khi user-service/auth-service phat event thay doi thong tin.
  async updateFromEvent(event: UserProfileUpdatedEvent): Promise<void> {
    await this.profileRepo.update(event.id, {
      fullName: event.fullName,
      avatar: event.avatar,
    });
  }

  // Dong bo role user tu event de cac service khac kiem tra quyen dung.
  async updateRoleFromEvent(event: UserRoleUpdatedEvent): Promise<void> {
    await this.profileRepo.update(event.id, { role: event.role });
  }

  // Dong bo trang thai khoa/mo cua user tu event.
  async updateStatusFromEvent(event: UserStatusUpdatedEvent): Promise<void> {
    await this.profileRepo.update(event.id, { isActive: event.isActive });
  }

  // ── REST endpoints ────────────────────────────────────────────────────────

  // Tim user theo id va nem loi neu khong ton tai.
  async findById(id: string): Promise<UserProfile> {
    const profile = await this.profileRepo.findOne({ where: { id } });
    if (!profile) throw new NotFoundException('Người dùng không tồn tại');
    return profile;
  }

  // Tim user theo email va nem loi neu khong ton tai.
  async findByEmail(email: string): Promise<UserProfile> {
    const profile = await this.profileRepo.findOne({ where: { email } });
    if (!profile) throw new NotFoundException('Người dùng không tồn tại');
    return profile;
  }

  // Lay nhieu user theo danh sach id, dung cho hydrate du lieu hoi thoai hoac ban be.
  async findByIds(ids: string[]): Promise<UserProfile[]> {
    if (!ids.length) return [];
    return this.profileRepo.find({
      where: { id: In(ids) },
      select: ['id', 'fullName', 'avatar'],
    });
  }

  // Tim user theo ten de phuc vu chuc nang tim kiem nguoi dung.
  async searchByName(name: string): Promise<UserProfile[]> {
    if (!name.trim()) return [];
    return this.profileRepo.find({
      where: { fullName: Like(`%${name}%`), isActive: true },
      take: 20,
    });
  }

  // Cap nhat ho so ca nhan, xu ly avatar cu va phat event profile updated cho service khac.
  async updateProfile(id: string, dto: UpdateProfileDto): Promise<UserProfile> {
    let profile = await this.profileRepo.findOne({ where: { id } });

    // Ghi nhớ avatar cũ trước khi overwrite
    const oldAvatarUrl = profile?.avatar ?? null;

    if (!profile) {
      profile = this.profileRepo.create({ id, ...dto });
    } else {
      Object.assign(profile, dto);
    }
    const saved = await this.profileRepo.save(profile);

    await this.kafkaProducer.emit(USER_EVENTS.PROFILE_UPDATED, {
      id: saved.id,
      fullName: saved.fullName,
      avatar: saved.avatar,
      updatedAt: saved.updatedAt,
    });

    // Nếu avatar thay đổi sang giá trị mới (khác rỗng), xóa ảnh cũ
    const newAvatarUrl = saved.avatar ?? null;
    if (oldAvatarUrl && oldAvatarUrl !== newAvatarUrl) {
      const deleteEvent: AvatarDeletedEvent = { oldAvatarUrl };
      await this.kafkaProducer.emit(USER_EVENTS.AVATAR_DELETED, deleteEvent);
    }

    return saved;
  }

  // Lay danh sach user co phan trang don gian cho man hinh quan tri hoac debug.
  async findAll(skip = 0, take = 50): Promise<UserProfile[]> {
    return this.profileRepo.find({
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
  }
}
