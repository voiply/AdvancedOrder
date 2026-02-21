# D1 Database Integration - Session Management

## Overview
The Voiply checkout application now includes D1 database integration to save and restore user sessions. This allows users to:
- Save their progress at any point in the checkout flow
- Return later and continue where they left off
- Share checkout links with pre-filled information
- Track session history and analytics

---

## 🗄️ Database Schema

### Tables

#### 1. **sessions** (Main session data)
Stores all checkout state including contact info, addresses, selections, and payment metadata.

**Key Fields:**
- `id` (TEXT, PRIMARY KEY) - Unique session identifier
- `created_at`, `updated_at`, `expires_at` (INTEGER) - Timestamps
- Contact: `first_name`, `last_name`, `email`, `mobile_number`
- Shipping: `address`, `address2`, `street`, `city`, `state`, `zip_code`
- Billing: `billing_*` fields with same structure
- Phone: `has_phone`, `phone_number`, `area_code`, `selected_new_number`
- Selections: `selected_plan`, `selected_bundle`, `own_device`, `protection_plan`
- Payment: `stripe_customer_id`, `payment_intent_id` (metadata only, NO card details)
- Progress: `current_step`, `completed`, `order_placed`

**Indexes:**
- `email` - Fast lookup of returning customers
- `created_at` - Cleanup of old sessions
- `expires_at` - Finding expired sessions
- `stripe_customer_id` - Link to Stripe records

#### 2. **session_events** (Audit trail)
Tracks all session events for analytics and debugging.

**Fields:**
- `id` (INTEGER, AUTO INCREMENT)
- `session_id` (TEXT) - Links to sessions table
- `event_type` (TEXT) - e.g., "session_saved", "session_loaded", "step_completed"
- `event_data` (TEXT) - JSON data for event details
- `created_at` (INTEGER) - Timestamp

---

## 🚀 Setup Instructions

### Step 1: Create D1 Database in Webflow Cloud

1. **Via Wrangler CLI (Recommended):**
   ```bash
   # Install Wrangler if not already installed
   npm install -g wrangler
   
   # Login to Cloudflare
   wrangler login
   
   # Create D1 database
   wrangler d1 create voiply-checkout-db
   ```

   **Output will show:**
   ```
   ✅ Successfully created DB 'voiply-checkout-db'
   
   [[d1_databases]]
   binding = "DB"
   database_name = "voiply-checkout-db"
   database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
   ```

2. **Copy the `database_id`** from the output

### Step 2: Update wrangler.json

Update `/wrangler.json` with your database ID:

```json
{
  "name": "voiply-checkout",
  "compatibility_date": "2024-01-01",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "voiply-checkout-db",
      "database_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    }
  ]
}
```

### Step 3: Initialize Database Schema

Run the schema creation script:

```bash
# From project root
wrangler d1 execute voiply-checkout-db --remote --file=./schema.sql
```

**Expected Output:**
```
🌀 Executing on remote database voiply-checkout-db (xxxxxxxx)
🌀 To execute on your local development database, pass the --local flag
✅ Executed successfully!
```

### Step 4: Verify Database Creation

```bash
# List tables
wrangler d1 execute voiply-checkout-db --remote --command "SELECT name FROM sqlite_master WHERE type='table';"
```

**Expected Output:**
```
┌─────────────────┐
│ name            │
├─────────────────┤
│ sessions        │
│ session_events  │
└─────────────────┘
```

### Step 5: Add D1 Binding in Webflow Cloud

In Webflow Cloud dashboard:
1. Go to your app settings
2. Navigate to "Environment Variables"
3. The D1 binding should appear automatically once `wrangler.json` is deployed

---

## 🔧 How It Works

### Session Flow

```
User Visits Page
       ↓
Check URL for ?session=xxx
       ↓
   ┌─────────────────┐
   │ Session Found?  │
   └────────┬────────┘
            │
    ┌───────┴───────┐
    │ YES           │ NO
    ↓               ↓
Load Session    Generate New ID
    ↓               ↓
Restore State   Add to URL
    ↓               ↓
Continue        Start Fresh
    
User Makes Changes
       ↓
Auto-save to D1
(on state change)
       ↓
Session Updated
```

### Session ID Format

```
sess_{timestamp}_{random}

Example: sess_1708123456789_a3b5c7d9e
```

### URL Structure

```
https://yoursite.com/home-phone-checkout?session=sess_1708123456789_a3b5c7d9e
```

