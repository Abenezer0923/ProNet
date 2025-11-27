# Frontend File Attachment Implementation Guide

## Current Status
✅ Backend is ready (Message entity and DTO updated)
❌ Frontend UI needs to be implemented

## What Needs to Be Added

### 1. State Management in MessagingContent.tsx

Add these state variables:
```typescript
const [selectedFile, setSelectedFile] = useState<File | null>(null);
const [uploadingFile, setUploadingFile] = useState(false);
const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
const fileInputRef = useRef<HTMLInputElement>(null);
```

### 2. File Selection Handler

```typescript
const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Validate file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    alert('File size must be less than 10MB');
    return;
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
  
  if (!allowedTypes.includes(file.type)) {
    alert('File type not supported. Please upload images, PDFs, or documents.');
    return;
  }

  setSelectedFile(file);
  
  // Create preview for images
  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  } else {
    setFilePreviewUrl(null);
  }
};
```

### 3. Updated Send Message Handler

```typescript
const handleSendMessage = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!newMessage.trim() && !selectedFile) return;

  let attachmentUrl = '';
  let attachmentType = '';

  // Upload file if selected
  if (selectedFile) {
    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const uploadResponse = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      attachmentUrl = uploadResponse.data.url;
      
      // Determine attachment type
      if (selectedFile.type.startsWith('image/')) {
        attachmentType = 'image';
      } else if (selectedFile.type === 'application/pdf') {
        attachmentType = 'pdf';
      } else {
        attachmentType = 'document';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
      setUploadingFile(false);
      return;
    } finally {
      setUploadingFile(false);
    }
  }

  // Send message with attachment
  await sendMessage(newMessage || 'Sent an attachment', attachmentUrl ? [attachmentUrl] : undefined, attachmentType || undefined);
  
  // Clear form
  setNewMessage('');
  setSelectedFile(null);
  setFilePreviewUrl(null);
};
```

### 4. Update useChat Hook

Modify the `sendMessage` function in `frontend/src/hooks/useChat.ts`:

```typescript
const sendMessage = async (content: string, attachments?: string[], attachmentType?: string) => {
  if (!selectedConversation || !socket) return;

  try {
    const messageData = {
      conversationId: selectedConversation.id,
      content,
      ...(attachments && { attachments }),
      ...(attachmentType && { attachmentType }),
    };

    const response = await api.post('/chat/messages', messageData);
    
    // Emit socket event
    socket.emit('sendMessage', response.data);
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};
```

### 5. UI Components to Add

#### File Attachment Button (in message input area)
```tsx
<button
  type="button"
  onClick={() => fileInputRef.current?.click()}
  disabled={uploadingFile}
  className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-full transition"
  title="Attach file"
>
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
  </svg>
</button>

<input
  ref={fileInputRef}
  type="file"
  onChange={handleFileSelect}
  accept="image/*,.pdf,.doc,.docx,.txt"
  className="hidden"
/>
```

#### File Preview (show before sending)
```tsx
{selectedFile && (
  <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
    <div className="flex items-center space-x-3 bg-white rounded-lg p-3 border border-gray-200">
      {filePreviewUrl ? (
        <img src={filePreviewUrl} alt="Preview" className="w-16 h-16 object-cover rounded" />
      ) : (
        <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
        <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
      </div>
      <button
        onClick={() => {
          setSelectedFile(null);
          setFilePreviewUrl(null);
        }}
        className="text-gray-400 hover:text-red-600"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
)}
```

#### Attachment Display in Messages
```tsx
{message.attachments && message.attachments.length > 0 && (
  <div className="mt-2">
    {message.attachmentType === 'image' ? (
      <img
        src={message.attachments[0]}
        alt="Attachment"
        className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition"
        onClick={() => window.open(message.attachments[0], '_blank')}
      />
    ) : (
      <a
        href={message.attachments[0]}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
      >
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <div>
          <p className="text-sm font-medium text-gray-900">
            {message.attachmentType === 'pdf' ? 'PDF Document' : 'Document'}
          </p>
          <p className="text-xs text-gray-500">Click to download</p>
        </div>
      </a>
    )}
  </div>
)}
```

## Files to Modify

1. **frontend/src/app/messaging/MessagingContent.tsx**
   - Add file state management
   - Add file selection handler
   - Update send message handler
   - Add file preview UI
   - Add attachment display in messages

2. **frontend/src/hooks/useChat.ts**
   - Update sendMessage function signature
   - Pass attachments to API

3. **frontend/src/app/messaging/ChatContent.tsx** (if exists)
   - Same changes as MessagingContent

## Testing Steps

1. Click attachment button
2. Select an image file
3. See preview appear
4. Send message
5. See image in message bubble
6. Click image to view full size
7. Try with PDF file
8. See download link
9. Click to download
10. Test on mobile

## Database Migration

Before deploying, run:
```sql
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachments text[];
ALTER TABLE messages ADD COLUMN IF NOT EXISTS "attachmentType" varchar(50);
```

## Deployment Checklist

- [ ] Run database migration
- [ ] Test file upload endpoint
- [ ] Test image attachments
- [ ] Test PDF attachments
- [ ] Test document attachments
- [ ] Test file size validation
- [ ] Test file type validation
- [ ] Test on mobile devices
- [ ] Test download functionality
- [ ] Test image viewing

## Security Notes

- File size limited to 10MB
- Only allowed file types accepted
- Files uploaded to secure storage
- URLs are publicly accessible (consider signed URLs for production)

## Future Enhancements

- Multiple file attachments
- Drag and drop
- Image compression
- Video support
- Voice messages
- File preview in-app
- Gallery view
