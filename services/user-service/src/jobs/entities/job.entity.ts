import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { JobApplication } from './job-application.entity';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'organizationId' })
  organization: User;

  @Column({ type: 'varchar', length: 180 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  employmentType: string;

  @Column({ type: 'varchar', length: 50 })
  workplaceType: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  salaryCurrency: string;

  @Column({ type: 'integer', nullable: true })
  salaryMin: number;

  @Column({ type: 'integer', nullable: true })
  salaryMax: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  experienceLevel: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  seniority: string;

  @Column({ type: 'jsonb', nullable: true, default: () => "'[]'::jsonb" })
  responsibilities: string[];

  @Column({ type: 'jsonb', nullable: true, default: () => "'[]'::jsonb" })
  requirements: string[];

  @Column({ type: 'jsonb', nullable: true, default: () => "'[]'::jsonb" })
  benefits: string[];

  @Column({ type: 'varchar', length: 500, nullable: true })
  applicationUrl: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contactEmail: string;

  @Column({ type: 'timestamp', nullable: true })
  applicationDeadline: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  organizationName: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  organizationLogo: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => JobApplication, (application) => application.job)
  applications: JobApplication[];
}