### Auto-Save Triggers

Sessions are automatically saved when:
- ✅ User progresses to next step
- ✅ Contact information changes
- ✅ Address is updated
- ✅ Phone selection made
- ✅ Bundle or plan selected
- ✅ Protection plan toggled
- ✅ Payment information updated

**Debounce:** Sessions save on state change, not on every keystroke.

---

## 📡 API Endpoints

### 1. Save Session
**Endpoint:** `POST /api/session/save`

**Request Body:**
```json
{
  "sessionId": "sess_1708123456789_a3b5c7d9e",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "mobileNumber": "(412) 555-1234",
  "address": "123 Main St",
  "addressComponents": {
    "street": "123 Main St",
    "city": "Pittsburgh",
    "state": "PA",
    "zipCode": "15301"
  },
  "hasPhone": false,
  "selectedNewNumber": "(412) 555-9876",
  "selectedPlan": "annually",
  "selectedBundle": "att",
  "ownDevice": false,
  "protectionPlan": true,
  "protectionPlanTerm": "annually",
  "currentStep": 3
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "sess_1708123456789_a3b5c7d9e",
  "message": "Session updated"
}
```

### 2. Load Session
**Endpoint:** `GET /api/session/load?id={sessionId}`

**Response (Success):**
```json
{
  "success": true,
  "session": {
    "sessionId": "sess_1708123456789_a3b5c7d9e",
    "createdAt": 1708123456789,
    "updatedAt": 1708123556789,
    "expiresAt": 1710715456789,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "currentStep": 3,
    ...
  }
}
```

**Response (Not Found):**
```json
{
  "error": "Session not found"
}
```
Status: 404

**Response (Expired):**
```json
{
  "error": "Session expired"
}
```
Status: 410

---

## 🎯 Use Cases

### 1. **Continue Later**
User starts checkout → Gets distracted → Returns later with same link → Continues from where they left off

### 2. **Share Checkout**
Sales rep fills in customer info → Generates session URL → Sends to customer → Customer completes payment

### 3. **Mobile to Desktop**
User starts on mobile → Continues on desktop → Same session, all data preserved

### 4. **Analytics & Recovery**
Track abandoned carts, session duration, step completion rates, and send recovery emails

---

## 🛡️ Security & Privacy

### What's Stored:
- ✅ Contact information (name, email, phone)
- ✅ Addresses (shipping, billing)
- ✅ Product selections
- ✅ Stripe customer ID (for reference only)
- ✅ Stripe payment intent ID (for tracking only)

### What's NOT Stored:
- ❌ Credit card numbers
- ❌ CVV codes
- ❌ Bank account details
- ❌ Passwords
- ❌ Social Security Numbers

### Session Expiration:
- **Default:** 30 days
- **Cleanup:** Expired sessions can be purged periodically
- **Active Sessions:** Updated on every save

### Privacy Compliance:
- Sessions contain PII and should be protected
- Implement proper access controls
- Consider GDPR/CCPA compliance for data retention
- Provide mechanism for users to delete their sessions

---

## 🔍 Testing

### Test Session Creation
```bash
# Visit the checkout page
# Open browser console
# Check URL for ?session=xxx parameter
# Verify in D1 database:
wrangler d1 execute voiply-checkout-db --remote --command "SELECT id, email, current_step FROM sessions ORDER BY created_at DESC LIMIT 5;"
```

### Test Session Loading
1. Complete part of checkout
2. Copy URL with session ID
3. Open in incognito/new browser
4. Verify all fields pre-filled
5. Check console for "Session loaded: sess_xxx"

### Test Auto-Save
1. Fill in contact info
2. Wait 1 second (debounce)
3. Check D1 database for updated record
4. Verify `updated_at` timestamp changed

---

## 📊 Analytics Queries

### Session Completion Rate
```sql
SELECT 
  COUNT(*) as total_sessions,
  SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed,
  ROUND(100.0 * SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) / COUNT(*), 2) as completion_rate
FROM sessions
WHERE created_at > strftime('%s', 'now', '-7 days') * 1000;
```

### Step Drop-off Analysis
```sql
SELECT 
  current_step,
  COUNT(*) as sessions_at_step,
  SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed_from_step
FROM sessions
WHERE created_at > strftime('%s', 'now', '-30 days') * 1000
GROUP BY current_step
ORDER BY current_step;
```

