# CLOUDFLARE RATE LIMITING SETUP
## Complete Implementation Guide for Voiply Checkout

---

## 🔗 CLOUDFLARE DASHBOARD URL

**Direct Link to Rate Limiting Setup:**
```
https://dash.cloudflare.com/
→ Select Account
→ Select Domain: voiply.com
→ Click "Security" (left sidebar)
→ Click "WAF" 
→ Click "Rate limiting rules" tab
→ Click "Create rule" button
```

**Or use direct URL pattern:**
```
https://dash.cloudflare.com/{account_id}/{zone_id}/security/waf/rate-limiting-rules
```

---

## 📋 ENDPOINTS REQUIRING RATE LIMITING

### **CRITICAL - Strict Limits (Payment & Phone Numbers)**

These endpoints cost money or process payments:

| Endpoint | Limit | Why | Third-Party API |
|----------|-------|-----|----------------|
| `/api/create-payment-intent` | 10/min | Creates Stripe payment | Stripe |
| `/api/update-payment-intent` | 10/min | Updates payment amount | Stripe |
| `/api/ensure-customer` | 10/min | Creates/updates Stripe customer | Stripe |
| `/api/reserve-number` | 5/min | Reserves phone number (costs money) | Telnyx |

---

### **HIGH - Moderate Limits (External API Calls)**

These endpoints call third-party APIs:

| Endpoint | Limit | Why | Third-Party API |
|----------|-------|-----|----------------|
| `/api/calculate-taxes` | 30/min | Calculates tax via CSI | CSI Tax API |
| `/api/validate-zip` | 30/min | Validates ZIP via CSI | CSI Tax API |
| `/api/check-portability` | 30/min | Checks if number can port | Telnyx |
| `/api/available-numbers` | 30/min | Searches available numbers | Telnyx |

---

### **MEDIUM - Relaxed Limits (User Interaction)**

These endpoints are user-triggered but should be limited:

| Endpoint | Limit | Why | Third-Party API |
|----------|-------|-----|----------------|
| `/api/smarty-autocomplete` | 20/min | Address autocomplete | Smarty Streets |
| `/api/session/save` | 30/min | Saves checkout session | D1 Database |
| `/api/session/load` | 30/min | Loads checkout session | D1 Database |

---

### **MAIN CHECKOUT PAGE**

| Page | Limit | Why |
|------|-------|-----|
| `/` (homepage/checkout) | 60/min | Prevent scraping, allow normal browsing |

---

## 🛠️ CLOUDFLARE WAF SETUP (15 minutes)

### **Rule 1: Payment Intent Creation** 🔴 CRITICAL

```
Rule name: Payment Intent Rate Limit

When incoming requests match:
  Field: URI Path
  Operator: equals
  Value: /api/create-payment-intent

Then:
  Choose action: Block
  With response code: 429 Too Many Requests
  With response: Rate limit exceeded

Characteristics:
  ✓ IP Address

Rate:
  Requests: 10
  Period: 1 minute
  
Counting expression:
  (leave default)

Save
```

---

### **Rule 2: Payment Intent Update** 🔴 CRITICAL

```
Rule name: Payment Update Rate Limit

When incoming requests match:
  Field: URI Path
  Operator: equals
  Value: /api/update-payment-intent

Then:
  Choose action: Block
  With response code: 429

Characteristics:
  ✓ IP Address

Rate:
  Requests: 10
  Period: 1 minute

Save
```

---

### **Rule 3: Customer Creation** 🔴 CRITICAL

```
Rule name: Customer Creation Rate Limit

When incoming requests match:
  Field: URI Path
  Operator: equals
  Value: /api/ensure-customer

Then:
  Choose action: Block
  With response code: 429

Characteristics:
  ✓ IP Address

Rate:
  Requests: 10
  Period: 1 minute

Save
```

---

### **Rule 4: Phone Number Reservation** 🔴 CRITICAL

```
Rule name: Number Reservation Rate Limit

When incoming requests match:
  Field: URI Path
  Operator: equals
  Value: /api/reserve-number

Then:
  Choose action: Block
  With response code: 429

Characteristics:
  ✓ IP Address

Rate:
  Requests: 5
  Period: 1 minute

Save
```

---

### **Rule 5: Tax Calculation** 🟡 HIGH

