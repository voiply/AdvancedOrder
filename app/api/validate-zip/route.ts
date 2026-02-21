import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { zip, country } = await request.json();

    if (!zip) {
      return NextResponse.json({ valid: false, error: 'No ZIP provided' });
    }

    // Format Canadian postal codes with space (CSI standard: "M5H 2N2")
    let formattedZip = zip.trim().toUpperCase();
    if (country === 'CA') {
      // Remove any existing spaces
      const cleanZip = formattedZip.replace(/\s/g, '');
      // Add space in middle: A1A1A1 -> A1A 1A1
      if (cleanZip.length === 6) {
        formattedZip = `${cleanZip.substring(0, 3)} ${cleanZip.substring(3)}`;
      }
    }

    // Minimal CSI request to test ZIP validity
    const testData = [{
      unique_id: 'zip_validation',
      account_number: '64c0e61a-5dbf-4a56-9d7d-515bb3406f3a',
      location_a: formattedZip,
      invoice_date: new Date().toISOString().split('T')[0].replace(/-/g, ''),
      record_type: 'S',
      product_code: 'V001',
      service_code: '7',
      charge_amount: 1.00,  // Minimal amount for testing
      units: 1,
      exempt_code: 'N',
      keep_record: false  // Don't keep this validation record
    }];

    const csiAuth = process.env.CSI || 'Vm8hJkwzck44eDI6';
    const csiApiUrl = 'https://tcw.csilongwood.com/api/batches';

    const response = await fetch(csiApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${csiAuth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    if (!response.ok) {
      // CSI API down - silently allow (no error to user)
      return NextResponse.json({ valid: true, silentFallback: true });
    }

    const data = await response.json();

    // Check for errors
    const errors = data.tax_data?.find((o: any) => o.hasOwnProperty('error'));
    if (errors) {
      return NextResponse.json({
        valid: false,
        error: errors.error,
        message: 'Invalid ZIP/postal code'
      });
    }

    // Check if any tax data returned
    const filteredItems = data.tax_data?.filter((o: any) => o.tax_amount) || [];
    if (filteredItems.length === 0) {
      return NextResponse.json({
        valid: false,
        message: country === 'CA' ? 'Postal code not found' : 'ZIP code not found'
      });
    }

    // Valid ZIP! Return location data
    return NextResponse.json({
      valid: true,
      city: filteredItems[0]?.city,
      state: filteredItems[0]?.state,
      jurisdiction: filteredItems[0]?.jurisdiction,
      formattedZip // Return formatted version for Canadian codes
    });

  } catch (error) {
    // Silent fallback if CSI is down - no error to user
    return NextResponse.json({ valid: true, silentFallback: true });
  }
}
