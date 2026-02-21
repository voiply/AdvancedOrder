# Tax Calculation - Azure Function Implementation

## Overview
The tax calculation has been updated to **exactly match the Azure function logic** used in production. This ensures consistency between the Bubble.io app and the Next.js checkout.

## Environment Variables Required

### Webflow Cloud Environment Variable:
```
Name:  CSI
Value: Vm8hJkwzck44eDI6
```

This is the **Basic authentication token** for the CSI API (matching the Azure function).

---

## How It Works

### 1. **CSI API Endpoint**
```
URL: https://tcw.csilongwood.com/api/batches
Method: POST
Auth: Basic Vm8hJkwzck44eDI6
```

### 2. **Product & Service Codes (Matching Azure Function)**

| Service | Product Code | Service Code | Description |
|---------|--------------|--------------|-------------|
| Support | C001 | 14 | Support services |
| Telco | V001 | 7 | Telecom voice services |
| 911 Fee | V001 | 19 | E911 emergency service |
| 911 Amount | V001 | 15 | E911 fee amount |
| Regulatory | V001 | 15 | Regulatory compliance fee |
| Hardware | G001 | 2 | Physical devices |

### 3. **Fee Structure**

```typescript
const fees = {
  fee911: {
    usd: 1.50,  // per month per location
    cad: 2.16
  },
  feeRegulatory: {
    usd: 2.25,  // per month per extension
    cad: 3.10
  }
};
```

### 4. **Duration Mapping**

```typescript
duration = 'quarter'  → monthsMultiplier = 3
duration = 'year'     → monthsMultiplier = 12
duration = '3year'    → monthsMultiplier = 36
duration = 'month'    → monthsMultiplier = 1
```

---

## API Request Format

### Frontend Call:
```javascript
const response = await fetch('/api/calculate-taxes', {
  method: 'POST',
  body: JSON.stringify({
    zip: '15301',
    duration: 'year',              // or 'quarter', '3year'
    hardwareAmount: 49.99,         // Device bundle price
    support: 0,                    // Support fee (monthly)
    telco: 7.46,                   // Telco service (monthly)
    protection: 11.88,             // Protection plan (total)
    extensions: 1,                 // Number of lines
    locations: 1,                  // Number of locations
    plan: 'annually'               // Plan name
  })
});
```

### What Gets Calculated:

1. **Support Services (C001-14)**
   - Monthly amount × extensions × duration
   - Example: $0 × 1 × 12 = $0 (no support fee in checkout)

2. **Telco Services (V001-7)**
   - Monthly amount × extensions × duration
   - Example: $7.46 × 1 × 12 = $89.52

3. **911 Fee (V001-19 + V001-15)**
   - Only if plan doesn't have "advanced" or "starter"
   - $1.50/month × locations × duration
   - Example: $1.50 × 1 × 12 = $18.00

4. **Regulatory Fee (V001-15)**
   - $2.25/month × extensions × duration
   - Example: $2.25 × 1 × 12 = $27.00

5. **Hardware (G001-2)**
   - One-time charge (not multiplied by duration)
   - Example: $49.99

6. **Protection Plan**
   - Added to chargeAmount directly
   - Example: $11.88

---

## CSI API Request Structure

For each service, creates monthly records:

```json
{
  "unique_id": "V001_abc123",
  "account_number": "64c0e61a-5dbf-4a56-9d7d-515bb3406f3a",
  "location_a": "15301",
  "invoice_date": "20260216",
  "record_type": "S",
  "product_code": "V001",
  "service_code": "7",
  "charge_amount": 7.46,
  "units": 1,
  "exempt_code": "N",
  "keep_record": true
}
```

**For annually plan (12 months):**
- Creates 12 separate monthly records
- Each record has the monthly amount
- CSI calculates tax for each month
- Results are summed

---

## CSI API Response

### Success Response:
```json
{
  "submission_id": "abc123xyz",
  "tax_data": [
    {
      "unique_id": "V001_abc123",
      "description": "PA - State Universal Service Charge",
      "tax_amount": 2.14,
      "tax_auth": "Pennsylvania State",
      "tax_rate": 0.0286,
      "charge_amount": 7.46
    },
    {
      "unique_id": "V001_abc123",
      "description": "Washington County Communications Tax",
      "tax_amount": 0.37,
      "tax_auth": "Washington County",
      "tax_rate": 0.005,
      "charge_amount": 7.46
    }
  ]
}
```

### Our Processing:
1. Filter items with `tax_amount`
2. Separate hardware taxes from service taxes
3. Group by description and sum amounts
4. Add 911 and Regulatory fees to breakdown
5. Return structured response

---

## API Response Format

```json
{
  "submission_id": "abc123xyz",
  "estimatedTotalTax": 42.18,
  "tax_data": [
    {
      "description": "PA - State Universal Service Charge",
      "tax_amount": 25.68,
      "hardwareTax": false
    },
    {
      "description": "Washington County Communications Tax",
      "tax_amount": 4.44,
      "hardwareTax": false
    },
    {
      "description": "PA - State Sales Tax",
      "tax_amount": 3.00,
      "hardwareTax": true
    },
    {
      "description": "Emergency 911 and Information Services Fee",
      "tax_amount": 18.00,
      "hardwareTax": false
    },
    {
      "description": "Regulatory, Compliance and Intellectual Property Fee",
      "tax_amount": 27.00,
      "hardwareTax": false
    }
  ]
}
```