```
Rule name: Tax Calculation Rate Limit

When incoming requests match:
  Field: URI Path
  Operator: equals
  Value: /api/calculate-taxes

Then:
  Choose action: Block
  With response code: 429

Characteristics:
  ✓ IP Address

Rate:
  Requests: 30
  Period: 1 minute

Save
```

---

### **Rule 6: ZIP Validation** 🟡 HIGH

```
Rule name: ZIP Validation Rate Limit

When incoming requests match:
  Field: URI Path
  Operator: equals
  Value: /api/validate-zip

Then:
  Choose action: Block
  With response code: 429

Characteristics:
  ✓ IP Address

Rate:
  Requests: 30
  Period: 1 minute

Save
```

---

### **Rule 7: Portability Check** 🟡 HIGH

```
Rule name: Portability Check Rate Limit

When incoming requests match:
  Field: URI Path
  Operator: equals
  Value: /api/check-portability

Then:
  Choose action: Block
  With response code: 429

Characteristics:
  ✓ IP Address

Rate:
  Requests: 30
  Period: 1 minute

Save
```

---

### **Rule 8: Available Numbers** 🟡 HIGH

```
Rule name: Available Numbers Rate Limit

When incoming requests match:
  Field: URI Path
  Operator: equals
  Value: /api/available-numbers

Then:
  Choose action: Block
  With response code: 429

Characteristics:
  ✓ IP Address

Rate:
  Requests: 30
  Period: 1 minute

Save
```

---

### **Rule 9: Address Autocomplete** 🟢 MEDIUM

```
Rule name: Smarty Autocomplete Rate Limit

When incoming requests match:
  Field: URI Path
  Operator: equals
  Value: /api/smarty-autocomplete

Then:
  Choose action: Block
  With response code: 429

Characteristics:
  ✓ IP Address

Rate:
  Requests: 20
  Period: 1 minute

Save
```

---

### **Rule 10: Session Save** 🟢 MEDIUM

```
Rule name: Session Save Rate Limit

When incoming requests match:
  Field: URI Path
  Operator: equals
  Value: /api/session/save

Then:
  Choose action: Block
  With response code: 429

Characteristics:
  ✓ IP Address

Rate:
  Requests: 30
  Period: 1 minute

Save
```

---

### **Rule 11: Session Load** 🟢 MEDIUM

```
Rule name: Session Load Rate Limit

When incoming requests match:
  Field: URI Path
  Operator: equals
  Value: /api/session/load

Then:
  Choose action: Block
  With response code: 429

Characteristics:
  ✓ IP Address

Rate:
  Requests: 30
  Period: 1 minute

Save
```

---

### **Rule 12: Checkout Page** 🟢 MEDIUM

```
Rule name: Checkout Page Rate Limit

When incoming requests match:
  Field: URI Path
  Operator: equals
  Value: /

Then:
  Choose action: Block
  With response code: 429

Characteristics:
  ✓ IP Address

Rate:
  Requests: 60
  Period: 1 minute

Save
```

---

## ✅ QUICK SETUP (Copy-Paste Version)

**For fast setup, create rules in this order:**

1. **Payment endpoints:** 10/min limit
   - `/api/create-payment-intent`
   - `/api/update-payment-intent`
   - `/api/ensure-customer`

2. **Phone number:** 5/min limit
   - `/api/reserve-number`

3. **External API calls:** 30/min limit
   - `/api/calculate-taxes`
   - `/api/validate-zip`
   - `/api/check-portability`
   - `/api/available-numbers`

4. **User interaction:** 20-30/min limit
   - `/api/smarty-autocomplete` (20/min)
   - `/api/session/save` (30/min)
   - `/api/session/load` (30/min)

5. **Checkout page:** 60/min limit
   - `/` (main page)

---

## 🧪 TESTING RATE LIMITS

### **Test with cURL:**

```bash
# Test payment intent rate limit (should block after 10)
for i in {1..15}; do
  echo "Request $i"
  curl -X POST https://www.voiply.com/api/create-payment-intent \
    -H "Content-Type: application/json" \
    -d '{"amount": 100}'
  sleep 1
done

# Test autocomplete rate limit (should block after 20)
for i in {1..25}; do
  echo "Request $i"
  curl "https://www.voiply.com/api/smarty-autocomplete?search=test"
  sleep 1
done
```

