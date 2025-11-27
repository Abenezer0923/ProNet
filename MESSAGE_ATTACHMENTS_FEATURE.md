# Message Attachments Feature

## Overview
Added file attachment support to direct messaging, allowing users to send images, PDFs, and documents.

## Backend Changes

### 1. Message Entity (`services/user-service/src/chat/entities/message.entity.ts`)
Added fields:
- `attachments: string[]` - Array of file URLs
- `attachmentType: string` - Type of attachment (image, pdf, document)

### 2. Send Message DTO (`services/user-service/src/chat/dto/send-message.dto.ts`)
Added optional fields:
- `attachments?: string[]`
- `attachmentType?: string`

### 3. Database Migration Needed
Run migration to add new columns to messages table:
```sql
ALTER TABLE messages ADD COLUMN attachments text[];
ALTER TABLE messages ADD COLUMN attachmentType varchar(50);
```

## Frontend Changes

### Features to Implement
1. **File Upload Button** - Paperclip icon next to message input
2. **File Preview** - Show selected file before sending
3. **File Type Detection** - Auto-detect image/pdf/document
4. **Upload Progress** - Show upload status
5. **File Display** - Render attachments in messages
6. **Download Support** - Allow downloading attachments

### UI Components Needed
1. File input (hidden)
2. Attachment button
3. File preview card
4. Remove attachment button
5. Attachment display in messages
6. Image lightbox for viewing

### Supported File Types
- **Images**: jpg, jpeg, png, gif, webp
- **Documents**: pdf, doc, docx, txt
- **Max Size**: 10MB per file

## Implementation Steps

### Backend (Already Done)
✅ Updated Message entity
✅ Updated SendMessageDto

### Frontend (To Do)
1. Add file input to message form
2. Handle file selection
3. Upload file to `/upload` endpoint
4. Include attachment URL in message
5. Display attachments in message bubbles
6. Add download/view functionality

## API Flow

### Sending Message with Attachment
1. User selects file
2. Frontend uploads to `/upload` endpoint
3. Get file URL from response
4. Send message with attachment URL
5. Backend saves message with attachment
6. Socket broadcasts message to recipient

### Receiving Message with Attachment
1. Socket receives message event
2. Check if message has attachments
3. Render attachment based on type
4. Allow viewing/downloading

## Security Considerations
- Validate file types on upload
- Check file size limits
- Scan for malware (future)
- Secure file storage
- Access control for files

## User Experience
- Drag and drop support (future)
- Multiple file attachments (future)
- Image compression (future)
- Thumbnail generation (future)
- Progress indicators
- Error handling
- File type icons

## Testing Checklist
- [ ] Upload image attachment
- [ ] Upload PDF attachment
- [ ] Upload document attachment
- [ ] View image in message
- [ ] Download PDF from message
- [ ] Send message with attachment
- [ ] Receive message with attachment
- [ ] Handle upload errors
- [ ] Handle large files
- [ ] Mobile responsiveness

## Future Enhancements
1. **Multiple Attachments** - Send multiple files at once
2. **Drag and Drop** - Drag files into chat
3. **Image Compression** - Reduce image file sizes
4. **Thumbnails** - Generate thumbnails for images
5. **Video Support** - Send video files
6. **Audio Messages** - Voice recordings
7. **File Preview** - Preview PDFs in-app
8. **Gallery View** - View all media in conversation
9. **Search Attachments** - Find files in chat history
10. **Cloud Storage** - Integrate with cloud providers
