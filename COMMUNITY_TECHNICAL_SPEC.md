# Community System - Technical Specification

## Database Schema (PostgreSQL + TypeORM)

### Core Entities

```typescript
// Community Entity
@Entity('communities')
export class Community {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  coverImage: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ type: 'enum', enum: ['public', 'private', 'hidden'], default: 'public' })
  privacy: string;

  @Column({ type: 'jsonb', nullable: true })
  settings: object;

  @ManyToOne(() => User)
  owner: User;

  @OneToMany(() => CommunityMember, member => member.community)
  members: CommunityMember[];

  @OneToMany(() => Group, group => group.community)
  groups: Group[];

  @OneToMany(() => Article, article => article.community)
  articles: Article[];

  @OneToMany(() => Post, post => post.community)
  posts: Post[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// Community Member Entity
@Entity('community_members')
export class CommunityMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Community)
  community: Community;

  @ManyToOne(() => User)
  user: User;

  @Column({ type: 'enum', enum: ['owner', 'admin', 'moderator', 'member', 'guest'] })
  role: string;

  @Column({ type: 'jsonb', nullable: true })
  permissions: object;

  @CreateDateColumn()
  joinedAt: Date;
}

// Group Entity
@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Community)
  community: Community;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ['chat', 'mentorship', 'meeting', 'announcement'] })
  type: string;

  @Column({ nullable: true })
  category: string;

  @Column({ type: 'enum', enum: ['public', 'private', 'members-only'] })
  privacy: string;

  @Column({ type: 'jsonb', nullable: true })
  permissions: object;

  @Column({ default: 0 })
  position: number;

  @OneToMany(() => GroupMessage, message => message.group)
  messages: GroupMessage[];

  @CreateDateColumn()
  createdAt: Date;
}

// Group Message Entity
@Entity('group_messages')
export class GroupMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Group)
  group: Group;

  @ManyToOne(() => User)
  author: User;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'jsonb', nullable: true })
  attachments: object[];

  @Column({ nullable: true })
  threadId: string;

  @Column({ default: false })
  isPinned: boolean;

  @Column({ default: false })
  isEdited: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// Article Entity
@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Community)
  community: Community;

  @ManyToOne(() => User)
  author: User;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  coverImage: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  excerpt: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'enum', enum: ['draft', 'published', 'archived'], default: 'draft' })
  status: string;

  @Column({ nullable: true })
  publishedAt: Date;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  clapCount: number;

  @Column({ type: 'jsonb', nullable: true })
  seoMetadata: object;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// Post Entity
@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Community, { nullable: true })
  community: Community;

  @ManyToOne(() => User)
  author: User;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: ['text', 'photo', 'video', 'repost'] })
  type: string;

  @Column({ type: 'jsonb', nullable: true })
  media: object[];

  @Column({ type: 'enum', enum: ['public', 'community', 'followers', 'private'] })
  visibility: string;

  @Column({ type: 'simple-array', nullable: true })
  hashtags: string[];

  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: 0 })
  commentCount: number;

  @Column({ default: 0 })
  repostCount: number;

  @ManyToOne(() => Post, { nullable: true })
  originalPost: Post;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

## API Endpoints

### Community Endpoints

```typescript
// GET /communities - List all communities
// GET /communities/:id - Get community details
// POST /communities - Create new community
// PUT /communities/:id - Update community
// DELETE /communities/:id - Delete community
// POST /communities/:id/join - Join community
// POST /communities/:id/leave - Leave community
// GET /communities/:id/members - List members
// PUT /communities/:id/members/:userId - Update member role
// DELETE /communities/:id/members/:userId - Remove member
```

### Group Endpoints

```typescript
// GET /communities/:id/groups - List groups
// POST /communities/:id/groups - Create group
// PUT /groups/:id - Update group
// DELETE /groups/:id - Delete group
// GET /groups/:id/messages - Get messages (paginated)
// POST /groups/:id/messages - Send message
// PUT /messages/:id - Edit message
// DELETE /messages/:id - Delete message
// POST /messages/:id/pin - Pin message
// POST /messages/:id/react - Add reaction
```

### Article Endpoints

```typescript
// GET /communities/:id/articles - List articles
// GET /articles/:slug - Get article by slug
// POST /communities/:id/articles - Create article
// PUT /articles/:id - Update article
// DELETE /articles/:id - Delete article
// POST /articles/:id/publish - Publish article
// POST /articles/:id/clap - Clap for article
// POST /articles/:id/highlight - Add highlight
// GET /articles/:id/comments - Get comments
// POST /articles/:id/comments - Add comment
```

### Post Endpoints

```typescript
// GET /posts - Get feed (global/community/user)
// GET /posts/:id - Get single post
// POST /posts - Create post
// PUT /posts/:id - Update post
// DELETE /posts/:id - Delete post
// POST /posts/:id/react - Add reaction
// DELETE /posts/:id/react - Remove reaction
// GET /posts/:id/comments - Get comments
// POST /posts/:id/comments - Add comment
// POST /posts/:id/repost - Repost
```

## WebSocket Events

### Real-time Chat

```typescript
// Client -> Server
socket.emit('join_group', { groupId });
socket.emit('leave_group', { groupId });
socket.emit('send_message', { groupId, content, attachments });
socket.emit('typing_start', { groupId });
socket.emit('typing_stop', { groupId });
socket.emit('message_read', { messageId });

