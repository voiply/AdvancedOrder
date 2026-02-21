# SECURITY AUDIT & RECOMMENDATIONS
## HomeOrder Checkout Application

Generated: February 18, 2026

---

## 🚨 CRITICAL ISSUES (Fix Before Production)

### 1. ⚠️ EXPOSED SMARTY STREETS API KEY (HIGH)
**Location:** `app/page.tsx` lines 601, 1512, 1552

**Issue:**
```javascript
// Hardcoded API key visible in frontend
const url = `https://us-autocomplete-pro.api.smarty.com/lookup?key=243722902014375393&search=${search}`;
```

**Risk:**
- Anyone can view source and steal your API key
- Unlimited usage on your account
- Potential bill shock if abused
- API key can't be rotated without code change

**Fix:**
✅ Created `/app/api/smarty-autocomplete/route.ts` proxy endpoint
- Move API key to environment variable
- Add rate limiting (20 requests/minute per IP)
- Update frontend to call `/api/smarty-autocomplete?search=...`

**Action Required:**
```javascript
// In app/page.tsx, replace all Smarty API calls with:
const response = await fetch(`${basePath}/api/smarty-autocomplete?search=${encodeURIComponent(value)}`);
```

---

### 2. ⚠️ NO AMOUNT VALIDATION (HIGH)

**Location:** `app/api/create-payment-intent/route.ts`

**Issue:**
```javascript
// Only checks amount > 0, no maximum
if (!amount || amount <= 0) {
  return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
}
```

**Risk:**
- Attacker could modify frontend to charge $999,999
- No sanity check on payment amounts
- Potential fraud or mistakes

**Fix:**
```javascript
// Add reasonable maximum based on your highest product
const MAX_AMOUNT = 1000; // $1,000 max order

if (!amount || amount <= 0) {
  return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
}

if (amount > MAX_AMOUNT) {
  return NextResponse.json(
    { error: 'Amount exceeds maximum allowed' },
    { status: 400 }
  );
}

// Validate amount matches expected calculation
// This prevents frontend manipulation
const expectedAmount = calculateExpectedAmount(plan, hardware, etc...);
if (Math.abs(amount - expectedAmount) > 0.01) {
  return NextResponse.json(
    { error: 'Invalid amount calculation' },
    { status: 400 }
  );
}
```

---

### 3. ⚠️ NO RATE LIMITING ON API ENDPOINTS (MEDIUM)

**Issue:**
- No rate limits on sensitive endpoints
- Attacker can spam:
  - Payment intent creation
  - Tax calculations
  - Phone number searches
  - ZIP validations

**Risk:**
- DoS attacks
- API quota exhaustion (CSI, Stripe)
- Cost explosion

**Fix Options:**

**Option A: Cloudflare Rate Limiting (Recommended)**
```typescript
// In wrangler.toml or Cloudflare dashboard
// Set rate limits:
// - 10 requests/minute for /api/create-payment-intent
// - 30 requests/minute for /api/calculate-taxes
// - 20 requests/minute for /api/smarty-autocomplete
```

**Option B: Application-Level Rate Limiting**
```typescript
// Install: npm install rate-limiter-flexible

import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
  points: 10, // 10 requests
  duration: 60, // per 60 seconds
});

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  try {
    await rateLimiter.consume(ip);
  } catch {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  
  // Continue with request...
}
```

---

### 4. ⚠️ STRIPE PUBLISHABLE KEY HARDCODED (LOW)

**Location:** `app/page.tsx` line 872

**Issue:**
```javascript
const stripeInstance = (window as any).Stripe('pk_test_xUOr3G0ru1UKcGvNOCg1nRUN');
```

**Risk:**
- Low risk (pk_ keys are meant to be public)
- BUT: Can't switch between test/production without code change
- No flexibility for different environments

**Fix:**
```javascript
// Use environment variable
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_...';
const stripeInstance = (window as any).Stripe(stripeKey);
```

---

## ⚠️ IMPORTANT ISSUES (Fix Soon)

### 5. NO INPUT SANITIZATION

**Locations:**
- Email inputs (potential XSS)
- Address fields (potential injection)
- Phone numbers (format validation only)

**Fix:**
```typescript
// Install: npm install dompurify validator

import DOMPurify from 'dompurify';
import validator from 'validator';

// Sanitize all user inputs
const sanitizedEmail = validator.normalizeEmail(email);
const sanitizedName = DOMPurify.sanitize(name);
const sanitizedAddress = DOMPurify.sanitize(address);

// Validate formats
if (!validator.isEmail(sanitizedEmail)) {
  return { error: 'Invalid email' };
}
```

---

### 6. MISSING SECURITY HEADERS

**Issue:** No Content Security Policy, XSS protection headers

**Fix:** Add to `next.config.js`:
```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.stripe.com https://us-autocomplete-pro.api.smarty.com https://tcw.csilongwood.com;"
          }
        ]
      }
    ]
  }
}
```

---

### 7. NO CSRF PROTECTION

**Issue:** API endpoints don't verify request origin

**Fix:** Add origin check to sensitive endpoints
```typescript
export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    'https://www.voiply.com',
    'https://voiply.com'
  ];
  
  if (!origin || !allowedOrigins.includes(origin)) {
    return NextResponse.json(
      { error: 'Invalid origin' },
      { status: 403 }
    );
  }
  
  // Continue...
}
```

---

### 8. MISSING ERROR LOGGING & MONITORING

**Issue:** Errors logged to console only

**Fix:** Add Sentry or similar
```typescript
// Install: npm install @sentry/nextjs

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});