### Popular Bundles
```sql
SELECT 
  selected_bundle,
  COUNT(*) as selections,
  ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM sessions WHERE selected_bundle IS NOT NULL), 2) as percentage
FROM sessions
WHERE selected_bundle IS NOT NULL
  AND created_at > strftime('%s', 'now', '-30 days') * 1000
GROUP BY selected_bundle
ORDER BY selections DESC;
```

### Returning Customers
```sql
SELECT 
  email,
  COUNT(*) as session_count,
  MIN(created_at) as first_visit,
  MAX(created_at) as last_visit
FROM sessions
WHERE email IS NOT NULL
GROUP BY email
HAVING COUNT(*) > 1
ORDER BY session_count DESC;
```

---

## 🧹 Maintenance

### Clean Up Expired Sessions
```bash
# Delete sessions older than 30 days
wrangler d1 execute voiply-checkout-db --remote --command "DELETE FROM sessions WHERE expires_at < strftime('%s', 'now') * 1000;"

# Delete associated events
wrangler d1 execute voiply-checkout-db --remote --command "DELETE FROM session_events WHERE session_id NOT IN (SELECT id FROM sessions);"
```

### Optimize Database
```bash
wrangler d1 execute voiply-checkout-db --remote --command "VACUUM;"
```

---

## 🐛 Troubleshooting

### Issue: "Database not configured"
**Solution:** Verify `wrangler.json` has correct D1 binding and database_id

### Issue: Sessions not saving
**Solution:** 
1. Check browser console for errors
2. Verify D1 database exists: `wrangler d1 list`
3. Test API endpoint directly: `curl -X POST https://your-site.com/api/session/save -d '{"sessionId":"test"}'`

### Issue: Session not loading
**Solution:**
1. Verify session ID in URL is correct
2. Check if session expired: `wrangler d1 execute voiply-checkout-db --remote --command "SELECT expires_at FROM sessions WHERE id='sess_xxx';"`
3. Confirm session exists in database

### Issue: "Session expired" even though it's recent
**Solution:** Check `expires_at` timestamp. Default is 30 days. Adjust in `/api/session/save/route.ts` if needed.

---

## 🎨 Customization

### Change Session Expiration
In `/app/api/session/save/route.ts`:

```typescript
// Change from 30 days to 7 days
const expiresAt = now + (7 * 24 * 60 * 60 * 1000);
```

### Add Custom Fields
1. Add columns to `schema.sql`
2. Update save API to include new fields
3. Update load API to return new fields
4. Update frontend to send/receive new fields

### Add Session Events
In your code, log custom events:

```typescript
await db
  .prepare('INSERT INTO session_events (session_id, event_type, event_data, created_at) VALUES (?, ?, ?, ?)')
  .bind(sessionId, 'bundle_selected', JSON.stringify({ bundle: 'att' }), Date.now())
  .run();
```

---

## 📝 Files Modified/Created

### New Files:
- ✅ `/schema.sql` - D1 database schema
- ✅ `/wrangler.json` - D1 binding configuration
- ✅ `/app/api/session/save/route.ts` - Save session API
- ✅ `/app/api/session/load/route.ts` - Load session API

### Modified Files:
- ✅ `/app/page.tsx` - Added session state, load, save, and URL management

---

## 🚀 Deployment Checklist

- [ ] Create D1 database: `wrangler d1 create voiply-checkout-db`
- [ ] Update `wrangler.json` with database_id
- [ ] Run schema: `wrangler d1 execute voiply-checkout-db --remote --file=./schema.sql`
- [ ] Verify tables created
- [ ] Deploy to Webflow Cloud
- [ ] Test session creation
- [ ] Test session loading
- [ ] Test auto-save functionality
- [ ] Set up periodic cleanup job

---

## 🎉 Benefits

✅ **User Experience**
- Save progress automatically
- Return anytime without losing data
- Share pre-filled checkout links

✅ **Business Value**
- Reduce abandoned carts
- Track conversion funnel
- Analyze customer behavior
- Enable sales team workflows

✅ **Technical**
- Serverless and scalable
- Fast read/write with D1
- Edge computing benefits
- No additional infrastructure

---

## 📚 Additional Resources

- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Wrangler CLI Guide](https://developers.cloudflare.com/workers/wrangler/)
- [D1 SQL Reference](https://developers.cloudflare.com/d1/platform/sql-reference/)

---

**Session Management: READY FOR DEPLOYMENT** ✅
