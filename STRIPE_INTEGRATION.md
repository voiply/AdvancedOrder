# Stripe Integration Setup Guide

## Overview
The Voiply checkout now uses Stripe Payment Intent API with server-side secret key management, following the same pattern as the Telnyx integration.

## Environment Variable Setup

In **Webflow Cloud** environment variables, you need to add:

```
Name: Stripe_Secret
Value: sk_test_YOUR_STRIPE_SECRET_KEY_HERE
```

⚠️ **IMPORTANT**: Use your actual Stripe Secret Key (starts with `sk_test_` or `sk_live_`)

### Same Pattern as Telnyx
This follows the exact same pattern as the Telnyx integration:
- **Telnyx**: Uses `process.env.Telnyx` in `/app/api/available-numbers/route.ts`
- **Stripe**: Uses `process.env.Stripe_Secret` in `/app/api/create-payment-intent/route.ts`

## How It Works

### 1. Payment Intent Creation (Server-Side)
**File**: `/app/api/create-payment-intent/route.ts`

When user reaches Step 4 (Payment page):
1. Frontend calculates total amount (plan + device + protection + taxes)
2. Calls `/api/create-payment-intent` endpoint with the amount
3. Backend uses `process.env.Stripe_Secret` to create a Payment Intent via Stripe API
4. Returns `clientSecret` to frontend

```typescript
// Backend API route
const stripeSecretKey = process.env.Stripe_Secret;

const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${stripeSecretKey}`,
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: formBody.toString()
});
```

### 2. Payment Element Initialization (Client-Side)
**File**: `/app/page.tsx`

Frontend uses the `clientSecret` to initialize Stripe Payment Element:
```typescript
const elementsInstance = stripeInstance.elements({
  clientSecret: clientSecret
});

const paymentEl = elementsInstance.create('payment', {
  layout: {
    type: 'tabs',
    defaultCollapsed: false,
  }
});
```

### 3. Payment Confirmation (Client-Side)
When user clicks "Place Your Order":
```typescript
const { error, paymentIntent } = await stripe.confirmPayment({
  elements,
  confirmParams: {
    payment_method_data: {
      billing_details: {
        name: `${firstName} ${lastName}`,
        email: email,
        phone: mobileNumber,
        address: {
          line1: addressComponents.street,
          city: addressComponents.city,
          state: addressComponents.state,
          postal_code: addressComponents.zipCode,
          country: 'US'
        }
      }
    }
  },
  redirect: 'if_required'
});
```

## Security Features

✅ **Secret key never exposed to client**
- Stripe Secret Key stays on server in environment variables
- Only client-safe `clientSecret` is sent to frontend
- Same security model as Telnyx integration

✅ **Amount calculated server-side**
- Payment Intent created with correct amount on backend
- Frontend cannot manipulate the payment amount

✅ **Billing details included**
- Customer name, email, phone, and address sent with payment
- Supports separate billing address if different from shipping

## User Experience Features

- ✨ **Loading states**: Shows "Initializing payment..." spinner while creating payment intent
- ✨ **Processing indicator**: Button shows "Processing..." while confirming payment
- ✨ **Error handling**: User-friendly error messages for payment failures
- ✨ **Multiple payment methods**: Stripe Payment Element supports cards, wallets, and more

## API Endpoints

### POST `/api/create-payment-intent`
Creates a Stripe Payment Intent for the order.

**Request Body:**
```json
{
  "amount": 150.25,
  "currency": "usd"
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

**Environment Variable Required**: `Stripe_Secret`

## Testing

### Test Mode Setup
Currently using Stripe test publishable key in frontend:
```javascript
pk_test_xUOr3G0ru1UKcGvNOCg1nRUN
```

For testing, use Stripe test cards:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155

More test cards: https://stripe.com/docs/testing

### Production Setup
For production, update:
1. Frontend publishable key to `pk_live_...`
2. Backend secret key in Webflow environment to `sk_live_...`

## Deployment Checklist

- [ ] Add `Stripe_Secret` environment variable in Webflow Cloud
- [ ] Verify environment variable name is exactly `Stripe_Secret` (case-sensitive)
- [ ] Test payment flow in test mode
- [ ] Replace test keys with live keys for production
- [ ] Test successful payment
- [ ] Test declined payment handling
- [ ] Verify billing address is captured correctly

## Common Issues

**Issue**: "Stripe_Secret environment variable is not set"
- **Solution**: Add the environment variable in Webflow Cloud settings

**Issue**: Payment Element not loading
- **Solution**: Check that clientSecret is being created successfully, verify Stripe.js is loaded

**Issue**: Payment confirmation failing
- **Solution**: Verify all required billing details are present, check Stripe dashboard for error details

## Files Modified

1. **NEW**: `/app/api/create-payment-intent/route.ts` - Payment Intent creation endpoint
2. **MODIFIED**: `/app/page.tsx` - Frontend Stripe integration and payment flow

## Next Steps

After deployment:
1. Set up Stripe webhooks for payment status updates
2. Create order confirmation page (`/order-confirmation`)
3. Implement order storage/database integration
4. Add email notifications for successful orders
5. Set up Stripe dashboard monitoring and alerts
