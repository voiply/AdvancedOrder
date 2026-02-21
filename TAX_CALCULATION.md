# Tax Calculation System

This document explains how the tax calculation system works in the Voiply checkout flow.

## Overview

The tax calculation system calculates accurate sales tax, service taxes, and regulatory fees based on the customer's service address zipcode. It uses the CSI (Communication Services International) API for precise tax calculations.

## Architecture

### API Route: `/app/api/calculate-taxes/route.ts`

This Next.js API route handles all tax calculations. It:

1. Receives order details (zip code, duration, hardware amount)
2. Calculates monthly and total service fees
3. Calls CSI API for accurate tax calculations
4. Returns comprehensive breakdown including all fees and taxes

### Frontend Integration

The order page includes:
- **"View Breakdown →" button** - Located under Taxes & Fees in the order summary
- **Tax Breakdown Modal** - Shows detailed breakdown of all charges

## Variables Passed to Tax Calculation

```typescript
{
  zip: string,              // Service address zip code
  duration: string,         // 'quarter' (3-month), 'year', or '3year'
  hardwareAmount: number    // Total hardware cost from selected bundle
}
```

## Fee Structure

### Monthly Fees (Residential)

- **Support Fee**: $5.95/month
- **Telco Fee**: $3.00/month
- **E911 Fee**: $1.50/month
- **Regulatory Cost & Compliance Fee**: $2.00/month

### Duration Multipliers

- **Quarter (3-month)**: All monthly fees × 3
- **Year (annually)**: All monthly fees × 12
- **3-Year**: All monthly fees × 36

## CSI API Integration

### Configuration

Set these environment variables in your `.env.local` or Webflow Cloud environment:

```bash
CSI_API_URL=https://api.csiinfo.com/tax/v1/calculate
CSI_API_KEY=your_csi_api_key_here
CSI_CLIENT_ID=your_csi_client_id_here
```

### API Request Format

```json
{
  "zipCode": "15201",
  "transactionType": "SALE",
  "lineItems": [
    {
      "description": "Hardware",
      "amount": 39.00,
      "quantity": 1,
      "taxable": true
    },
    {
      "description": "Support Services",
      "amount": 71.40,
      "quantity": 1,
      "taxable": true
    },
    {
      "description": "Telecom Services",
      "amount": 36.00,
      "quantity": 1,
      "taxable": true
    }
  ]
}
```

### Fallback Calculation

If CSI API credentials are not configured or the API call fails, the system falls back to a simple 47% tax rate:
- State Tax: 35% of subtotal
- Local Tax: 12% of subtotal

## Tax Breakdown Modal

The modal displays:

### 1. Service Details
- Service address zipcode
- Plan duration (months)
- Hardware amount

### 2. Monthly Service Fees
- Support Fee: $5.95/mo
- Telco Fee: $3.00/mo
- Total Monthly Fees

### 3. Total for Duration
- Support Fee × months
- Telco Fee × months

### 4. Tax Details (from CSI API)
- State Tax
- Local Tax
- Sales Tax
- Other jurisdiction-specific taxes

### 5. Regulatory Fees
- **E911 Fee**: Monthly and total for duration
- **Regulatory Cost & Compliance Fee**: Monthly and total for duration

### 6. Grand Total
- Subtotal (Hardware + Services)
- Sales/Service Taxes
- E911 Fee
- Regulatory Cost & Compliance Fee
- **Total Taxes & All Fees**
- **Grand Total**

## Example Calculation

**Order Details:**
- Hardware: $39.00 (Voiply Adapter)
- Plan: Annually (12 months)
- Service: $89.50/year
- Zipcode: 15201 (Pittsburgh, PA)

**Calculated Fees:**
- Support: $5.95/mo × 12 = $71.40
- Telco: $3.00/mo × 12 = $36.00
- E911: $1.50/mo × 12 = $18.00
- Regulatory: $2.00/mo × 12 = $24.00

**Subtotal:** $146.40 (Hardware + Support + Telco)

**Taxes (from CSI API):** ~$68.81 (47% of subtotal)

**Regulatory Fees:** $42.00 (E911 + Regulatory)

**Grand Total:** $257.21

## Testing

### Without CSI API (Fallback Mode)

The system will work without CSI credentials using the 47% fallback rate. This is useful for development and testing.

### With CSI API

Configure your CSI credentials to get accurate, jurisdiction-specific tax calculations based on the service address zipcode.

## Error Handling

- **Missing required fields**: Returns 400 error
- **CSI API failure**: Falls back to 47% calculation and logs warning
- **Network errors**: Returns 500 error with details

## Frontend Usage

```typescript
// Fetch tax breakdown
const fetchTaxBreakdown = async () => {
  const duration = selectedPlan === '3month' ? 'quarter' : 
                   selectedPlan === 'annually' ? 'year' : '3year';
  
  const hardwareAmount = ownDevice ? 0 : 
    (BUNDLES.find(b => b.id === selectedBundle)?.price || 0);
  
  const response = await fetch('/api/calculate-taxes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      zip: addressComponents.zipCode,
      duration,
      hardwareAmount,
    }),
  });
  
  const data = await response.json();
  // Display in modal
};
```

## Deployment

When deploying to Webflow Cloud, make sure to set the CSI API environment variables in your Webflow Cloud project settings.

## Future Enhancements

- Cache tax rates by zipcode to reduce API calls
- Support for business/commercial tax rates
- International tax calculation support
- Sales tax exemption certificate handling
