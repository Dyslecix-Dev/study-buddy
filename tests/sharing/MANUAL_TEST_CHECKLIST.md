# Manual Testing Checklist for Sharing Implementation

## Setup
- [ ] Ensure database is running with the sharing migration applied
- [ ] Have at least 2 test user accounts created
- [ ] Have test content (folders, decks, exams) created

## Test 1: Share a Folder
### Test Steps:
1. [ ] Login as User A
2. [ ] Navigate to `/notes`
3. [ ] Create a folder with 2-3 notes
4. [ ] Click the share button (should see Share2 icon)
5. [ ] Enter User B's email address
6. [ ] Click "Next"
7. [ ] Verify confirmation screen shows:
   - [ ] Folder name
   - [ ] Correct item count (e.g., "3 notes")
   - [ ] Recipient email
8. [ ] Click "Confirm & Share"
9. [ ] Verify success toast appears
10. [ ] Verify modal closes

### Verification (User B):
11. [ ] Login as User B
12. [ ] Check notification bell has unread badge
13. [ ] Click notification bell
14. [ ] See share request notification
15. [ ] Click "Go to Settings" or navigate to `/settings`
16. [ ] Go to "Sharing" tab
17. [ ] See pending share request in "Received" section
18. [ ] Click "Accept"
19. [ ] Navigate to `/notes`
20. [ ] Verify folder appears with "(from User A's email)" suffix
21. [ ] Verify all notes are copied correctly
22. [ ] Verify tags on notes are preserved

## Test 2: Share a Deck
### Test Steps:
1. [ ] Login as User A
2. [ ] Navigate to `/flashcards`
3. [ ] Create a deck with 5+ flashcards
4. [ ] Click the share button on the deck
5. [ ] Enter User B's email
6. [ ] Complete the share flow
7. [ ] Verify success

### Verification (User B):
8. [ ] Login as User B
9. [ ] Accept the share request from Settings
10. [ ] Navigate to `/flashcards`
11. [ ] Verify deck appears with sender attribution
12. [ ] Verify all flashcards are copied
13. [ ] Verify spaced repetition data is reset:
    - [ ] easeFactor = 2.5
    - [ ] interval = 0
    - [ ] repetitions = 0
    - [ ] nextReview = null
14. [ ] Verify tags on flashcards are preserved

## Test 3: Share an Exam
### Test Steps:
1. [ ] Login as User A
2. [ ] Navigate to `/exams`
3. [ ] Create an exam with 3+ questions
4. [ ] Click the share button on the exam
5. [ ] Enter User B's email
6. [ ] Complete the share flow

### Verification (User B):
7. [ ] Login as User B
8. [ ] Accept the share request
9. [ ] Navigate to `/exams`
10. [ ] Verify exam appears with sender attribution
11. [ ] Verify all questions are copied
12. [ ] Verify no attempt data is copied
13. [ ] Verify tags on questions are preserved

## Test 4: Multiple Recipients
### Test Steps:
1. [ ] Login as User A
2. [ ] Share a folder
3. [ ] Click "+ Add recipient"
4. [ ] Enter 2-3 different user emails
5. [ ] Complete share flow
6. [ ] Verify each recipient gets a share request

## Test 5: Reject Share Request
### Test Steps:
1. [ ] Login as User A, share content with User B
2. [ ] Login as User B
3. [ ] Go to Settings > Sharing
4. [ ] Click "Reject" on the pending share
5. [ ] Verify share request status changes to "Rejected"
6. [ ] Verify content is NOT copied
7. [ ] Login as User A
8. [ ] Check notification (should show rejection)

## Test 6: Cancel Pending Share
### Test Steps:
1. [ ] Login as User A, share content with User B
2. [ ] Before User B accepts, go to Settings > Sharing
3. [ ] Find the pending outgoing share
4. [ ] Click "Cancel"
5. [ ] Verify share request status changes to "Cancelled"
6. [ ] Login as User B
7. [ ] Verify share request no longer appears in pending

## Test 7: Error Handling
### Test Steps:
1. [ ] Try to share with non-existent email
   - [ ] Verify error toast: "User not found"
2. [ ] Try to share with your own email
   - [ ] Verify error toast: "Cannot share with yourself"
3. [ ] Try to share with invalid email format
   - [ ] Verify validation error
4. [ ] Try to submit share with empty email
   - [ ] Verify validation error

## Test 8: Notification System
### Test Steps:
1. [ ] Receive a share request
2. [ ] Verify notification bell badge shows count
3. [ ] Click notification bell
4. [ ] Verify dropdown shows notifications
5. [ ] Click a notification
6. [ ] Verify it navigates to Settings
7. [ ] Mark notification as read
8. [ ] Verify badge count decreases

## Test 9: Activity Logging
### Test Steps:
1. [ ] Share content
2. [ ] Check activity log (if visible)
3. [ ] Verify "Shared [type]" activity logged
4. [ ] Accept a share request
5. [ ] Verify "Received [type]" activity logged

## Test 10: Name Conflict Resolution
### Test Steps:
1. [ ] Create a folder named "Test Folder"
2. [ ] Share "Test Folder" from User A to User B
3. [ ] User B accepts
4. [ ] Share another "Test Folder" from User A to User B
5. [ ] User B accepts
6. [ ] Verify User B has:
   - [ ] "Test Folder (from userA@example.com)"
   - [ ] "Test Folder (from userA@example.com) - [UUID]"

## Test 11: UI/UX Checks
### Share Modal:
- [ ] Modal has proper spacing and styling
- [ ] Email inputs are clearly labeled
- [ ] "+ Add recipient" button works
- [ ] "Back" button returns to email input step
- [ ] "Cancel" closes modal
- [ ] Loading states show during API calls
- [ ] Success/error toasts are clear

### Notification Bell:
- [ ] Badge appears when unread notifications exist
- [ ] Badge count is accurate
- [ ] Dropdown shows recent notifications
- [ ] Notifications are clickable
- [ ] Auto-refreshes every 30 seconds (wait and verify)

### Settings - Sharing Tab:
- [ ] Pending incoming shares clearly displayed
- [ ] Pending outgoing shares clearly displayed
- [ ] Complete history is viewable
- [ ] Status badges use appropriate colors
- [ ] Timestamps show relative time
- [ ] Action buttons (Accept/Reject/Cancel) work
- [ ] Delete option removes from history

## Test 12: Cross-Browser Testing
- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on mobile viewport

## Performance Tests
- [ ] Share a folder with 100+ notes - verify it completes
- [ ] Share a deck with 500+ flashcards - verify it completes
- [ ] Have 50+ notifications - verify UI stays responsive

## Expected Results Summary
✅ All shares create proper database entries
✅ Content is deep-copied (not referenced)
✅ Sender attribution is added to names
✅ Tags are preserved across all content types
✅ Spaced repetition data is reset for flashcards
✅ Exam attempt data is NOT copied
✅ Notifications are created and delivered
✅ Activity is logged for both sender and recipient
✅ Error handling is graceful with helpful messages
✅ UI is responsive and intuitive
