import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Job } from './job.entity';
import { User } from '../../users/entities/user.entity';

export type JobApplicationStatus =
  | 'submitted'
  | 'under_review'
  | 'interview'
  | 'offer'
  | 'rejected';

@Entity('job_applications')
@Unique(['jobId', 'applicantId'])
export class JobApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  jobId: string;

  @ManyToOne(() => Job, (job) => job.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jobId' })
  job: Job;

  @Column({ type: 'uuid' })
  applicantId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'applicantId' })
  applicant: User;

  @Column({ type: 'text', nullable: true })
  coverLetter: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  resumeUrl: string;

  @Column({
    type: 'enum',
    enum: ['submitted', 'under_review', 'interview', 'offer', 'rejected'],
    default: 'submitted',
  })
  status: JobApplicationStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