---

## Example Calculation

### Scenario:
- **Plan**: Annually ($89.50 = $7.46/month × 12)
- **Device**: AT&T Bundle ($49.99)
- **Protection**: Annually ($11.88)
- **Location**: Washington County, PA (15301)

### Step 1: Calculate Base Amounts
```
Telco (monthly):     $7.46
Hardware:            $49.99
Protection:          $11.88
Extensions:          1
Locations:           1
Duration:            12 months
```

### Step 2: Send to CSI
Creates records for:
- 12 × Telco service records ($7.46 each)
- 1 × Hardware record ($49.99)
- 12 × 911 fee records ($0 charge, just for tax calc)
- 12 × 911 amount records ($1.50 each)
- 12 × Regulatory fee records ($2.25 each)

### Step 3: CSI Returns Taxes
```
Service Taxes:       $30.12
Hardware Taxes:       $3.00
Total from CSI:      $33.12
```

### Step 4: Add Fees
```
911 Fee:             $1.50 × 12 = $18.00
Regulatory Fee:      $2.25 × 12 = $27.00
```

### Step 5: Final Breakdown
```
PA State Universal Service Charge:  $25.68
Washington County Comm Tax:          $4.44
PA State Sales Tax (hardware):       $3.00
Emergency 911 Fee:                   $18.00
Regulatory & IP Fee:                 $27.00
───────────────────────────────────────────
TOTAL TAXES & FEES:                  $78.12
```

---

## Fallback Behavior

If CSI API fails or `CSI` environment variable not set:

```typescript
const fallbackTax = chargeAmount * 0.47;

return {
  submission_id: null,
  estimatedTotalTax: fallbackTax,
  tax_data: [{
    description: 'Estimated Tax (47%)',
    tax_amount: fallbackTax,
    hardwareTax: false
  }]
};
```

---

## Retry Logic

If CSI returns no tax data for a zipcode:

1. Retry with default zip **15219** (Pittsburgh, PA)
2. This ensures we always get some tax calculation
3. Matches Azure function behavior exactly

```typescript
if (filteredItems.length === 0) {
  // Retry with 15219
  data_tax.forEach(o => o.location_a = '15219');
  const retryResponse = await fetch(csiApiUrl, ...);
}
```

---

## Key Differences from Previous Implementation

### Before (Old CSI API):
- Used different endpoint: `https://api.csiinfo.com/tax/v1/calculate`
- Used Bearer token authentication
- Different request format
- No exact Azure function matching

### After (Azure Function Logic):
- Uses: `https://tcw.csilongwood.com/api/batches`
- Uses Basic auth: `Basic Vm8hJkwzck44eDI6`
- Exact request format matching Azure
- Product codes match exactly
- Fee structure matches exactly
- Duration handling matches exactly
- 911 surcharge logic matches exactly

---

## Testing

### Test with Different Zipcodes:
```javascript
// High tax area
zip: '60601' // Chicago, IL

// Medium tax area  
zip: '15301' // Washington County, PA

// Low tax area
zip: '97301' // Salem, OR
```

### Test with Different Durations:
```javascript
// Quarterly
duration: 'quarter'  // 3 months

// Annually
duration: 'year'     // 12 months

// 3-Year
duration: '3year'    // 36 months
```

### Test with/without 911 Surcharge:
```javascript
// Has 911 surcharge
plan: 'annually'

// No 911 surcharge (if plan name contains these)
plan: 'advanced'
plan: 'starter'
```

---

## Deployment Checklist

- [x] Update tax calculation API route
- [x] Match Azure function logic exactly
- [x] Update frontend to pass correct parameters
- [x] Set CSI environment variable in Webflow Cloud
- [x] Test with various zipcodes
- [x] Test with different durations
- [x] Verify 911 fee logic
- [x] Verify regulatory fee logic
- [x] Test fallback behavior
- [x] Test retry with 15219 logic

---

## Common Issues

**Issue**: "CSI API returns empty tax_data"
- **Solution**: System automatically retries with zip 15219

**Issue**: "Wrong tax amounts"
- **Solution**: Verify CSI environment variable is set correctly as `Vm8hJkwzck44eDI6`

**Issue**: "Missing 911 or Regulatory fees"
- **Solution**: Check that telco > 0 and duration is correctly mapped

**Issue**: "CSI API authentication failed"
- **Solution**: Verify Basic auth token format: `Basic Vm8hJkwzck44eDI6`

---

## Files Modified

1. `/app/api/calculate-taxes/route.ts` - Complete rewrite matching Azure function
2. `/app/page.tsx` - Updated frontend call with Azure parameters

## Azure Function Match: ✅ Complete

The implementation now **exactly matches** the Azure function logic used in production, ensuring consistent tax calculations across all platforms.
