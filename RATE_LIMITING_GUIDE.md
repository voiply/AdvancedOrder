# RATE LIMITING: KV vs Cloudflare WAF
## Which approach should you use?

---

## 🐛 THE PROBLEM

**Original implementation was BROKEN:**
```javascript
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
```

**Why it doesn't work:**
- ❌ Cloudflare Workers recreate on every request
- ❌ In-memory Map is lost between requests
- ❌ Rate limiting state never persists
- ❌ Each request thinks it's the first request
- ❌ Rate limiting is completely ineffective!

---

## ✅ TWO SOLUTIONS

### **Option 1: Cloudflare WAF Rate Limiting** (RECOMMENDED)

**Setup:** Cloudflare Dashboard > Security > WAF > Rate Limiting Rules

**Pros:**
- ✅ **FREE** (included in all plans)
- ✅ No code changes needed
- ✅ Works at edge (before hitting your app)
- ✅ More efficient (less compute)
- ✅ UI-based configuration (easy to adjust)
- ✅ Better DDoS protection
- ✅ No KV costs

**Cons:**
- ⚠️ Requires manual setup in dashboard
- ⚠️ Not visible in code

**Cost:** $0/month

**Configuration:**
```
Rule Name: Smarty Autocomplete Rate Limit
Expression: http.request.uri.path eq "/api/smarty-autocomplete"
Rate: 20 requests per 1 minute
Characteristic: IP Address
Action: Block (429 status)
```

---

### **Option 2: KV-Based Rate Limiting**

**Setup:** Code-based using Cloudflare KV

**Pros:**
- ✅ Visible in code (version controlled)
- ✅ Customizable per-endpoint logic
- ✅ Can implement complex rules
- ✅ Works in development/testing

**Cons:**
- ❌ **COSTS MONEY** ($0.50 per million reads)
- ❌ More code to maintain
- ❌ Slower than WAF (app-level vs edge)
- ❌ Uses compute time
- ❌ Requires KV namespace setup

**Cost Estimate:**
- 10,000 autocomplete requests/month
- 20,000 KV reads (check + update per request)
- Cost: **$0.01/month** (negligible but not free)

**Code:** See `OPTION_KV_RATE_LIMIT.ts` for implementation

---

## 📊 COMPARISON

| Feature | Cloudflare WAF | KV-Based |
|---------|---------------|----------|
| **Cost** | FREE ✅ | ~$0.01/month |
| **Speed** | Edge (fastest) ✅ | App-level |
| **Setup** | Dashboard only | Code + KV namespace |
| **Maintenance** | Zero | Medium |
| **DDoS Protection** | Excellent ✅ | Basic |
| **Flexibility** | Low | High ✅ |
| **Version Control** | No | Yes ✅ |
| **Development Testing** | Hard | Easy ✅ |

---

## 🎯 RECOMMENDATION

**Use Cloudflare WAF Rate Limiting** because:

1. **Free** - No KV costs
2. **Faster** - Blocks at edge before hitting your app
3. **Less Code** - No maintenance burden
4. **Better Protection** - Purpose-built for rate limiting
5. **Easy to Adjust** - Change limits in dashboard without code deploy

**When to use KV instead:**
- Complex rate limiting logic (different limits per user tier)
- Need rate limiting in development
- Want rate limits version-controlled
- Building custom abuse detection

**For your use case:** WAF is perfect ✅

---

## 🛠️ SETUP INSTRUCTIONS

### **Cloudflare WAF Rate Limiting (Recommended)**

**Step 1: Open Cloudflare Dashboard**
```
1. Go to Cloudflare Dashboard
2. Select your domain (voiply.com)
3. Click "Security" in left sidebar
4. Click "WAF"
5. Click "Rate limiting rules" tab
```

**Step 2: Create Rule**
```
Click "Create rule"

Rule name: Smarty Autocomplete Rate Limit

When incoming requests match:
  Field: URI Path
  Operator: equals
  Value: /api/smarty-autocomplete

Then:
  Choose action: Block
  With response code: 429 (Too Many Requests)

Characteristics:
  ✓ IP Address

Rate:
  Requests: 20
  Period: 1 minute

Save
```

**Step 3: Create Additional Rules (Recommended)**
```
Rule: Payment Intent Rate Limit
Path: /api/create-payment-intent
Rate: 10 requests per 1 minute

Rule: Tax Calculation Rate Limit
Path: /api/calculate-taxes
Rate: 30 requests per 1 minute

Rule: ZIP Validation Rate Limit
Path: /api/validate-zip
Rate: 30 requests per 1 minute
```