### **Expected Results:**

```
Request 1-10: 200 OK (or 400 if invalid data)
Request 11+: 429 Too Many Requests

{
  "error": "Rate limit exceeded"
}
```

---

## 📊 MONITORING RATE LIMITS

### **View Rate Limit Activity:**

```
Cloudflare Dashboard
→ Security
→ WAF
→ Rate limiting rules
→ Click on rule name
→ View "Activity log"
```

### **Set Up Alerts:**

```
Cloudflare Dashboard
→ Notifications
→ Add
→ HTTP Rate Limiting
→ Set threshold (e.g., alert if >100 blocks/hour)
→ Add email/webhook
```

---

## 💰 COST

**All rate limiting is FREE on all Cloudflare plans** ✅

- Free plan: ✅ Included
- Pro plan: ✅ Included
- Business plan: ✅ Included
- Enterprise plan: ✅ Included

**No per-request charges, no quotas, no limits**

---

## 🎯 PRIORITY ORDER

**If you're short on time, implement in this order:**

### **Phase 1: Critical (5 min)**
1. `/api/create-payment-intent` (10/min)
2. `/api/reserve-number` (5/min)

### **Phase 2: High (5 min)**
4. `/api/calculate-taxes` (30/min)
5. `/api/validate-zip` (30/min)
6. `/api/check-portability` (30/min)

### **Phase 3: Medium (5 min)**
7. `/api/smarty-autocomplete` (20/min)
8. `/api/session/save` (30/min)
9. `/api/session/load` (30/min)

### **Phase 4: Nice-to-have**
10. All remaining endpoints

---

## 🚨 IMPORTANT NOTES

### **IP-Based Limitations:**

Rate limiting is **per IP address**, which means:

✅ **Good for:**
- Preventing abuse from single attackers
- Blocking bot traffic
- Protecting against scrapers

⚠️ **Limitations:**
- Users on same IP (office, VPN) share limits
- Legitimate users might hit limits in shared networks

**Solution:** Limits are generous enough to allow normal use

---

### **Cloudflare Bypass:**

If you need to bypass rate limits (for testing):

```
Cloudflare Dashboard
→ WAF
→ Tools
→ IP Access Rules
→ Add your testing IP
→ Action: Allow
```

---

## 📋 CHECKLIST

**After implementing all rules:**

- [ ] 12 rate limiting rules created
- [ ] Test endpoint blocked (403)
- [ ] Tested payment endpoint (10 req limit)
- [ ] Tested autocomplete (20 req limit)
- [ ] Alerts configured
- [ ] Documented in team wiki/docs

---

## 🔍 TROUBLESHOOTING

### **Issue: Legitimate users getting blocked**

**Solution:** Increase the limit for that endpoint

```
Edit rule → Change "Requests: 10" to "Requests: 20"
```

---

### **Issue: Bots still getting through**

**Solution:** Enable Bot Fight Mode

```
Cloudflare Dashboard
→ Security
→ Bots
→ Enable "Bot Fight Mode"
```

---

### **Issue: Can't find rate limiting rules**

**Check plan:** Rate limiting is available on all plans, but might be under different menu locations:

- Free/Pro: Security → WAF → Rate limiting rules
- Business+: Same location, more options

---

## 📚 ADDITIONAL PROTECTION

**Beyond rate limiting, consider:**

1. **Bot Fight Mode** (free)
   - Blocks known bad bots
   - Security → Bots → Enable

2. **Under Attack Mode** (if under DDoS)
   - Shows challenge page to all visitors
   - Overview → Quick Actions → Under Attack Mode

3. **Challenge Page for API Routes** (optional)
   - Show CAPTCHA before API access
   - Page Rules → Add rule for `/api/*`

---

## ✅ DONE!

After implementing these 12 rules:

- ✅ Payment endpoints protected (10/min)
- ✅ Phone number reservations limited (5/min)
- ✅ External API calls throttled (30/min)
- ✅ User interaction endpoints protected (20-30/min)
- ✅ Checkout page protected from scraping

**Total setup time:** 15-20 minutes  
**Cost:** $0/month  
**Security:** Significantly improved ✅

---

**Last Updated:** February 18, 2026  
**Next Review:** After first week of production traffic
