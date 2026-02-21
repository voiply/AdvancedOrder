import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      firstName,
      lastName,
      email,
      mobileNumber,
      address,
      address2,
      addressComponents,
      billingSameAsShipping,
      billingAddress,
      billingAddress2,
      billingComponents,
      hasPhone,
      phoneNumber,
      areaCode,
      selectedNewNumber,
      canPort,
      selectedPlan,
      selectedBundle,
      ownDevice,
      protectionPlan,
      protectionPlanTerm,
      onlineFax,
      hasInternet,
      addInternetPackage,
      internetPackage,
      internetDevice,
      stripeCustomerId,
      paymentIntentId,
      currentStep,
      completed = false,
      orderPlaced = false
    } = body;

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
          details: 'D1 binding not found. This endpoint only works on Webflow Cloud.',
          sessionId: sessionId // Return session ID so frontend knows it was received
        },
        { status: 500 }
      );
    }

    const now = Date.now();
    const expiresAt = now + (30 * 24 * 60 * 60 * 1000); // 30 days

    // Check if session exists
    const existing = await db
      .prepare('SELECT id FROM sessions WHERE id = ?')
      .bind(sessionId)
      .first();

    if (existing) {
      // Update existing session
      await db
        .prepare(`
          UPDATE sessions SET
            updated_at = ?,
            first_name = ?,
            last_name = ?,
            email = ?,
            mobile_number = ?,
            address = ?,
            address2 = ?,
            street = ?,
            city = ?,
            state = ?,
            zip_code = ?,
            billing_same_as_shipping = ?,
            billing_address = ?,
            billing_address2 = ?,
            billing_street = ?,
            billing_city = ?,
            billing_state = ?,
            billing_zip_code = ?,
            has_phone = ?,
            phone_number = ?,
            area_code = ?,
            selected_new_number = ?,
            can_port = ?,
            selected_plan = ?,
            selected_bundle = ?,
            own_device = ?,
            protection_plan = ?,
            protection_plan_term = ?,
            online_fax = ?,
            has_internet = ?,
            add_internet_package = ?,
            internet_package = ?,
            internet_device = ?,
            stripe_customer_id = ?,
            payment_intent_id = ?,
            current_step = ?,
            completed = ?,
            order_placed = ?
          WHERE id = ?
        `)
        .bind(
          now,
          firstName || null,
          lastName || null,
          email || null,
          mobileNumber || null,
          address || null,
          address2 || null,
          addressComponents?.street || null,
          addressComponents?.city || null,
          addressComponents?.state || null,
          addressComponents?.zipCode || null,
          billingSameAsShipping ? 1 : 0,
          billingAddress || null,
          billingAddress2 || null,
          billingComponents?.street || null,
          billingComponents?.city || null,
          billingComponents?.state || null,
          billingComponents?.zipCode || null,
          hasPhone === null ? null : (hasPhone ? 1 : 0),
          phoneNumber || null,
          areaCode || null,
          selectedNewNumber || null,
          canPort ? 1 : 0,
          selectedPlan || null,
          selectedBundle || null,
          ownDevice ? 1 : 0,
          protectionPlan ? 1 : 0,
          protectionPlanTerm || null,
          onlineFax ? 1 : 0,
          hasInternet === null || hasInternet === undefined ? null : (hasInternet ? 1 : 0),
          addInternetPackage ? 1 : 0,
          internetPackage || 'phone-only',
          internetDevice || 'rental',
          stripeCustomerId || null,
          paymentIntentId || null,
          currentStep || 1,
          completed ? 1 : 0,
          orderPlaced ? 1 : 0,
          sessionId
        )
        .run();
    } else {
      // Create new session
      await db
        .prepare(`
          INSERT INTO sessions (
            id, created_at, updated_at, expires_at,
            first_name, last_name, email, mobile_number,
            address, address2, street, city, state, zip_code,
            billing_same_as_shipping, billing_address, billing_address2,
            billing_street, billing_city, billing_state, billing_zip_code,
            has_phone, phone_number, area_code, selected_new_number, can_port,
            selected_plan, selected_bundle, own_device,
            protection_plan, protection_plan_term,
            online_fax, has_internet, add_internet_package, internet_package, internet_device,
            stripe_customer_id, payment_intent_id,
            current_step, completed, order_placed
          ) VALUES (
            ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?,
            ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?,
            ?, ?, ?
          )
        `)
        .bind(
          sessionId,
          now,
          now,
          expiresAt,
          firstName || null,
          lastName || null,
          email || null,
          mobileNumber || null,
          address || null,
          address2 || null,
          addressComponents?.street || null,
          addressComponents?.city || null,
          addressComponents?.state || null,
          addressComponents?.zipCode || null,
          billingSameAsShipping ? 1 : 0,
          billingAddress || null,
          billingAddress2 || null,
          billingComponents?.street || null,
          billingComponents?.city || null,
          billingComponents?.state || null,
          billingComponents?.zipCode || null,
          hasPhone === null ? null : (hasPhone ? 1 : 0),
          phoneNumber || null,
          areaCode || null,
          selectedNewNumber || null,
          canPort ? 1 : 0,
          selectedPlan || null,
          selectedBundle || null,
          ownDevice ? 1 : 0,
          protectionPlan ? 1 : 0,
          protectionPlanTerm || null,
          onlineFax ? 1 : 0,
          hasInternet === null || hasInternet === undefined ? null : (hasInternet ? 1 : 0),
          addInternetPackage ? 1 : 0,
          internetPackage || 'phone-only',
          internetDevice || 'rental',
          
          stripeCustomerId || null,
          paymentIntentId || null,
          currentStep || 1,
          completed ? 1 : 0,
          orderPlaced ? 1 : 0
        )
        .run();
    }

    // Log event
    await db
      .prepare('INSERT INTO session_events (session_id, event_type, event_data, created_at) VALUES (?, ?, ?, ?)')
      .bind(sessionId, 'session_saved', JSON.stringify({ step: currentStep }), now)
      .run();

    return NextResponse.json({
      success: true,
      sessionId,
      message: existing ? 'Session updated' : 'Session created'
    });

  } catch (error: any) {
    console.error('Error saving session:', error);
    return NextResponse.json(
      { error: 'Failed to save session', message: error.message },
      { status: 500 }
    );
  }
}
