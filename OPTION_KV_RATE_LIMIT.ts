import { NextResponse } from 'next/server';

// KV-based rate limiting
async function checkRateLimit(ip: string, kv: any): Promise<boolean> {
  const now = Date.now();
  const key = `ratelimit:smarty:${ip}`;
  
  try {
    const data = await kv.get(key, { type: 'json' });
    
    if (!data || now > data.resetTime) {
      // Reset limit every minute
      await kv.put(key, JSON.stringify({
        count: 1,
        resetTime: now + 60000
      }), {
        expirationTtl: 60 // Auto-delete after 60 seconds
      });
      return true;
    }
    
    if (data.count >= 20) {
      // Max 20 requests per minute per IP
      return false;
    }
    
    // Increment count
    await kv.put(key, JSON.stringify({
      count: data.count + 1,
      resetTime: data.resetTime
    }), {
      expirationTtl: 60
    });
    
    return true;
  } catch (error) {
    // Allow on error (fail open)
    console.error('Rate limit check failed:', error);
    return true;
  }
}

export async function GET(request: Request, { env }: any) {
  try {
    // Get KV namespace
    const kv = env.KV;
    
    if (!kv) {
      console.warn('KV namespace not available, skipping rate limit');
    }
    
    // Get client IP for rate limiting
    const ip = request.headers.get('cf-connecting-ip') || 
               request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    // Rate limiting (only if KV available)
    if (kv && !await checkRateLimit(ip, kv)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    
    if (!search || search.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }
    
    // Input validation - prevent injection
    if (search.length > 200) {
      return NextResponse.json(
        { error: 'Search query too long' },
        { status: 400 }
      );
    }
    
    const smartyKey = process.env.SMARTY_API || '243722902014375393';
    
    const response = await fetch(
      `https://us-autocomplete-pro.api.smarty.com/lookup?key=${smartyKey}&search=${encodeURIComponent(search)}`
    );
    
    if (!response.ok) {
      return NextResponse.json({ suggestions: [] });
    }
    
    const data = await response.json();
    
    // Cache at edge for 5 minutes (common searches will be instant)
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
    
  } catch (error) {
    console.error('Smarty autocomplete error:', error);
    return NextResponse.json({ suggestions: [] });
  }
}
