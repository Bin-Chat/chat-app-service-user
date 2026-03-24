import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';

import { UserRegisteredEvent, UserProfileUpdatedEvent } from '../kafka/events/user.events';

import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserProfile } from './entities/user-profile.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserProfile)
    private profileRepo: Repository<UserProfile>
  ) {}

  // ── Kafka event handlers ──────────────────────────────────────────────────

  async createFromEvent(event: UserRegisteredEvent): Promise<void> {
    const existing = await this.profileRepo.findOne({ where: { id: event.id } });
    if (existing) return; // idempotent — ignore duplicate events

    const profile = this.profileRepo.create({
      id: event.id,
      email: event.email,
      fullName: event.fullName,
      createdAt: new Date(event.createdAt),
    });
    await this.profileRepo.save(profile);
  }

  async updateFromEvent(event: UserProfileUpdatedEvent): Promise<void> {
    await this.profileRepo.update(event.id, {
      fullName: event.fullName,
      avatar: event.avatar,
    });
  }

  // ── REST endpoints ────────────────────────────────────────────────────────

  async findById(id: string): Promise<UserProfile> {
    const profile = await this.profileRepo.findOne({ where: { id } });
    if (!profile) throw new NotFoundException('Người dùng không tồn tại');
    return profile;
  }

  async findByEmail(email: string): Promise<UserProfile> {
    const profile = await this.profileRepo.findOne({ where: { email } });
    if (!profile) throw new NotFoundException('Người dùng không tồn tại');
    return profile;
  }

  async searchByName(name: string): Promise<UserProfile[]> {
    if (!name.trim()) return [];
    return this.profileRepo.find({
      where: { fullName: Like(`%${name}%`), isActive: true },
      take: 20,
    });
  }

  async updateProfile(id: string, dto: UpdateProfileDto): Promise<UserProfile> {
    const profile = await this.findById(id);
    Object.assign(profile, dto);
    return this.profileRepo.save(profile);
  }

  async findAll(skip = 0, take = 50): Promise<UserProfile[]> {
    return this.profileRepo.find({
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
  }
}
