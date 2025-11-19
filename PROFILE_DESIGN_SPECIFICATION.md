# Profile Design Specification - ProNet

## Overview
This document outlines the design and structure for two types of profiles in ProNet:
1. **Personal Profiles** - For individual users
2. **Company Profiles** - For organizations and businesses

---

## 1. Personal Profile Design

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    COVER PHOTO (1584x396px)                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
┌──────────────┐
│   PROFILE    │  John Doe                    [Follow] [Message] [More ▼]
│   PHOTO      │  Senior Software Engineer at Google
│  (200x200)   │  📍 San Francisco, CA | 🌐 johndoe.com
└──────────────┘  👥 1,234 followers · 567 following

┌─────────────────────────────────────────────────────────────┐
│  [About] [Experience] [Education] [Skills] [Communities]    │ ← Tabs
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  MAIN CONTENT AREA (Based on selected tab)                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Section Breakdown

#### **Header Section**
- **Cover Photo**: 1584x396px, customizable background image
- **Profile Photo**: 200x200px circular avatar, overlaps cover photo
- **Primary Info**:
  - Full Name (H1, bold, 32px)
  - Professional Title/Headline (18px, gray)
  - Location with icon (16px)
  - Website link with icon (16px, clickable)
- **Stats Bar**:
  - Follower count (clickable → shows followers list)
  - Following count (clickable → shows following list)
- **Action Buttons**:
  - **Follow/Following** button (primary CTA)
  - **Message** button (secondary)
  - **More** dropdown (Report, Block, Share profile)
  - **Edit Profile** button (only visible to profile owner)

#### **Navigation Tabs**
Sticky tabs that remain visible when scrolling:
1. **About** (default)
2. **Experience**
3. **Education**
4. **Skills**
5. **Communities**

---

### Tab Content Details

#### **1. About Tab** (Default View)

```
┌─────────────────────────────────────────────────────────────┐
│ 📝 About                                          [Edit]     │
├─────────────────────────────────────────────────────────────┤
│ Bio text goes here... (max 2000 characters)                 │
│ Can be multiple paragraphs with line breaks.                │
│                                                             │
│ 📧 Contact Information                            [Edit]     │
│ ├─ Email: john@example.com                                  │
│ ├─ Phone: +1 (555) 123-4567                                │
│ └─ LinkedIn: linkedin.com/in/johndoe                        │
│                                                             │
│ 📊 Profile Stats                                            │
│ ├─ Profile views: 1,234 (last 90 days)                     │
│ ├─ Post impressions: 45.6K                                  │
│ └─ Member since: January 2024                               │
└─────────────────────────────────────────────────────────────┘
```

**Features**:
- Rich text bio with formatting support
- Contact information (email, phone, social links)
- Privacy controls for each contact field
- Profile statistics
- Member since date

#### **2. Experience Tab**

```
┌─────────────────────────────────────────────────────────────┐
│ 💼 Experience                                    [+ Add]     │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Logo] Senior Software Engineer                         │ │
│ │        Google · Full-time                               │ │
│ │        Jan 2023 - Present · 1 yr 11 mos                │ │
│ │        San Francisco, CA                                │ │
│ │                                                         │ │
│ │        Building scalable cloud infrastructure...        │ │
│ │        [Edit] [Delete]                                  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Logo] Software Engineer                                │ │
│ │        Microsoft · Full-time                            │ │
│ │        Jun 2020 - Dec 2022 · 2 yrs 7 mos               │ │
│ │        Seattle, WA                                      │ │
│ │        [Edit] [Delete]                                  │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Features**:
- Company logo placeholder (or default icon)
- Position title (bold, prominent)
- Company name · Employment type
- Date range with duration calculation
- Location
- Description (expandable if long)
- Edit/Delete controls (owner only)
- Sorted by date (most recent first)

#### **3. Education Tab**

```
┌─────────────────────────────────────────────────────────────┐
│ 🎓 Education                                     [+ Add]     │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Logo] Stanford University                              │ │
│ │        Bachelor's Degree, Computer Science              │ │
│ │        2016 - 2020                                      │ │
│ │        Grade: 3.8 GPA                                   │ │
│ │                                                         │ │
│ │        Activities: Computer Science Club, ACM           │ │
│ │        [Edit] [Delete]                                  │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Features**:
- School logo placeholder
- Degree and field of study
- Date range
- Grade/GPA (optional)
- Activities and societies
- Description (optional)
- Edit/Delete controls

