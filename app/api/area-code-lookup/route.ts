import { NextRequest, NextResponse } from 'next/server';

const BASE = 'https://api.telnyx.com/v2/available_phone_numbers';
const COMMON_PARAMS = 'filter[country_code]=US&filter[phone_number_type]=local&filter[reservable]=true&filter[exclude_held_numbers]=true&page[size]=5';

async function fetchByLocality(apiKey: string, city: string, state: string): Promise<string | null> {
  const url = `${BASE}?${COMMON_PARAMS}&filter[locality]=${encodeURIComponent(city)}&filter[administrative_area]=${encodeURIComponent(state)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' } });
  if (!res.ok) return null;
  const data = await res.json();
  const num = data.data?.[0]?.phone_number as string | undefined;
  if (!num) return null;
  // Extract NPA (area code) — Telnyx returns E.164 e.g. +12155551234
  const digits = num.replace(/\D/g, '');
  return digits.length >= 11 ? digits.slice(1, 4) : digits.slice(0, 3);
}

async function fetchByState(apiKey: string, state: string): Promise<string | null> {
  const url = `${BASE}?${COMMON_PARAMS}&filter[administrative_area]=${encodeURIComponent(state)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' } });
  if (!res.ok) return null;
  const data = await res.json();
  const num = data.data?.[0]?.phone_number as string | undefined;
  if (!num) return null;
  const digits = num.replace(/\D/g, '');
  return digits.length >= 11 ? digits.slice(1, 4) : digits.slice(0, 3);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const city = (searchParams.get('city') || '').trim();
    const state = (searchParams.get('state') || '').trim();

    if (!state) {
      return NextResponse.json({ error: 'state is required' }, { status: 400 });
    }

    const apiKey = process.env.Telnyx;
    if (!apiKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    let areaCode: string | null = null;

    // 1. Try city + state
    if (city) {
      areaCode = await fetchByLocality(apiKey, city, state);
    }

    // 2. Fall back to state only
    if (!areaCode) {
      areaCode = await fetchByState(apiKey, state);
    }

    if (!areaCode) {
      return NextResponse.json({ areaCode: null });
    }

    return NextResponse.json({ areaCode });
  } catch (error) {
    console.error('Area code lookup error:', error);
    return NextResponse.json({ areaCode: null });
  }
}
