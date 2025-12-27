# Content Sharing System

Collaborative sharing of notes, flashcard decks, and exams.

## Quick Start

### Sharing Content

```typescript
// User clicks "Share" button on a folder/deck/exam
await fetch("/api/share/send", {
  method: "POST",
  body: JSON.stringify({
    contentType: "folder",      // or 'deck', 'exam'
    contentId: "folder-id",
    recipientEmail: "user@example.com",
  }),
});

// Creates ShareRequest with status 'pending'
// Sends email notification to recipient
```

### Accepting Shares

```typescript
// Recipient views share request
const requests = await fetch("/api/share/received");

// Accept share
await fetch(`/api/share/${requestId}/accept`, { method: "POST" });

// Creates copy of content for recipient
// Updates ShareRequest status to 'accepted'
```

## Features

- **Share folders** - All notes within folder
- **Share decks** - All flashcards in deck
- **Share exams** - All questions in exam
- **Email notifications** - Via Resend
- **Status tracking** - Pending, accepted, rejected
- **Copy-based** - Recipient gets their own copy

## Database Models

```prisma
model ShareRequest {
  id             String    @id
  senderId       String
  recipientEmail String
  recipientId    String?
  contentType    String    // 'folder', 'deck', 'exam'
  contentId      String
  contentName    String
  status         String    @default("pending")
  itemCount      Int
  createdAt      DateTime
  respondedAt    DateTime?
  // ...
}

model ShareNotification {
  id             String   @id
  userId         String
  shareRequestId String
  type           String   // 'incoming_share', 'share_accepted', etc.
  title          String
  message        String
  read           Boolean  @default(false)
  createdAt      DateTime
  // ...
}
```

## API Endpoints

**POST `/api/share/send`** - Send share request
```json
{
  "contentType": "folder",
  "contentId": "folder-id",
  "recipientEmail": "user@example.com"
}
```

**GET `/api/share/received`** - Get incoming requests

**GET `/api/share/sent`** - Get outgoing requests

**POST `/api/share/:id/accept`** - Accept request

**POST `/api/share/:id/reject`** - Reject request

**DELETE `/api/share/:id`** - Cancel sent request

**GET `/api/share/notifications`** - Get notifications

**PATCH `/api/share/notifications/:id/read`** - Mark as read

## Implementation Example

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ShareButton({ folder }: { folder: Folder }) {
  const [email, setEmail] = useState("");
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (!email) return;

    setIsSharing(true);
    try {
      const response = await fetch("/api/share/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: "folder",
          contentId: folder.id,
          recipientEmail: email,
        }),
      });

      if (!response.ok) throw new Error();

      toast.success("Share request sent!");
      setEmail("");
    } catch (error) {
      toast.error("Failed to send share request");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div>
      <input
        type="email"
        placeholder="user@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button onClick={handleShare} disabled={isSharing}>
        {isSharing ? "Sharing..." : "Share"}
      </Button>
    </div>
  );
}
```

## Email Notifications

Using Resend:

```typescript
// lib/email.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendShareNotification({
  to,
  senderName,
  contentType,
  contentName,
  shareUrl,
}: {
  to: string;
  senderName: string;
  contentType: string;
  contentName: string;
  shareUrl: string;
}) {
  await resend.emails.send({
    from: "Study Buddy <noreply@yourdomain.com>",
    to,
    subject: `${senderName} shared ${contentType} with you`,
    html: `
      <h1>${senderName} shared "${contentName}" with you</h1>
      <p>Click the link below to view and accept:</p>
      <a href="${shareUrl}">View Share Request</a>
    `,
  });
}
```

Configure in `.env`:
```bash
RESEND_API_KEY=re_...
```

## Notifications UI

```tsx
export function ShareNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetch("/api/share/notifications")
      .then(res => res.json())
      .then(data => setNotifications(data.notifications));
  }, []);

  const markAsRead = async (id: string) => {
    await fetch(`/api/share/notifications/${id}/read`, {
      method: "PATCH",
    });
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  return (
    <div>
      {notifications.filter(n => !n.read).map(notification => (
        <div key={notification.id} onClick={() => markAsRead(notification.id)}>
          <strong>{notification.title}</strong>
          <p>{notification.message}</p>
        </div>
      ))}
    </div>
  );
}
```

## Security Considerations

- ✅ Only share with registered users
- ✅ Verify sender owns content
- ✅ Validate recipient email
- ✅ Copy content (don't share original)
- ✅ Track all share actions
- ✅ Allow cancellation before acceptance

## Related Files

- `app/api/share/*` - API routes
- `lib/share-utils.ts` - Helper functions
- `components/share/*` - UI components

**Last Updated:** December 2024