#### **4. Skills Tab**

```
┌─────────────────────────────────────────────────────────────┐
│ 🎯 Skills & Endorsements                         [+ Add]     │
├─────────────────────────────────────────────────────────────┤
│ Top Skills                                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ JavaScript                                    [Endorse]  │ │
│ │ ⭐⭐⭐ Expert · 45 endorsements                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ React                                         [Endorse]  │ │
│ │ ⭐⭐⭐ Expert · 38 endorsements                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Node.js                                       [Endorse]  │ │
│ │ ⭐⭐ Intermediate · 22 endorsements                      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [Show all 15 skills ▼]                                      │
└─────────────────────────────────────────────────────────────┘
```

**Features**:
- Skill name with proficiency level
- Visual proficiency indicator (stars/bars)
- Endorsement count
- Endorse button (for other users)
- Grouped by proficiency (Top skills first)
- Expandable list

#### **5. Communities Tab**

```
┌─────────────────────────────────────────────────────────────┐
│ 👥 Communities                                              │
├─────────────────────────────────────────────────────────────┤
│ Created & Managing (2)                                      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Cover] Web Developers Network                          │ │
│ │         12.5K members · Public                          │ │
│ │         [View Community]                                │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Member Of (8)                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Cover] React Developers                                │ │
│ │         45K members · Public                            │ │
│ │         [View Community]                                │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [Show all communities ▼]                                    │
└─────────────────────────────────────────────────────────────┘
```

**Features**:
- Separated sections: Created/Managing vs Member
- Community cover image
- Member count and privacy status
- Quick link to community page
- Shows role (Admin, Moderator, Member)

---

## 2. Company Profile Design

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    COMPANY COVER (1584x396px)               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
┌──────────────┐
│   COMPANY    │  Google LLC                  [Follow] [Visit Website]
│    LOGO      │  Technology, Information and Internet
│  (200x200)   │  📍 Mountain View, CA | 🌐 google.com
└──────────────┘  👥 2.5M followers · 150K employees

┌─────────────────────────────────────────────────────────────┐
│  [Home] [About] [Posts] [Jobs] [People] [Communities]       │ ← Tabs
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  MAIN CONTENT AREA (Based on selected tab)                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Tab Content Details

#### **1. Home Tab** (Default View)

