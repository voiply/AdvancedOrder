import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = 'usd', email, name, phone, address, submission_id, plan } = body;
    
    // Amount validation
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }
    
    // Maximum order amount ($1,000) - prevents fraudulent large charges
    const MAX_AMOUNT = 1000;
    if (amount > MAX_AMOUNT) {
      return NextResponse.json(
        { error: 'Amount exceeds maximum allowed' },
        { status: 400 }
      );
    }
    
    // Minimum amount ($1) - prevents zero-dollar orders
    if (amount < 1) {
      return NextResponse.json(
        { error: 'Amount below minimum' },
        { status: 400 }
      );
    }
    
    // Get Stripe Secret key from environment variable
    // Primary: check if Stripe_Secret is a live key (most reliable)
    // Fallback: check host/referer headers for voiply.com
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
    
    let customerId = '';
    
    // If email provided, look up or create customer
    if (email) {
      try {
        // Search for existing customer by email
        const searchUrl = `https://api.stripe.com/v1/customers/search?query=email:'${encodeURIComponent(email)}'`;
        
        const searchResponse = await fetch(searchUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${stripeSecretKey}`,
          }
        });
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          
          if (searchData.data && searchData.data.length > 0) {
            // Customer exists, use their ID
            customerId = searchData.data[0].id;
          } else {
            // Customer doesn't exist, create new one
            const createCustomerUrl = 'https://api.stripe.com/v1/customers';
            const customerBody = new URLSearchParams({
              email: email,
            });
            
            if (name) customerBody.append('name', name);
            if (phone) customerBody.append('phone', phone);
            if (address) {
              if (address.line1) customerBody.append('address[line1]', address.line1);
              if (address.line2) customerBody.append('address[line2]', address.line2);
              if (address.city) customerBody.append('address[city]', address.city);
              if (address.state) customerBody.append('address[state]', address.state);
              if (address.postal_code) customerBody.append('address[postal_code]', address.postal_code);
              if (address.country) customerBody.append('address[country]', address.country);
            }
            
            const createResponse = await fetch(createCustomerUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${stripeSecretKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              body: customerBody.toString()
            });
            
            if (createResponse.ok) {
              const customerData = await createResponse.json();
              customerId = customerData.id;
            }
          }
        }
      } catch (error) {
        console.error('Error looking up/creating customer:', error);
        // Continue without customer ID
      }
    }
    
    // Create Payment Intent
    const stripeUrl = 'https://api.stripe.com/v1/payment_intents';
    
    // Stripe expects amount in cents
    const amountInCents = Math.round(amount * 100);
    
    const formBody = new URLSearchParams({
      amount: amountInCents.toString(),
      currency: currency,
      'payment_method_types[]': 'card',
      'setup_future_usage': 'off_session', // Attach payment method to customer after payment
    });
    
    // Add customer if we have one
    if (customerId) {
      formBody.append('customer', customerId);
    }
    
    // Add description based on plan
    if (plan) {
      let description = '';
      if (plan === '3month') {
        description = '3-Month Home';
      } else if (plan === 'annually') {
        description = 'Annually Home';
      } else if (plan === '3year') {
        description = '3-Year Home';
      }
      if (description) {
        formBody.append('description', description);
      }
    }
    
    // Add submission_id to metadata if provided
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
        { error: 'Failed to create payment intent' },
        { status: stripeResponse.status }
      );
    }
    
    const paymentIntent = await stripeResponse.json();
    
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      customerId: customerId || null
    });
    
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
