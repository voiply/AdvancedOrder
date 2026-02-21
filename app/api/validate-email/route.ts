import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ valid: false, reason: 'No email provided' }, { status: 400 });
    }

    const apiKey = process.env.Sendgrid_Email_Validation;
    if (!apiKey) {
      console.error('Sendgrid_Email_Validation env var not set');
      return NextResponse.json({ valid: true, fallback: true });
    }

    const response = await fetch('https://api.sendgrid.com/v3/validations/email', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, source: 'checkout' }),
    });

    if (!response.ok) {
      console.error('SendGrid validation API error:', response.status);
      return NextResponse.json({ valid: true, fallback: true });
    }

    const data = await response.json();
    const verdict = data?.result?.verdict;
    const score = data?.result?.score ?? 1;

    // Accept "Valid", reject "Invalid". Treat "Risky" as invalid if score < 0.5
    const valid = verdict === 'Valid' || (verdict === 'Risky' && score >= 0.5);

    return NextResponse.json({ valid, verdict, score });
  } catch (error) {
    console.error('Email validation error:', error);
    return NextResponse.json({ valid: true, fallback: true });
  }
}
