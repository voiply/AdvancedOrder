import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentIntentId, amount, submission_id, plan } = body;
    
    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment Intent ID is required' },
        { status: 400 }
      );
    }
    
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }
    
    // Get Stripe Secret key from environment variable
    const liveKey = process.env.Stripe_Secret || '';
    const devKey = process.env.Stripe_Secret_Dev || process.env.Stripe_Secret || '';
    const host = request.headers.get('host') || '';
    const referer = request.headers.get('referer') || '';
    const isProduction = liveKey.startsWith('sk_live_') 
      ? (host.includes('voiply.com') || referer.includes('voiply.com'))
      : false;
    const stripeSecretKey = (isProduction && liveKey.startsWith('sk_live_')) ? liveKey : devKey;
    console.log('[stripe-key] host:', host, 'referer:', referer, 'isProduction:', isProduction, 'keyPrefix:', stripeSecretKey.slice(0,14));
    
    if (!stripeSecretKey) {
      console.error('Stripe secret key environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    // Update Payment Intent with new amount
    const stripeUrl = `https://api.stripe.com/v1/payment_intents/${paymentIntentId}`;
    const amountInCents = Math.round(amount * 100);
    
    const formBody = new URLSearchParams({
      amount: amountInCents.toString(),
    });
    
    // Add description based on plan
    if (plan) {
      let description = '';
      if (plan === '3month') {
        description = '3-Month Advanced';
      } else if (plan === 'annually') {
        description = 'Annually Advanced';
      } else if (plan === '3year') {
        description = '3-Year Advanced';
      }
      if (description) {
        formBody.append('description', description);
      }
    }
    
    if (submission_id) {
      formBody.append('metadata[submission_id]', submission_id);
    }
    
    const stripeResponse = await fetch(stripeUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formBody.toString()
    });
    
    if (!stripeResponse.ok) {
      const errorText = await stripeResponse.text();
      console.error('Stripe API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to update payment intent' },
        { status: stripeResponse.status }
      );
    }
    
    const paymentIntent = await stripeResponse.json();
    
    return NextResponse.json({
      success: true,
      amount: paymentIntent.amount / 100,
      paymentIntentId: paymentIntent.id
    });
    
  } catch (error) {
    console.error('Error updating payment intent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