// In API routes:
catch (error) {
  Sentry.captureException(error);
  console.error('Error:', error);
}
```

---

### 9. NO REQUEST SIZE LIMITS

**Issue:** Could send massive payloads to crash server

**Fix:** In `next.config.js`:
```javascript
const nextConfig = {
  api: {
    bodyParser: {
      sizeLimit: '1mb'
    }
  }
}
```

---

### 10. SESSION STORAGE SECURITY

**Location:** `app/api/session/save/route.ts`

**Issue:** No encryption, no expiry validation

**Recommendations:**
- Encrypt session data before storing
- Add expiry timestamps
- Validate session age on load
- Use HttpOnly cookies instead of localStorage if possible

---

## 📋 SECURITY CHECKLIST BEFORE PRODUCTION

### Immediate (Do Now):
- [ ] Fix exposed Smarty API key (use proxy endpoint)
- [ ] Add amount validation ($0-$1000 range)
- [ ] Move Stripe key to environment variable
- [ ] Add .env to .gitignore (already done ✅)
- [ ] Test with production API keys

### High Priority (This Week):
- [ ] Implement rate limiting on all API endpoints
- [ ] Add input sanitization (emails, addresses, names)
- [ ] Add security headers (CSP, X-Frame-Options)
- [ ] Set up error monitoring (Sentry)
- [ ] Add CSRF protection (origin validation)

### Medium Priority (This Month):
- [ ] Add request size limits
- [ ] Encrypt session storage
- [ ] Add API request logging
- [ ] Set up alerts for suspicious activity
- [ ] Regular security audits

### Best Practices:
- [ ] Never commit .env files (already done ✅)
- [ ] Rotate API keys regularly
- [ ] Use environment variables for all secrets
- [ ] Keep dependencies updated (npm audit)
- [ ] Run security scans before deployment
- [ ] Enable Cloudflare DDoS protection
- [ ] Use HTTPS everywhere (enforce)
- [ ] Set up Web Application Firewall (WAF)

---

## 🔐 ENVIRONMENT VARIABLES NEEDED

Create `.env` file (NEVER commit to git):
```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx

# Smarty Streets
SMARTY_API_KEY=xxxxx

# CSI Tax API
CSI=xxxxx

# HubSpot
HUBSPOT_TRACKING_CODE=xxxxx

# Sentry (optional)
SENTRY_DSN=xxxxx

# Environment
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://www.voiply.com
```

---

## 🚀 DEPLOYMENT SECURITY

### Before Pushing:
1. Switch all API keys to production keys
2. Test with small real payment ($1)
3. Enable Stripe fraud detection
4. Set up Cloudflare rate limiting
5. Enable bot protection
6. Review Stripe webhooks for security
7. Set up monitoring alerts

### After Deploying:
1. Monitor error logs for 24 hours
2. Check for unusual API usage
3. Test all payment flows
4. Verify rate limits working
5. Check CSP headers loading correctly
6. Test on mobile devices

---

## 📊 RISK ASSESSMENT

| Issue | Risk Level | Impact | Effort to Fix | Priority |
|-------|-----------|---------|---------------|----------|
| Exposed Smarty Key | HIGH | High bill, quota loss | 1 hour | 🔴 Critical |
| No amount validation | HIGH | Fraud, wrong charges | 30 min | 🔴 Critical |
| No rate limiting | MEDIUM | DoS, cost spike | 2 hours | 🟡 High |
| Hardcoded Stripe key | LOW | Environment flexibility | 15 min | 🟢 Medium |
| No input sanitization | MEDIUM | XSS, injection | 1 hour | 🟡 High |
| Missing headers | MEDIUM | XSS, clickjacking | 30 min | 🟡 High |
| No CSRF protection | MEDIUM | Unauthorized requests | 1 hour | 🟡 High |
| No error monitoring | LOW | Blind to issues | 1 hour | 🟢 Medium |

---

## 💰 COST IMPLICATIONS

**If Smarty Key Stolen:**
- Free tier: 250 lookups/month
- After: $0.60 per 1,000 lookups
- Worst case: 100,000 lookups = $60/month

**If Rate Limiting Missing:**
- CSI API: Pay per call
- Stripe API: Free but quota limits
- Could spike costs significantly

**Fix Cost:**
- Total effort: 6-8 hours
- No additional services needed
- Use existing Cloudflare for rate limiting

---

## ✅ GOOD SECURITY PRACTICES ALREADY IN PLACE

- ✅ .env in .gitignore
- ✅ Using environment variables for secrets (CSI, Stripe)
- ✅ Stripe Elements for card entry (PCI compliant)
- ✅ HTTPS enforced
- ✅ Server-side API calls (secrets not exposed)
- ✅ Input validation on critical fields
- ✅ Error handling in API routes

---

## 📚 ADDITIONAL RESOURCES

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/advanced-features/security-headers)
- [Stripe Security Guide](https://stripe.com/docs/security/guide)
- [Cloudflare Rate Limiting](https://developers.cloudflare.com/waf/rate-limiting-rules/)

---

**Last Updated:** February 18, 2026  
**Next Review:** Before production deployment
