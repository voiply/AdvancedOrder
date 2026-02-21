import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentIntentId, email, name, phone, address } = body;
    
    if (!paymentIntentId || !email) {
      return NextResponse.json(
        { error: 'Payment Intent ID and email are required' },
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
    
    try {
      // Step 1: Search for existing customer by email
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
          // Step 2: Customer doesn't exist, create new one
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
          } else {
            const errorText = await createResponse.text();
            console.error('Failed to create customer:', errorText);
            throw new Error('Failed to create customer');
          }
        }
      }
      
      // Step 3: Attach customer to payment intent
      if (customerId) {
        const updateUrl = `https://api.stripe.com/v1/payment_intents/${paymentIntentId}`;
        const updateBody = new URLSearchParams({
          customer: customerId
        });
        
        const updateResponse = await fetch(updateUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${stripeSecretKey}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: updateBody.toString()
        });
        
        if (updateResponse.ok) {
          return NextResponse.json({
            success: true,
            customerId: customerId
          });
        } else {
          const errorText = await updateResponse.text();
          console.error('Failed to attach customer to payment intent:', errorText);
          // Still return the customer ID even if attachment fails
          return NextResponse.json({
            success: true,
            customerId: customerId,
            warning: 'Customer created but not attached to payment intent'
          });
        }
      } else {
        return NextResponse.json(
          { error: 'Failed to create or find customer' },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error('Error in customer creation/lookup:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error ensuring customer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
