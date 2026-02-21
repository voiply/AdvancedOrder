import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    // Get D1 database from Cloudflare context
    let db;
    try {
      // @ts-ignore - OpenNext Cloudflare binding
      const { getCloudflareContext } = await import('@opennextjs/cloudflare');
      const context = getCloudflareContext();
      
      // Try both DATABASE and DB bindings - use whichever is an object
      // @ts-ignore
      const database = context?.env?.DATABASE;
      // @ts-ignore
      const db_binding = context?.env?.DB;
      
      if (typeof database === 'object' && database !== null) {
        db = database;
      } else if (typeof db_binding === 'object' && db_binding !== null) {
        db = db_binding;
      } else {
        db = database || db_binding;
      }
    } catch (error) {
      console.error('Failed to get Cloudflare context:', error);
    }
    
    if (!db) {
      console.error('D1 database not configured or not accessible');
      console.error('Make sure wrangler.json is configured and deployed to Webflow Cloud');
      return NextResponse.json(
        { 
          error: 'Database not configured',
          details: 'D1 binding not found. This endpoint only works on Webflow Cloud.'
        },
        { status: 500 }
      );
    }

    // Load session
    const session = await db
      .prepare('SELECT * FROM sessions WHERE id = ?')
      .bind(sessionId)
      .first();

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check if session expired
    const now = Date.now();
    if (session.expires_at < now) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 410 }
      );
    }

    // Transform D1 integers back to booleans
    const sessionData = {
      sessionId: session.id,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
      expiresAt: session.expires_at,
      
      // Contact Information
      firstName: session.first_name,
      lastName: session.last_name,
      email: session.email,
      mobileNumber: session.mobile_number,
      
      // Shipping Address
      address: session.address,
      address2: session.address2,
      addressComponents: {
        street: session.street,
        city: session.city,
        state: session.state,
        zipCode: session.zip_code
      },
      
      // Billing Address
      billingSameAsShipping: session.billing_same_as_shipping === 1,
      billingAddress: session.billing_address,
      billingAddress2: session.billing_address2,
      billingComponents: {
        street: session.billing_street,
        city: session.billing_city,
        state: session.billing_state,
        zipCode: session.billing_zip_code
      },
      
      // Phone Selection
      hasPhone: session.has_phone === null ? null : session.has_phone === 1,
      phoneNumber: session.phone_number,
      areaCode: session.area_code,
      selectedNewNumber: session.selected_new_number,
      canPort: session.can_port === 1,
      
      // Plan & Bundle Selection
      selectedPlan: session.selected_plan,
      selectedBundle: session.selected_bundle,
      ownDevice: session.own_device === 1,
      
      // Protection Plan
      protectionPlan: session.protection_plan === 1,
      protectionPlanTerm: session.protection_plan_term,
      
      // Online Fax & Internet
      onlineFax: session.online_fax === 1,
      hasInternet: session.has_internet === null || session.has_internet === undefined ? null : session.has_internet === 1,
      addInternetPackage: session.add_internet_package === 1,
      internetPackage: session.internet_package || 'phone-only',
      internetDevice: session.internet_device || 'rental',
      
      // Payment Information
      stripeCustomerId: session.stripe_customer_id,
      paymentIntentId: session.payment_intent_id,
      
      // Session Metadata
      currentStep: session.current_step,
      completed: session.completed === 1,
      orderPlaced: session.order_placed === 1
    };

    // Log event
    await db
      .prepare('INSERT INTO session_events (session_id, event_type, event_data, created_at) VALUES (?, ?, ?, ?)')
      .bind(sessionId, 'session_loaded', JSON.stringify({ step: session.current_step }), now)
      .run();

    return NextResponse.json({
      success: true,
      session: sessionData
    });

  } catch (error: any) {
    console.error('Error loading session:', error);
    return NextResponse.json(
      { error: 'Failed to load session', message: error.message },
      { status: 500 }
    );
  }
}
