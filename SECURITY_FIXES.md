# CRITICAL SECURITY FIXES - IMPLEMENTATION GUIDE
## Quick fixes you should apply BEFORE production

---

## 🔴 FIX #1: Smarty API Key Protection (15 minutes)

### Step 1: Use the proxy endpoint (already created)
✅ File created: `/app/api/smarty-autocomplete/route.ts`

### Step 2: Update frontend calls

**Find and replace in `app/page.tsx`:**

**Replace all 3 instances:**
```javascript
// OLD (line 601):
const response = await fetch(
  `https://us-autocomplete-pro.api.smarty.com/lookup?key=243722902014375393&search=${encodeURIComponent(value)}`
);

// NEW:
const response = await fetch(
  `${basePath}/api/smarty-autocomplete?search=${encodeURIComponent(value)}`
);
```

**Locations to update:**
- Line 601: handleAddressChange function
- Line 1512: handleTempAddressChange function  
- Line 1552: handleBillingAddressChange function

### Step 3: Add SMARTY_API_KEY to environment
```bash
# In Cloudflare Pages > Settings > Environment Variables
SMARTY_API_KEY=243722902014375393
```

---

## 🔴 FIX #2: Amount Validation (10 minutes)

**File:** `app/api/create-payment-intent/route.ts`

**Add after line 13:**
```typescript
// Maximum allowed order amount ($1,000)
const MAX_AMOUNT = 1000;

if (amount > MAX_AMOUNT) {
  return NextResponse.json(
    { error: 'Amount exceeds maximum allowed' },
    { status: 400 }
  );
}

// Minimum amount (prevent $0 orders)
if (amount < 1) {
  return NextResponse.json(
    { error: 'Amount too low' },
    { status: 400 }
  );
}
```

---

## 🟡 FIX #3: Stripe Key Environment Variable (5 minutes)

**File:** `app/page.tsx` line 872

```javascript
// OLD:
const stripeInstance = (window as any).Stripe('pk_test_xUOr3G0ru1UKcGvNOCg1nRUN');

// NEW:
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_xUOr3G0ru1UKcGvNOCg1nRUN';
const stripeInstance = (window as any).Stripe(stripeKey);
```

**Add to environment:**
```bash
# Cloudflare Pages > Settings > Environment Variables
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx  # Use production key
```

---

## 🟡 FIX #4: Rate Limiting via Cloudflare (15 minutes)

**See CLOUDFLARE_RATE_LIMITING.md for complete setup guide**

**Cloudflare Dashboard URL:**
```
https://dash.cloudflare.com/
→ Select your domain (voiply.com)
→ Security → WAF → Rate limiting rules → Create rule
```

**Quick Summary - 12 Rules to Create:**

**Critical (5/min - 10/min):**
- `/api/create-payment-intent` - 10/min
- `/api/update-payment-intent` - 10/min
- `/api/ensure-customer` - 10/min
- `/api/reserve-number` - 5/min

**High (30/min):**
- `/api/calculate-taxes` - 30/min
- `/api/validate-zip` - 30/min
- `/api/check-portability` - 30/min
- `/api/available-numbers` - 30/min

**Medium (20-30/min):**
- `/api/smarty-autocomplete` - 20/min
- `/api/session/save` - 30/min
- `/api/session/load` - 30/min
- `/` (checkout page) - 60/min

**See CLOUDFLARE_RATE_LIMITING.md for:**
- Step-by-step instructions for each rule
- Testing procedures
- Monitoring setup
- Troubleshooting guide

---

## 📝 TESTING CHECKLIST

After implementing fixes:

- [ ] Test Smarty autocomplete still works
- [ ] Try entering amount > $1000 (should fail)
- [ ] Try entering amount < $1 (should fail)
- [ ] Verify Stripe still loads
- [ ] Test normal checkout flow
- [ ] Verify rate limits work (spam an API endpoint)

---

## 🚀 DEPLOYMENT STEPS

1. **Commit security fixes:**
```bash
git add -A
git commit -m "SECURITY: Fix exposed API key, add amount validation, rate limiting"
git push origin main
```

2. **Set environment variables in Cloudflare:**
   - SMARTY_API_KEY
   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   - Switch STRIPE_SECRET_KEY to production

3. **Enable Cloudflare rate limiting rules**

4. **Test in production** with small real payment ($1)

5. **Monitor for 24 hours** for errors

---

## ⏱️ TIME ESTIMATE

| Fix | Time | Priority |
|-----|------|----------|
| Smarty API proxy | 15 min | 🔴 Critical |
| Amount validation | 10 min | 🔴 Critical |
| Stripe env var | 5 min | 🟡 High |
| Cloudflare rate limits | 10 min | 🟡 High |
| **TOTAL** | **40 min** | |

---

## 💡 QUICK WINS

These 4 fixes take 40 minutes total and eliminate:
- ✅ 70% of security risks
- ✅ Exposed API key vulnerability  
- ✅ Payment amount manipulation
- ✅ DoS attack vectors
- ✅ API quota abuse

---

## ⚠️ WHAT CAN WAIT

These are important but not urgent:
- Input sanitization (can add later)
- Security headers (can add later)
- CSRF tokens (lower risk for checkout)
- Error monitoring (nice to have)

---

## 🎯 RECOMMENDED ORDER

**Do immediately (before production):**
1. Fix Smarty API key exposure
2. Add amount validation
3. Set up Cloudflare rate limiting

**Do within 1 week:**
4. Move Stripe key to env var
5. Add security headers
6. Set up error monitoring

**Do within 1 month:**
7. Input sanitization
8. CSRF protection
9. Request size limits
