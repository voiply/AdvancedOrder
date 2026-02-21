import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();
    
    // Validate input
    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }
    
    // Extract digits only
    const digits = phoneNumber.replace(/\D/g, '');
    
    // Validate 10-digit US number
    if (digits.length !== 10) {
      return NextResponse.json(
        { error: 'Phone number must be 10 digits' },
        { status: 400 }
      );
    }
    
    // Format for Telnyx: +1 prefix
    const formattedNumber = `+1${digits}`;
    
    // Get Telnyx API key from environment variable
    // In Webflow Cloud, this is set as "Telnyx" in Environment Variables
    const telnyxApiKey = process.env.Telnyx;
    
    if (!telnyxApiKey) {
      console.error('Telnyx environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    // Call Telnyx API
    const telnyxResponse = await fetch('https://api.telnyx.com/v2/portability_checks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        phone_numbers: [formattedNumber]
      })
    });
    
    if (!telnyxResponse.ok) {
      const errorText = await telnyxResponse.text();
      console.error('Telnyx API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to check portability' },
        { status: telnyxResponse.status }
      );
    }
    
    const data = await telnyxResponse.json();
    
    // Extract portability info from first result
    if (data.data && data.data.length > 0) {
      const result = data.data[0];
      
      return NextResponse.json({
        portable: result.portable || false,
        fastPortable: result.fast_portable || false,
        phoneNumberType: result.phone_number_type,
        carrierName: result.carrier_name,
        messagingCapable: result.messaging_capable,
        notPortableReason: result.not_portable_reason,
        notPortableReasonDescription: result.not_portable_reason_description
      });
    }
    
    return NextResponse.json(
      { error: 'No results returned from Telnyx' },
      { status: 500 }
    );
    
  } catch (error) {
    console.error('Error checking portability:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
