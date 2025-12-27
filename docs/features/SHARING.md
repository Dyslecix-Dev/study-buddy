# Sharing

Share folders, decks, exams with other users.

## Usage

**Send:**
```typescript
await fetch("/api/share/send", {
  method: "POST",
  body: JSON.stringify({
    contentType: "folder",  // or 'deck', 'exam'
    contentId: "folder-id",
    recipientEmail: "user@example.com"
  })
});
```

**Accept:**
```typescript
const requests = await fetch("/api/share/received");
await fetch(`/api/share/${requestId}/accept`, { method: "POST" });
```

## Features

Share folders/decks/exams, email notifications (Resend), copy-based, status tracking

## Schema

```prisma
model ShareRequest {
  id, senderId, recipientEmail, recipientId?, contentType, contentId,
  status @default("pending"), itemCount, createdAt, respondedAt?
}

model ShareNotification {
  id, userId, shareRequestId, type, title, message, read @default(false), createdAt
}
```

## API

- `POST /api/share/send`, `GET /api/share/received`, `GET /api/share/sent`
- `POST /api/share/:id/accept`, `POST /api/share/:id/reject`, `DELETE /api/share/:id`
- `GET /api/share/notifications`, `PATCH /api/share/notifications/:id/read`

## Implementation

```tsx
export function ShareButton({ folder }) {
  const [email, setEmail] = useState("");
  
  const handleShare = async () => {
    await fetch("/api/share/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentType: "folder", contentId: folder.id, recipientEmail: email })
    });
    toast.success("Share request sent!");
  };
  
  return (
    <div>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Button onClick={handleShare}>Share</Button>
    </div>
  );
}
```

## Email (Resend)

```typescript
// lib/email.ts
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendShareNotification({ to, senderName, contentName, shareUrl }) {
  await resend.emails.send({
    from: "Study Buddy <noreply@yourdomain.com>",
    to, subject: `${senderName} shared ${contentName} with you`,
    html: `<h1>${senderName} shared "${contentName}" with you</h1><a href="${shareUrl}">View Share Request</a>`
  });
}
```

`.env`: `RESEND_API_KEY=re_...`

## Security

✅ Only registered users ✅ Verify sender owns content ✅ Validate recipient ✅ Copy content ✅ Track actions ✅ Allow cancellation
