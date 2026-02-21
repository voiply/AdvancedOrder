# Voiply Checkout Flow

Multi-step checkout form for Voiply phone service with address autocomplete, phone portability verification, bundle selection, and Stripe payment integration.

## Features

### Step 1: Address & Phone Validation
- **Smarty Address Autocomplete** - Auto-completes US addresses
- **Telnyx Phone Portability Check** - Verifies if existing phone numbers can be ported
- **Internet Service Check** - Captures internet availability

### Step 2: Bundle Selection
- 4 bundle options with pricing and features
- Visual selection interface
- Product images and feature lists

### Step 3: Payment
- Stripe Elements integration
- Secure card input
- Order summary

## Environment Variables

### Required for Webflow Cloud Deployment

Set these environment variables in your Webflow Cloud project settings:

```
TELNYX_API_KEY=your_telnyx_api_key_here
```

**To set environment variables in Webflow Cloud:**
1. Go to your Webflow Cloud project dashboard
2. Navigate to Settings → Environment Variables
3. Add `TELNYX_API_KEY` with your Telnyx API key
4. Redeploy your app

For more info: https://developers.webflow.com/webflow-cloud/bring-your-own-app

### Getting API Keys

**Telnyx API Key:**
1. Sign up at https://telnyx.com/
2. Go to https://portal.telnyx.com/
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your environment variables

## Local Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone https://github.com/voiply/HomeOrder.git
cd HomeOrder
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```bash
cp .env.example .env.local
```

4. Add your Telnyx API key to `.env.local`:
```
TELNYX_API_KEY=your_actual_telnyx_key
```

5. Run the development server:
```bash
npm run dev
```

6. Open http://localhost:3000/home-phone-checkout

### Build for Production

```bash
npm run build
npm run start
```

## Tech Stack

- **Framework:** Next.js 15 (downgraded for Webflow Cloud compatibility)
- **Styling:** Tailwind CSS v3
- **Address Autocomplete:** Smarty Streets (HTML Key: 243722902014375393)
- **Phone Validation:** Telnyx Portability API
- **Payment:** Stripe Elements (pk_live_D6rvZlsemkyp8H52V8TiP4YY)
- **Analytics:** Google Tag Manager (GTM-M29KG8V)
- **Deployment:** Webflow Cloud

## API Routes

### POST /api/check-portability

Checks if a phone number can be ported using Telnyx API.

**Request:**
```json
{
  "phoneNumber": "5551234567"
}
```

**Response (Success):**
```json
{
  "portable": true,
  "fastPortable": true,
  "phoneNumberType": "local",
  "carrierName": "CARRIER NAME",
  "messagingCapable": true,
  "notPortableReason": null,
  "notPortableReasonDescription": null
}
```

**Response (Not Portable):**
```json
{
  "portable": false,
  "notPortableReason": "REASON_CODE",
  "notPortableReasonDescription": "Detailed reason..."
}
```

## Deployment

### Webflow Cloud

This app is configured for Webflow Cloud deployment:

1. Push your changes to GitHub
2. Webflow Cloud auto-deploys from the `main` branch
3. Set environment variables in Webflow Cloud settings
4. App deploys to: https://voiply-new.webflow.io/home-phone-checkout

### Manual Deployment

If deploying elsewhere:

```bash
npm run build
npm run start
```

Ensure `TELNYX_API_KEY` is set in your hosting environment.

## Configuration

### Smarty Streets
- HTML Key: `243722902014375393`
- SDK: https://d79i1fxsrar4t.cloudfront.net/javascript/api/1.0/index.js

### Stripe
- Publishable Key: `pk_live_D6rvZlsemkyp8H52V8TiP4YY`
- Loads from: https://js.stripe.com/v3/

### Google Tag Manager
- Container ID: `GTM-M29KG8V`

## Troubleshooting

### Address autocomplete not working
- Check browser console for errors
- Verify Smarty SDK loaded: Check Network tab for `index.js`
- Ensure HTML key is valid

### Phone validation not working
- Check that `TELNYX_API_KEY` environment variable is set
- Check browser console and Network tab for API errors
- Verify API route is accessible: POST to `/api/check-portability`

### Stripe not loading
- Check browser console for Stripe errors
- Verify publishable key is correct
- Ensure Stripe SDK loads from CDN

## License

Proprietary - Voiply
