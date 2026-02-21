import { NextResponse } from 'next/server';

// NOTE: Rate limiting handled by Cloudflare WAF Rate Limiting Rules
// See SECURITY_FIXES.md for setup instructions
// Rule: /api/smarty-autocomplete - 20 requests per 1 minute per IP

export async function GET(request: Request) {
  try {
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
    const smartyUrl = `https://us-autocomplete-pro.api.smarty.com/lookup?key=${smartyKey}&search=${encodeURIComponent(search)}`;
    
    // Add Referer header to satisfy domain restrictions
    const response = await fetch(smartyUrl, {
      headers: {
        'Referer': 'https://voiply.com/',
        'Origin': 'https://voiply.com'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Smarty API error:', response.status, errorText);
      return NextResponse.json({ suggestions: [] });
    }
    
    const data = await response.json();
    
    // Smarty API returns { suggestions: [...] } structure
    const formattedResponse = {
      suggestions: data.suggestions || []
    };
    
    // Cache at edge for 5 minutes (common searches will be instant)
    return NextResponse.json(formattedResponse, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
    
  } catch (error) {
    console.error('Smarty autocomplete error:', error);
    return NextResponse.json({ suggestions: [] });
  }
}