```
┌─────────────────────────────────────────────────────────────┐
│ 📌 Pinned Post                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Company Logo] Google LLC                               │ │
│ │                2 days ago                               │ │
│ │                                                         │ │
│ │ We're excited to announce our new AI initiative...     │ │
│ │ [Image/Video]                                           │ │
│ │                                                         │ │
│ │ 👍 1.2K  💬 234  🔄 567                                 │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 📰 Recent Posts                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Post content...]                                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 💼 Featured Jobs (3)                                        │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Senior Software Engineer                                │ │
│ │ Mountain View, CA · Full-time                           │ │
│ │ [Apply Now]                                             │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Features**:
- Pinned post (company announcement)
- Recent posts feed
- Featured job listings
- Company updates and news

#### **2. About Tab**

```
┌─────────────────────────────────────────────────────────────┐
│ 📖 Overview                                                 │
│ Company description and mission statement...                │
│                                                             │
│ 📊 Company Details                                          │
│ ├─ Industry: Technology, Information and Internet           │
│ ├─ Company size: 10,001+ employees                         │
│ ├─ Headquarters: Mountain View, California                 │
│ ├─ Type: Public Company                                    │
│ ├─ Founded: 1998                                           │
│ ├─ Specialties: Search, Advertising, Cloud Computing       │
│ └─ Website: google.com                                     │
│                                                             │
│ 📍 Locations (15)                                           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🏢 Headquarters                                         │ │
│ │    1600 Amphitheatre Parkway                            │ │
│ │    Mountain View, CA 94043                              │ │
│ └─────────────────────────────────────────────────────────┘ │
│ [Show all locations ▼]                                      │
│                                                             │
│ 🏆 Awards & Recognition                                     │
│ ├─ Best Place to Work 2024                                 │
│ ├─ Innovation Award 2023                                   │
│ └─ [View all awards]                                       │
└─────────────────────────────────────────────────────────────┘
```

**Features**:
- Company overview and mission
- Detailed company information
- Multiple office locations
- Awards and recognition
- Company culture highlights

#### **3. Posts Tab**

```
┌─────────────────────────────────────────────────────────────┐
│ 📝 Company Posts                                [+ Create]   │
├─────────────────────────────────────────────────────────────┤
│ [Filter: All Posts ▼] [Sort: Recent ▼]                     │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Company Logo] Google LLC                               │ │
│ │                3 hours ago                              │ │
│ │                                                         │ │
│ │ Post content...                                         │ │
│ │ [Media attachments]                                     │ │
│ │                                                         │ │
│ │ 👍 234  💬 45  🔄 89  [Comment] [Share]                │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [Load more posts...]                                        │
└─────────────────────────────────────────────────────────────┘
```

**Features**:
- All company posts in chronological order
- Filter options (All, Announcements, Events, etc.)
- Sort options (Recent, Popular, etc.)
- Create post button (for admins)
- Engagement metrics

#### **4. Jobs Tab**

```
┌─────────────────────────────────────────────────────────────┐
│ 💼 Open Positions (47)                         [Post Job]    │
├─────────────────────────────────────────────────────────────┤
│ [Search jobs...] [Filter: All ▼] [Location ▼] [Type ▼]     │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Senior Software Engineer                                │ │
│ │ Mountain View, CA · Full-time · $150K-$200K             │ │
│ │ Posted 2 days ago · 45 applicants                       │ │
│ │                                                         │ │
│ │ We're looking for an experienced engineer...            │ │
│ │                                                         │ │
│ │ [Apply Now] [Save]                                      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Product Manager                                         │ │
│ │ San Francisco, CA · Full-time · $130K-$180K             │ │
│ │ Posted 5 days ago · 89 applicants                       │ │
│ │ [Apply Now] [Save]                                      │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Features**:
- Job search and filters
- Job listings with key details
- Applicant count
- Salary range (optional)
- Quick apply functionality
- Save job feature

#### **5. People Tab**

```
┌─────────────────────────────────────────────────────────────┐
│ 👥 People at Google (150,234)                               │
├─────────────────────────────────────────────────────────────┤
│ [Search people...] [Filter: All ▼] [Department ▼]          │
│                                                             │
│ Leadership Team                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Photo] Sundar Pichai                                   │ │
│ │         CEO                                             │ │
│ │         [View Profile] [Follow]                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Employees You May Know (12)                                 │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Photo] Jane Smith                                      │ │
│ │         Senior Engineer                                 │ │
│ │         [Connect]                                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [See all employees →]                                       │
└─────────────────────────────────────────────────────────────┘
```

**Features**:
- Employee directory
- Leadership team showcase
- Search and filter employees
- Department/team filtering
- Connection suggestions
- Employee count

#### **6. Communities Tab**

