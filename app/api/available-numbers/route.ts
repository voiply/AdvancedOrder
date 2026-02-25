import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const areaCode = searchParams.get('area_code');
    const numberType = searchParams.get('type') || 'local';
    const keyword = searchParams.get('keyword') || '';
    
    const telnyxApiKey = process.env.Telnyx;
    
    if (!telnyxApiKey) {
      console.error('Telnyx environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    let telnyxUrl = '';

    if (numberType === 'toll_free') {
      telnyxUrl = `https://api.telnyx.com/v2/available_phone_numbers?filter[country_code]=US&filter[phone_number_type]=toll_free&filter[reservable]=true&filter[exclude_held_numbers]=true&page[size]=10`;
      
      if (keyword.trim()) {
        telnyxUrl += `&filter[phone_number][contains]=${encodeURIComponent(keyword.trim())}`;
      }
    } else {
      if (!areaCode || areaCode.length !== 3) {
        return NextResponse.json(
          { error: 'Valid 3-digit area code is required for local numbers' },
          { status: 400 }
        );
      }
      
      telnyxUrl = `https://api.telnyx.com/v2/available_phone_numbers?filter[country_code]=US&filter[national_destination_code]=${areaCode}&filter[phone_number_type]=local&filter[reservable]=true&filter[exclude_held_numbers]=true&page[size]=10`;
      
      if (keyword.trim()) {
        telnyxUrl += `&filter[phone_number][contains]=${encodeURIComponent(keyword.trim())}`;
      }
    }
    
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
    const phoneNumbers = data.data?.map((item: any) => item.phone_number) || [];
    
    return NextResponse.json({
      numbers: phoneNumbers,
      count: phoneNumbers.length,
      type: numberType
    });
    
  } catch (error) {
    console.error('Error fetching available numbers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
