import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const areaCode = searchParams.get('area_code');
    
    if (!areaCode || areaCode.length !== 3) {
      return NextResponse.json(
        { error: 'Valid 3-digit area code is required' },
        { status: 400 }
      );
    }
    
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
    
    // Call Telnyx API for available phone numbers (limit to 10)
    // Filter for reservable numbers only and exclude held numbers
    const telnyxUrl = `https://api.telnyx.com/v2/available_phone_numbers?filter[country_code]=US&filter[national_destination_code]=${areaCode}&filter[phone_number_type]=local&filter[reservable]=true&filter[exclude_held_numbers]=true&page[size]=10`;
    
    const telnyxResponse = await fetch(telnyxUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Accept': 'application/json'
      }
    });
    
    if (!telnyxResponse.ok) {
      const errorText = await telnyxResponse.text();
      console.error('Telnyx API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch available numbers' },
        { status: telnyxResponse.status }
      );
    }
    
    const data = await telnyxResponse.json();
    
    // Extract phone numbers from response
    const phoneNumbers = data.data?.map((item: any) => item.phone_number) || [];
    
    return NextResponse.json({
      numbers: phoneNumbers,
      count: phoneNumbers.length
    });
    
  } catch (error) {
    console.error('Error fetching available numbers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
