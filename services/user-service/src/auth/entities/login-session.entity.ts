import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('login_sessions')
export class LoginSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  email: string;

  @Column({ default: false })
  requiresOtp: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  lastLoginAt: Date;
}