```
┌─────────────────────────────────────────────────────────────┐
│ 🏘️ Company Communities                                      │
├─────────────────────────────────────────────────────────────┤
│ Official Communities (3)                                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Cover] Google Developers                               │ │
│ │         125K members · Public                           │ │
│ │         Official community for developers               │ │
│ │         [Join Community]                                │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Employee Communities (8)                                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Cover] Googlers in SF                                  │ │
│ │         2.5K members · Private                          │ │
│ │         For Google employees in San Francisco           │ │
│ │         [Request to Join]                               │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Features**:
- Official company communities
- Employee-only communities
- Community descriptions
- Member counts and privacy
- Join/Request access buttons

---

## 3. Design Best Practices

### Visual Hierarchy
1. **Primary**: Name, Title, CTA buttons
2. **Secondary**: Stats, location, contact info
3. **Tertiary**: Descriptions, metadata

### Color Scheme
- **Primary**: Indigo (#4F46E5) - CTAs, links
- **Secondary**: Gray (#6B7280) - Supporting text
- **Success**: Green (#10B981) - Follow status
- **Background**: White (#FFFFFF) / Light gray (#F9FAFB)

### Typography
- **Headings**: Inter/SF Pro Display (Bold)
- **Body**: Inter/SF Pro Text (Regular)
- **Sizes**: 32px (H1), 24px (H2), 18px (H3), 16px (Body), 14px (Small)

### Spacing
- **Section padding**: 24px
- **Card padding**: 16px
- **Element spacing**: 8px, 16px, 24px (consistent scale)

### Responsive Design
- **Desktop**: Full layout (1200px+ container)
- **Tablet**: Stacked sections (768px-1199px)
- **Mobile**: Single column, collapsible sections (<768px)

---

## 4. Additional Features & Improvements

### For Personal Profiles

1. **Activity Feed**
   - Recent posts and interactions
   - Shared content
   - Endorsements received

2. **Recommendations**
   - Testimonials from colleagues
   - Endorsements with context
   - Request recommendation feature

3. **Certifications**
   - Professional certifications
   - Licenses
   - Verification badges

4. **Projects/Portfolio**
   - Showcase work samples
   - GitHub integration
   - Project descriptions with media

5. **Languages**
   - Spoken languages with proficiency
   - Helps with international networking

6. **Volunteer Experience**
   - Non-profit work
   - Community service
   - Causes supported

### For Company Profiles

1. **Company Culture**
   - Photos and videos
   - Employee testimonials
   - Day-in-the-life content

2. **Products & Services**
   - Product showcase
   - Service offerings
   - Case studies

3. **News & Press**
   - Press releases
   - Media mentions
   - Company announcements

4. **Events**
   - Upcoming events
   - Webinars
   - Conferences

5. **Analytics Dashboard** (for admins)
   - Follower growth
   - Post engagement
   - Profile views
   - Job application metrics

6. **Alumni Network**
   - Former employees
   - Alumni community
   - Success stories

---

## 5. Privacy & Settings

### Personal Profile Privacy
- **Profile visibility**: Public, Connections only, Private
- **Contact info visibility**: Per-field control
- **Activity visibility**: Show/hide recent activity
- **Search visibility**: Appear in search results
- **Profile views**: Show who viewed your profile

### Company Profile Settings
- **Page admins**: Manage who can post/edit
- **Posting permissions**: Who can post on behalf of company
- **Follower notifications**: Alert admins of milestones
- **Analytics access**: Control who sees metrics

---

## 6. Mobile Optimization

### Key Considerations
- **Touch-friendly**: 44px minimum tap targets
- **Swipeable tabs**: Horizontal scroll for tabs
- **Collapsible sections**: Accordion-style for long content
- **Bottom navigation**: Quick access to key actions
- **Pull-to-refresh**: Update content easily
- **Infinite scroll**: Smooth content loading

---

## 7. Accessibility (A11Y)

### Requirements
- **WCAG 2.1 AA compliance**
- **Keyboard navigation**: Full keyboard support
- **Screen reader support**: Proper ARIA labels
- **Color contrast**: 4.5:1 minimum ratio
- **Focus indicators**: Clear focus states
- **Alt text**: All images have descriptions
- **Semantic HTML**: Proper heading hierarchy

---

## 8. Performance Optimization

### Best Practices
- **Lazy loading**: Load images as needed
- **Code splitting**: Load tabs on demand
- **Image optimization**: WebP format, responsive images
- **Caching**: Cache profile data appropriately
- **CDN**: Serve static assets from CDN
- **Skeleton screens**: Show loading states

---

## Implementation Priority

### Phase 1 (MVP)
✅ Basic profile layout
✅ About section
✅ Experience & Education
✅ Skills
✅ Follow/Following functionality

### Phase 2
- Communities tab
- Company profiles (basic)
- Enhanced privacy controls
- Mobile optimization

### Phase 3
- Advanced company features (Jobs, People)
- Recommendations
- Certifications
- Analytics dashboard

### Phase 4
- Projects/Portfolio
- Events
- Alumni network
- Advanced analytics

---

## Conclusion

This design specification provides a comprehensive, modern, and user-friendly approach to both Personal and Company profiles. The structure follows LinkedIn's proven patterns while adding unique features that enhance the professional networking experience.

**Key Takeaways**:
- Clean, scannable layouts
- Clear information hierarchy
- Mobile-first responsive design
- Privacy-focused controls
- Accessibility compliance
- Performance optimized
- Scalable architecture

The design balances professional aesthetics with usability, ensuring users can easily showcase their professional identity while companies can effectively engage with their audience.
