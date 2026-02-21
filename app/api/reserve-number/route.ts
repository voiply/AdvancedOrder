import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone_number } = body;
    
    if (!phone_number) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }
    
    // Validate phone number format (should be +1XXXXXXXXXX)
    if (!phone_number.match(/^\+1\d{10}$/)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Expected +1XXXXXXXXXX' },
        { status: 400 }
      );
    }
    
    // Get Telnyx API key from environment variable
    const telnyxApiKey = process.env.Telnyx;
    
    if (!telnyxApiKey) {
      console.error('Telnyx environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    // Call Telnyx API to reserve the number
    const telnyxUrl = 'https://api.telnyx.com/v2/number_reservations';
    
    const telnyxResponse = await fetch(telnyxUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        phone_numbers: [
          {
            phone_number: phone_number
          }
        ]
      })
    });
    
    if (!telnyxResponse.ok) {
      const errorText = await telnyxResponse.text();
      console.error('Telnyx reserve error status:', telnyxResponse.status, 'body:', errorText);
      let errJson: any = {};
      try { errJson = JSON.parse(errorText); } catch {}
      
      // If limit exceeded (85007), treat as soft success — number will be ordered at checkout
      const isLimitError = errJson?.errors?.[0]?.code === '85007';
      if (isLimitError) {
        console.warn('Telnyx reservation limit reached — proceeding without reservation');
        return NextResponse.json({ success: true, phone_number, reserved: false });
      }
      
      const telnyxMessage = errJson?.errors?.[0]?.detail || errJson?.errors?.[0]?.title || 'Failed to reserve phone number';
      return NextResponse.json(
        { error: telnyxMessage, details: errorText, status: telnyxResponse.status },
        { status: 400 }
      );
    }
    
    const data = await telnyxResponse.json();
    
    
    return NextResponse.json({
      success: true,
      phone_number: phone_number,
      reservation: data
    });
    
  } catch (error) {
    console.error('Error reserving phone number:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
