# Experience & Education Feature Implementation

## Overview
Add full LinkedIn-style Experience and Education sections with CRUD operations.

## Current Status
- ✅ UI placeholders exist in profile pages
- ❌ No backend models
- ❌ No API endpoints
- ❌ No add/edit/delete functionality

## Implementation Plan

### Phase 1: Backend - Database Models

#### 1.1 Experience Entity
**File**: `services/user-service/src/users/entities/experience.entity.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('experiences')
export class Experience {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string; // Job title (e.g., "Software Engineer")

  @Column()
  company: string; // Company name

  @Column({ nullable: true })
  location: string; // e.g., "San Francisco, CA"

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date; // null if currently working

  @Column({ default: false })
  currentlyWorking: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  employmentType: string; // Full-time, Part-time, Contract, etc.

  @ManyToOne(() => User, user => user.experiences, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### 1.2 Education Entity
**File**: `services/user-service/src/users/entities/education.entity.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('educations')
export class Education {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  school: string; // University/School name

  @Column()
  degree: string; // e.g., "Bachelor's Degree"

  @Column({ nullable: true })
  fieldOfStudy: string; // e.g., "Computer Science"

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date; // null if currently studying

  @Column({ default: false })
  currentlyStudying: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  grade: string; // GPA or grade

  @Column({ nullable: true })
  activities: string; // Clubs, societies, etc.

