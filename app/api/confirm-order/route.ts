import { NextRequest, NextResponse } from 'next/server';

const N8N_WEBHOOK_URL = 'https://voiply.app.n8n.cloud/webhook/6aceed8e-b47d-4b24-84ac-8e948357fed6';
// Single attempt with a generous timeout.
// Retries caused duplicates — n8n often processes the request before timing out,
// so a retry sends a second webhook for the same order.
const TIMEOUT_MS = 25000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (res.ok) {
        console.log(`[confirm-order] n8n webhook delivered for order ${orderId}`);
        return NextResponse.json({ success: true });
      }

      // n8n returned a non-2xx — log it but do NOT retry (risk of duplicate)
      console.error(`[confirm-order] n8n returned ${res.status} for order ${orderId} — not retrying to avoid duplicates`);
      return NextResponse.json({ error: `n8n returned ${res.status}` }, { status: 502 });

    } catch (err: any) {
      clearTimeout(timeout);
      const isTimeout = err?.name === 'AbortError';
      console.error(`[confirm-order] n8n ${isTimeout ? 'timed out' : 'fetch error'} for order ${orderId} — not retrying to avoid duplicates:`, err);
      // Return 200 even on timeout — n8n likely received it, we just didn't get the response in time
      return NextResponse.json({ warning: isTimeout ? 'timeout — webhook likely delivered' : 'fetch error' }, { status: 200 });
    }

  } catch (err) {
    console.error('[confirm-order] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
