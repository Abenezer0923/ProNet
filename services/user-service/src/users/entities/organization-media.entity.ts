import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('organization_media')
export class OrganizationMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  mediaUrl: string;

  @Column({
    type: 'enum',
    enum: ['image', 'video'],
    default: 'image',
  })
  mediaType: string;

  @Column({ nullable: true })
  caption: string;

  @Column({ default: 0 })
  displayOrder: number;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.organizationMedia, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