  @ManyToOne(() => User, user => user.educations, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### 1.3 Update User Entity
**File**: `services/user-service/src/users/entities/user.entity.ts`

Add these relations:
```typescript
@OneToMany(() => Experience, experience => experience.user)
experiences: Experience[];

@OneToMany(() => Education, education => education.user)
educations: Education[];
```

### Phase 2: Backend - DTOs

#### 2.1 Experience DTOs
**File**: `services/user-service/src/users/dto/create-experience.dto.ts`

```typescript
import { IsString, IsDate, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExperienceDto {
  @IsString()
  title: string;

  @IsString()
  company: string;

  @IsOptional()
  @IsString()
  location?: string;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @IsBoolean()
  currentlyWorking?: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  employmentType?: string;
}

export class UpdateExperienceDto extends CreateExperienceDto {}
```

#### 2.2 Education DTOs
**File**: `services/user-service/src/users/dto/create-education.dto.ts`

```typescript
import { IsString, IsDate, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEducationDto {
  @IsString()
  school: string;

  @IsString()
  degree: string;

  @IsOptional()
  @IsString()
  fieldOfStudy?: string;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @IsBoolean()
  currentlyStudying?: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsString()
  activities?: string;
}

export class UpdateEducationDto extends CreateEducationDto {}
```

### Phase 3: Backend - API Endpoints

#### 3.1 Experience Endpoints
**File**: `services/user-service/src/users/users.controller.ts`

```typescript
// Experience endpoints
@Post('experiences')
async addExperience(@Request() req, @Body() dto: CreateExperienceDto) {
  return this.usersService.addExperience(req.user.sub, dto);
}

@Put('experiences/:id')
async updateExperience(
  @Request() req,
  @Param('id') id: string,
  @Body() dto: UpdateExperienceDto
) {
  return this.usersService.updateExperience(req.user.sub, id, dto);
}

@Delete('experiences/:id')
async deleteExperience(@Request() req, @Param('id') id: string) {
  return this.usersService.deleteExperience(req.user.sub, id);
}

@Get('experiences')
async getExperiences(@Request() req) {
  return this.usersService.getExperiences(req.user.sub);
}
```

#### 3.2 Education Endpoints
```typescript
// Education endpoints
@Post('educations')
async addEducation(@Request() req, @Body() dto: CreateEducationDto) {
  return this.usersService.addEducation(req.user.sub, dto);
}

@Put('educations/:id')
async updateEducation(
  @Request() req,
  @Param('id') id: string,
  @Body() dto: UpdateEducationDto
) {
  return this.usersService.updateEducation(req.user.sub, id, dto);
}

@Delete('educations/:id')
async deleteEducation(@Request() req, @Param('id') id: string) {
  return this.usersService.deleteEducation(req.user.sub, id);
}

@Get('educations')
async getEducations(@Request() req) {
  return this.usersService.getEducations(req.user.sub);
}
```

### Phase 4: Backend - Service Methods

**File**: `services/user-service/src/users/users.service.ts`

```typescript
// Experience methods
async addExperience(userId: string, dto: CreateExperienceDto) {
  const user = await this.userRepository.findOne({ where: { id: userId } });
  const experience = this.experienceRepository.create({ ...dto, user });
  return this.experienceRepository.save(experience);
}

async updateExperience(userId: string, id: string, dto: UpdateExperienceDto) {
  const experience = await this.experienceRepository.findOne({
    where: { id, user: { id: userId } }
  });
  if (!experience) throw new NotFoundException('Experience not found');
  Object.assign(experience, dto);
  return this.experienceRepository.save(experience);
}

async deleteExperience(userId: string, id: string) {
  const result = await this.experienceRepository.delete({
    id,
    user: { id: userId }
  });
  if (result.affected === 0) throw new NotFoundException('Experience not found');
  return { message: 'Experience deleted' };
}

async getExperiences(userId: string) {
  return this.experienceRepository.find({
    where: { user: { id: userId } },
    order: { startDate: 'DESC' }
  });
}

// Education methods (similar pattern)
async addEducation(userId: string, dto: CreateEducationDto) {
  const user = await this.userRepository.findOne({ where: { id: userId } });
  const education = this.educationRepository.create({ ...dto, user });
  return this.educationRepository.save(education);
}

// ... similar methods for update, delete, get
```

### Phase 5: Frontend - Edit Page Forms

#### 5.1 Experience Form Component
**File**: `frontend/src/components/ExperienceForm.tsx`

```typescript
'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

interface ExperienceFormProps {
  experience?: any;
  onSave: () => void;
  onCancel: () => void;
}

export default function ExperienceForm({ experience, onSave, onCancel }: ExperienceFormProps) {
  const [formData, setFormData] = useState({
    title: experience?.title || '',
    company: experience?.company || '',
    location: experience?.location || '',
    startDate: experience?.startDate || '',
    endDate: experience?.endDate || '',
    currentlyWorking: experience?.currentlyWorking || false,
    description: experience?.description || '',
    employmentType: experience?.employmentType || 'Full-time',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (experience) {
        await api.put(`/users/experiences/${experience.id}`, formData);
      } else {
        await api.post('/users/experiences', formData);
      }
      onSave();
    } catch (error) {
      alert('Failed to save experience');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          placeholder="Ex: Software Engineer"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Company *
        </label>
        <input
          type="text"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          required
          placeholder="Ex: Microsoft"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location
        </label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="Ex: San Francisco, CA"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date *
          </label>
          <input
            type="month"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="month"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            disabled={formData.currentlyWorking}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={formData.currentlyWorking}
          onChange={(e) => setFormData({ ...formData, currentlyWorking: e.target.checked, endDate: '' })}
          className="mr-2"
        />
        <label className="text-sm text-gray-700">I currently work here</label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          placeholder="Describe your responsibilities and achievements..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Save
        </button>
      </div>
    </form>
  );
}
```

#### 5.2 Education Form Component
Similar pattern for Education form...

### Phase 6: Frontend - Profile Display

Update profile pages to show real data from API instead of placeholders.

### Phase 7: Database Migration

```sql
-- Create experiences table
CREATE TABLE experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  start_date DATE NOT NULL,
  end_date DATE,
  currently_working BOOLEAN DEFAULT FALSE,
  description TEXT,
  employment_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create educations table
CREATE TABLE educations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  school VARCHAR(255) NOT NULL,
  degree VARCHAR(255) NOT NULL,
  field_of_study VARCHAR(255),
  start_date DATE NOT NULL,
  end_date DATE,
  currently_studying BOOLEAN DEFAULT FALSE,
  description TEXT,
  grade VARCHAR(50),
  activities TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_experiences_user_id ON experiences(user_id);
CREATE INDEX idx_educations_user_id ON educations(user_id);
```

## Implementation Steps

### Step 1: Backend Setup (2-3 hours)
1. Create entity files
2. Create DTO files
3. Add controller endpoints
4. Add service methods
5. Run database migration

### Step 2: Frontend Components (3-4 hours)
1. Create ExperienceForm component
2. Create EducationForm component
3. Create modal/dialog for forms
4. Add state management

### Step 3: Integration (1-2 hours)
1. Update profile edit page
2. Update public profile page
3. Test CRUD operations
4. Handle errors

### Step 4: Polish (1 hour)
1. Add loading states
2. Add validation
3. Improve UI/UX
4. Test edge cases

## Total Estimated Time
**7-10 hours** for complete implementation

## Quick Start (Minimal Version)

For now, I recommend keeping the placeholder sections with "Coming soon" and implementing this as a separate feature later. This is a significant undertaking that requires:

- Database schema changes
- Backend API development
- Frontend form development
- Testing and validation

## Alternative: Quick Fix

If you want something working NOW, I can make the buttons functional to open a modal that says "Feature coming soon - will be available in next update" instead of being completely non-functional.

Would you like me to:
1. **Implement the full feature** (requires significant time)
2. **Create a detailed spec file** for future implementation
3. **Add functional "coming soon" modals** to the buttons

Let me know which approach you prefer!
