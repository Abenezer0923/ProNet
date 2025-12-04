import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserSkill } from './user-skill.entity';
import { Experience } from './experience.entity';
import { Education } from './education.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, length: 30, nullable: true })
  username: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: ['personal', 'organizational'],
    default: 'personal',
  })
  profileType: string;

  @Column({ nullable: true })
  organizationName: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  profession: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  profilePicture: string;

  @Column({ nullable: true })
  coverPhoto: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ default: 0 })
  profileViews: number;

  @Column({ default: true })
  isProfilePublic: boolean;

  @Column({ default: true })
  showEmail: boolean;

  @Column({ default: true })
  showConnections: boolean;

  @OneToMany(() => UserSkill, (skill) => skill.user, { eager: true })
  skills: UserSkill[];

  @OneToMany(() => Experience, (experience) => experience.user)
  experiences: Experience[];

  @OneToMany(() => Education, (education) => education.user)
  educations: Education[];

  @OneToMany(() => import('./certification.entity').Certification, (cert) => cert.user)
  certifications: import('./certification.entity').Certification[];

  @OneToMany(() => import('./product-service.entity').ProductService, (ps) => ps.user)
  productServices: import('./product-service.entity').ProductService[];

  @OneToMany(() => import('./organization-media.entity').OrganizationMedia, (media) => media.user)
  organizationMedia: import('./organization-media.entity').OrganizationMedia[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