// Server -> Client
socket.on('message_received', (message) => {});
socket.on('user_typing', ({ userId, username }) => {});
socket.on('user_stopped_typing', ({ userId }) => {});
socket.on('message_updated', (message) => {});
socket.on('message_deleted', ({ messageId }) => {});
socket.on('user_joined', ({ userId, username }) => {});
socket.on('user_left', ({ userId }) => {});
```

## Caching Strategy

### Redis Cache

```typescript
// Cache Keys
community:{id} - Community details (TTL: 1 hour)
community:{id}:members - Member list (TTL: 5 minutes)
group:{id}:messages - Recent messages (TTL: 1 minute)
article:{slug} - Article content (TTL: 1 hour)
post:{id} - Post details (TTL: 5 minutes)
user:{id}:feed - User feed (TTL: 1 minute)
trending:hashtags - Trending hashtags (TTL: 1 hour)
trending:posts - Trending posts (TTL: 5 minutes)

// Cache Invalidation
- On update: Invalidate specific key
- On delete: Invalidate related keys
- On member join/leave: Invalidate member list
- On new message: Invalidate message cache
```

## Performance Optimization

### Database Indexes

```sql
-- Communities
CREATE INDEX idx_communities_privacy ON communities(privacy);
CREATE INDEX idx_communities_created_at ON communities(created_at DESC);

-- Groups
CREATE INDEX idx_groups_community_id ON groups(community_id);
CREATE INDEX idx_groups_type ON groups(type);
CREATE INDEX idx_groups_category ON groups(category);

-- Messages
CREATE INDEX idx_messages_group_id ON group_messages(group_id);
CREATE INDEX idx_messages_created_at ON group_messages(created_at DESC);
CREATE INDEX idx_messages_thread_id ON group_messages(thread_id);

-- Articles
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_tags ON articles USING GIN(tags);

-- Posts
CREATE INDEX idx_posts_community_id ON posts(community_id);
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_hashtags ON posts USING GIN(hashtags);
```

### Query Optimization

```typescript
// Use pagination for large datasets
const messages = await messageRepository.find({
  where: { groupId },
  order: { createdAt: 'DESC' },
  take: 50,
  skip: page * 50,
});

// Use select to limit fields
const posts = await postRepository.find({
  select: ['id', 'content', 'createdAt', 'likeCount'],
  where: { communityId },
});

// Use eager loading for relations
const community = await communityRepository.findOne({
  where: { id },
  relations: ['owner', 'members', 'groups'],
});
```

## Security Measures

### Authentication & Authorization

```typescript
// JWT-based authentication
// Role-based access control (RBAC)
// Permission checks on every request

@UseGuards(JwtAuthGuard, CommunityMemberGuard)
@RequireRole('admin', 'moderator')
async deleteMessage(@Param('id') id: string) {
  // Only admins and moderators can delete messages
}
```

### Input Validation

```typescript
// Use class-validator for DTO validation
export class CreatePostDto {
  @IsString()
  @MinLength(1)
  @MaxLength(3000)
  content: string;

  @IsEnum(['text', 'photo', 'video'])
  type: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  media?: MediaDto[];
}
```

### Rate Limiting

```typescript
// Prevent spam and abuse
@Throttle(10, 60) // 10 requests per minute
async sendMessage() {}

@Throttle(100, 3600) // 100 requests per hour
async createPost() {}
```

## Monitoring & Logging

### Application Metrics

```typescript
// Track key metrics
- Request latency
- Error rates
- WebSocket connections
- Message throughput
- Cache hit/miss ratio
- Database query performance
```

### Logging

```typescript
// Structured logging with Winston
logger.info('Message sent', {
  userId,
  groupId,
  messageId,
  timestamp: new Date(),
});

logger.error('Failed to send message', {
  userId,
  groupId,
  error: error.message,
  stack: error.stack,
});
```

---

This technical specification provides the foundation for implementing the Community System. Adjust based on your specific requirements and scale needs.
