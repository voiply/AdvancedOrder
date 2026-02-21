import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerId,
      orderId,
      primaryNumber,
      product,
      zip,
      fullName,
      shippingAddress,
      billingAddress,
    } = body;

    if (!customerId) {
      return NextResponse.json({ error: 'customerId is required' }, { status: 400 });
    }

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
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const updateBody = new URLSearchParams();

    // Top-level name and description on the customer object
    if (fullName) updateBody.append('name', fullName);
    updateBody.append('description', 'Voiply Residential');

    // Metadata
    if (orderId) updateBody.append('metadata[orderId]', orderId);
    if (primaryNumber) updateBody.append('metadata[primary number]', primaryNumber);
    if (product !== undefined) updateBody.append('metadata[product]', product);
    if (zip) updateBody.append('metadata[zip]', zip);
    updateBody.append('metadata[description]', 'Voiply Residential');
    if (fullName) updateBody.append('metadata[fullname]', fullName);
    updateBody.append('metadata[phones]', '1');

    // Shipping address
    if (shippingAddress) {
      if (shippingAddress.name) updateBody.append('shipping[name]', shippingAddress.name);
      if (shippingAddress.line1) updateBody.append('shipping[address][line1]', shippingAddress.line1);
      if (shippingAddress.line2) updateBody.append('shipping[address][line2]', shippingAddress.line2);
      if (shippingAddress.city) updateBody.append('shipping[address][city]', shippingAddress.city);
      if (shippingAddress.state) updateBody.append('shipping[address][state]', shippingAddress.state);
      if (shippingAddress.postal_code) updateBody.append('shipping[address][postal_code]', shippingAddress.postal_code);
      if (shippingAddress.country) updateBody.append('shipping[address][country]', shippingAddress.country);
    }

    // Billing address (address field on customer object)
    if (billingAddress) {
      if (billingAddress.line1) updateBody.append('address[line1]', billingAddress.line1);
      if (billingAddress.line2) updateBody.append('address[line2]', billingAddress.line2);
      if (billingAddress.city) updateBody.append('address[city]', billingAddress.city);
      if (billingAddress.state) updateBody.append('address[state]', billingAddress.state);
      if (billingAddress.postal_code) updateBody.append('address[postal_code]', billingAddress.postal_code);
      if (billingAddress.country) updateBody.append('address[country]', billingAddress.country);
    }

    const response = await fetch(`https://api.stripe.com/v1/customers/${customerId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: updateBody.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to update Stripe customer metadata:', errorText);
      return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating customer metadata:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
