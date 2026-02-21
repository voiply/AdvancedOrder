import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json({ valid: false, reason: 'No phone provided' }, { status: 400 });
    }

    const apiKey = process.env.Telnyx;
    if (!apiKey) {
      console.error('Telnyx env var not set');
      return NextResponse.json({ valid: true, fallback: true });
    }

    // Normalize to E.164
    const digits = phone.replace(/\D/g, '');
    const e164 = digits.length === 10 ? `+1${digits}` : `+${digits}`;

    const response = await fetch(`https://api.telnyx.com/v2/number_lookup/${encodeURIComponent(e164)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Telnyx lookup API error:', response.status);
      return NextResponse.json({ valid: true, fallback: true });
    }

    const data = await response.json();
    const isValid = data?.data?.valid_number ?? true;

    return NextResponse.json({ valid: isValid });
  } catch (error) {
    console.error('Phone validation error:', error);
    return NextResponse.json({ valid: true, fallback: true });
  }
}