**Step 4: Test**
```bash
# Spam the endpoint 25 times
for i in {1..25}; do
  curl "https://www.voiply.com/api/smarty-autocomplete?search=test"
done

# Should see 429 errors after request #20
```

---

### **KV-Based Rate Limiting (Alternative)**

**If you still want to use KV:**

**Step 1: Create KV Namespace**
```bash
# In Cloudflare Dashboard
Workers & Pages > KV > Create namespace

Name: voiply-checkout-ratelimit
```

**Step 2: Update wrangler.json**
```json
{
  "name": "voiply-checkout",
  "kv_namespaces": [
    {
      "binding": "KV",
      "id": "YOUR_KV_NAMESPACE_ID",
      "preview_id": "YOUR_PREVIEW_KV_ID"
    }
  ]
}
```

**Step 3: Replace route.ts**
```bash
# Copy OPTION_KV_RATE_LIMIT.ts to:
cp OPTION_KV_RATE_LIMIT.ts app/api/smarty-autocomplete/route.ts
```

**Step 4: Deploy**
```bash
git add -A
git commit -m "Add KV-based rate limiting"
git push origin main
```

---

## 💰 COST ANALYSIS

### **Cloudflare WAF**
```
Cost: $0/month (included in all plans)
Requests blocked: Unlimited
Maintenance: None
```

### **KV-Based**
```
Assumptions:
- 10,000 autocomplete requests/month
- 2 KV operations per request (read + write)
- 20,000 KV operations/month

KV Pricing:
- Reads: $0.50 per million = $0.01/month
- Writes: $5.00 per million = $0.10/month
- Storage: $0.50 per GB = negligible

Total: ~$0.11/month (almost free, but not zero)
```

**Verdict:** WAF is free, KV costs ~$1.32/year (negligible)

---

## 🔍 CACHING (SEPARATE TOPIC)

**Current Implementation: HTTP Cache-Control Headers**

```javascript
headers: {
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
}
```

**This is CORRECT and does NOT need KV because:**
- ✅ Uses Cloudflare's HTTP cache (free)
- ✅ Automatic edge caching
- ✅ Perfect for API responses
- ✅ No code needed

**When to use KV for caching:**
- Custom cache invalidation logic
- Complex cache keys
- Need to store non-HTTP data
- Want programmatic cache control

**For your autocomplete:** HTTP cache is perfect ✅

---

## 📋 WHAT WAS CHANGED

**Removed from `/api/smarty-autocomplete/route.ts`:**
```javascript
// ❌ REMOVED (broken in Cloudflare Workers)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  // This never worked in production!
}
```

**Replaced with:**
```javascript
// ✅ ADDED (comment to set up WAF)
// NOTE: Rate limiting handled by Cloudflare WAF Rate Limiting Rules
// See SECURITY_FIXES.md for setup instructions
```

**Why:**
- In-memory Map doesn't persist in Cloudflare Workers
- WAF is better, faster, and free
- Less code to maintain
- Industry standard approach

---

## ✅ RECOMMENDATION SUMMARY

**For Voiply Checkout:**

1. **Rate Limiting:** Use Cloudflare WAF ✅
   - Free, fast, effective
   - Set up in dashboard (10 minutes)
   - No code changes needed

2. **Caching:** Keep HTTP Cache-Control headers ✅
   - Already implemented
   - Works perfectly
   - No KV needed

3. **KV Namespace:** Not needed for this app ✅
   - Save it for future features
   - No ongoing costs
   - Less complexity

---

## 🚀 ACTION ITEMS

**Do This Now:**
1. [ ] Set up Cloudflare WAF rate limiting rules (10 min)
2. [ ] Test by spamming endpoint
3. [ ] Verify 429 errors after limit

**Don't Do:**
- ❌ Don't set up KV namespace (not needed)
- ❌ Don't use code-based rate limiting (WAF is better)
- ❌ Don't worry about HTTP caching (already works)

---

## 📚 ADDITIONAL RESOURCES

- [Cloudflare WAF Rate Limiting Docs](https://developers.cloudflare.com/waf/rate-limiting-rules/)
- [Cloudflare KV Docs](https://developers.cloudflare.com/kv/)
- [HTTP Caching Best Practices](https://web.dev/http-cache/)

---

**Last Updated:** February 18, 2026  
**Status:** WAF rate limiting recommended and documented
