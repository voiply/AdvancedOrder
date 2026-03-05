import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, customerId } = await request.json();

    if (!paymentIntentId || !customerId) {
      return NextResponse.json({ error: 'paymentIntentId and customerId required' }, { status: 400 });
    }

    const liveKey = process.env.Stripe_Secret || '';
    const devKey = process.env.Stripe_Secret_Dev || process.env.Stripe_Secret || '';
    const host = request.headers.get('host') || '';
    const referer = request.headers.get('referer') || '';
    const isProduction = liveKey.startsWith('sk_live_')
      ? (host.includes('voiply.com') || referer.includes('voiply.com'))
      : false;
    const stripeSecretKey = (isProduction && liveKey.startsWith('sk_live_')) ? liveKey : devKey;

    if (!stripeSecretKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Retrieve the PaymentIntent to get the payment_method ID
    const piRes = await fetch('https://api.stripe.com/v1/payment_intents/' + paymentIntentId, {
      headers: { 'Authorization': 'Bearer ' + stripeSecretKey }
    });

    if (!piRes.ok) {
      const err = await piRes.json();
      console.error('Failed to retrieve PI:', err);
      return NextResponse.json({ error: 'Failed to retrieve payment intent' }, { status: 500 });
    }

    const pi = await piRes.json();
    const paymentMethodId = pi.payment_method;

    if (!paymentMethodId) {
      return NextResponse.json({ error: 'No payment method on intent' }, { status: 400 });
    }

    // Set as default payment method on the customer
    const updateRes = await fetch('https://api.stripe.com/v1/customers/' + customerId, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + stripeSecretKey,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'invoice_settings[default_payment_method]': paymentMethodId
      }).toString()
    });

    if (!updateRes.ok) {
      const err = await updateRes.json();
      console.error('Failed to set default payment method:', err);
      return NextResponse.json({ error: 'Failed to set default payment method' }, { status: 500 });
    }

    return NextResponse.json({ success: true, paymentMethodId });

  } catch (error) {
    console.error('set-default-payment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
