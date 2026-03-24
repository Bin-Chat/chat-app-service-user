import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

// This table mirrors profile data from Auth Service, synced via Kafka events.
// It does NOT store credentials (passwordHash) — those stay in auth service.
@Entity('user_profiles')
export class UserProfile {
  @PrimaryColumn('uuid')
  id: string; // Same UUID as in auth-service users table

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
