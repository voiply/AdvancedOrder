import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { zip, duration, hardwareAmount, support, telco, protection, extensions = 1, locations = 1, plan = '' } = body;

    // Validate inputs
    if (!zip || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields: zip, duration' },
        { status: 400 }
      );
    }

    // Map duration to months (matching Azure function)
    let monthsMultiplier = 1;
    if (duration === 'year') {
      monthsMultiplier = 12;
    } else if (duration === 'quarter') {
      monthsMultiplier = 3;
    } else if (duration === '3year') {
      monthsMultiplier = 36;
    }

    // Constants (matching Azure function)
    const callingTaxPercentage = 1;
    const serviceTaxPercentage = 1;
    let has911Surcharge = true;
    const currency = 'usd';
    
    const fees = {
      fee911: {
        usd: 1.50,
        cad: 2.16
      },
      feeRegulatory: {
        usd: 2.25,
        cad: 3.10
      }
    };

    let fee911 = fees.fee911[currency];
    let feeRegulatory = fees.feeRegulatory[currency];

    // Check plan type for 911 surcharge
    if (plan.toLowerCase().indexOf('advanced') > -1 || plan.toLowerCase().indexOf('starter') > -1) {
      has911Surcharge = false;
    }

    let chargeAmount = 0;
    const data_tax = [];
    const exempt_code = 'N';
    
    const datePeriod = new Date();
    const invoice_date = '' + datePeriod.getFullYear() + 
                        ("0" + (datePeriod.getMonth() + 1)).slice(-2) + 
                        ("0" + (datePeriod.getDate())).slice(-2);

    // Helper function to create tax request data (matching Azure function)
    const GetTaxRequestData = (amount: number, locs: number, exts: number, productCode: string, serviceCode: string, isHardware = false) => {
      const unique_id = `${productCode}_${Math.random().toString(36).substr(2, 9)}`;
      
      const template = {
        unique_id,
        account_number: '64c0e61a-5dbf-4a56-9d7d-515bb3406f3a',
        location_a: zip,
        invoice_date,
        record_type: 'S',
        product_code: productCode,
        service_code: serviceCode,
        charge_amount: amount * exts,
        units: locs,
        exempt_code,
        keep_record: true
      };

      const result = [];
      let _months = monthsMultiplier;
      
      if (isHardware) {
        _months = 1;
      }

      for (let i = 0; i < _months; i++) {
        const obj = { ...template };
        // Round to 2 decimals for CSI API (matching Azure function)
        obj.charge_amount = parseFloat(amount.toFixed(2));
        result.push(obj);
      }
      
      // Log first record for debugging
      if (result.length > 0) {
      }

      return result;
    };

    // Support services (C001-14)
    if (support && support > 0) {
      // Round to 2 decimals BEFORE GetTaxRequestData (matching Azure function)
      const tax_amount = parseFloat((support * callingTaxPercentage).toFixed(2));
      const data = GetTaxRequestData(tax_amount, 1, extensions, 'C001', '14');
      data_tax.push(...data);
      chargeAmount += tax_amount * extensions;
    }

    // Telco services (V001-7)
    if (telco && telco > 0) {
      // Round to 2 decimals BEFORE GetTaxRequestData (matching Azure function)
      const tax_amount = parseFloat((telco * callingTaxPercentage).toFixed(2));
      let quantity = locations || 1;
      
      const data = GetTaxRequestData(tax_amount, locations, extensions, 'V001', '7');
      data_tax.push(...data);

      // 911 Fee
      if (has911Surcharge) {
        // V001-19 for 911
        let data911 = GetTaxRequestData(0, locations, quantity, 'V001', '19');
        data_tax.push(...data911);

        // V001-15 for our fees
        data911 = GetTaxRequestData(fee911, locations, quantity, 'V001', '15');
        data_tax.push(...data911);
      }

      // Regulatory fee (V001-15)
      const dataReg = GetTaxRequestData(feeRegulatory, locations, extensions, 'V001', '15');
      data_tax.push(...dataReg);
      
      chargeAmount += tax_amount * extensions;
    }

    // Hardware (G001-2)
    if (hardwareAmount && hardwareAmount > 0) {
      // Keep full precision
      const tax_amount = hardwareAmount;
      const data = GetTaxRequestData(tax_amount, 1, 1, 'G001', '2', true);
      data_tax.push(...data);
      chargeAmount += tax_amount;
    }

    // Protection
    if (protection && protection > 0) {
      chargeAmount += protection;
    }


    if (chargeAmount === 0) {
      return NextResponse.json({
        submission_id: null,
        tax_data: [],
        estimatedTotalTax: 0,
        duration,
        zip,
        durationMonths: monthsMultiplier,
        hardwareAmount: 0,
        breakdown: {}
      });
    }

    // Get CSI credentials from environment
    const csiAuth = process.env.CSI || 'Vm8hJkwzck44eDI6';
    const csiApiUrl = 'https://tcw.csilongwood.com/api/batches';

    
    // Log first few support records
    const supportRecords = data_tax.filter(r => r.product_code === 'C001' && r.service_code === '14');
    if (supportRecords.length > 0) {
    }
    
    // Log first few telco records
    const telcoRecords = data_tax.filter(r => r.product_code === 'V001' && r.service_code === '7');
    if (telcoRecords.length > 0) {
    }

    // Call CSI API (matching Azure function)
    try {
      const csiResponse = await fetch(csiApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${csiAuth}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data_tax)
      });

      if (!csiResponse.ok) {
        // Fallback to 47% calculation
        const fallbackTax = chargeAmount * 0.47;
        return NextResponse.json({
          submission_id: null,
          tax_data: [{
            description: 'Estimated Tax (47%)',
            tax_amount: parseFloat(fallbackTax.toFixed(2)),
            hardwareTax: false
          }],
          estimatedTotalTax: parseFloat(fallbackTax.toFixed(2)),
          duration,
          zip,
          durationMonths: monthsMultiplier,
          hardwareAmount,
          breakdown: {
            'Estimated Tax (47%)': parseFloat(fallbackTax.toFixed(2))
          }
        });
      }

      const res = await csiResponse.json();
      
      // Check for errors
      const errors = res.tax_data?.find((o: any) => o.hasOwnProperty('error'));
      if (errors) {
        throw new Error(`Error fetching tax data: ${errors.error}`);
      }

      let filteredItems = res.tax_data?.filter((o: any) => o.tax_amount) || [];
      
      // If no tax data, retry with default zip 15219
      if (filteredItems.length === 0) {
        data_tax.forEach(o => o.location_a = '15219');
        const retryResponse = await fetch(csiApiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${csiAuth}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data_tax)
        });
        
        const retryRes = await retryResponse.json();
        filteredItems = retryRes.tax_data?.filter((o: any) => o.tax_amount) || [];
      }

      const submission_id = res.submission_id;

      // Process tax items (matching Azure function logic)
      const taxItems = filteredItems.map((item: any) => {
        const isHardwareTax = item.unique_id.indexOf('G001') > -1;
        return {
          description: item.description,
          exempt_amount: item.exempt_amount,
          fee: item.fee,
          initial_charge: item.initial_charge,
          is_exempt: item.is_exempt,
          percent_taxable: item.percent_taxable,
          tax_amount: item.tax_amount,
          tax_auth: item.tax_auth,
          tax_auth_id: item.tax_auth_id,
          tax_rate: item.tax_rate,
          unique_id: item.unique_id,
          isHardwareTax
        };
      });

      if (taxItems.length === 0) {
        return NextResponse.json({
          submission_id,
          tax_data: [],
          estimatedTotalTax: 0,
          duration,
          zip,
          durationMonths: monthsMultiplier,
          hardwareAmount,
          breakdown: {}
        });
      }

      // Group by hardware/services and round to 2 decimals for display
      const hardwareTaxBreakup = taxItems
        .filter((o: any) => o.isHardwareTax)
        .reduce((acc: any[], item: any) => {
          const existing = acc.find(x => x.description === item.description);
          if (existing) {
            existing.tax_amount += item.tax_amount;
          } else {
            acc.push({
              tax_amount: item.tax_amount,
              description: item.description,
              hardwareTax: true
            });
          }
          return acc;
        }, [])
        .map((item: any) => ({
          ...item,
          tax_amount: parseFloat(item.tax_amount.toFixed(2)) // Round to 2 decimals for display
        }));

      const servicesTaxBreakup = taxItems
        .filter((o: any) => !o.isHardwareTax)
        .reduce((acc: any[], item: any) => {
          const existing = acc.find(x => x.description === item.description);
          if (existing) {
            existing.tax_amount += item.tax_amount;
          } else {
            acc.push({
              tax_amount: item.tax_amount,
              description: item.description,
              hardwareTax: false
            });
          }
          return acc;
        }, [])
        .map((item: any) => ({
          ...item,
          tax_amount: parseFloat(item.tax_amount.toFixed(2)) // Round to 2 decimals for display
        }));

      const estimatedServiceTaxValue = servicesTaxBreakup.reduce((sum: number, o: any) => sum + o.tax_amount, 0);
      const estimatedHardwareTaxValue = hardwareTaxBreakup.reduce((sum: number, o: any) => sum + o.tax_amount, 0);
      
      const taxBreakup: any[] = [...servicesTaxBreakup, ...hardwareTaxBreakup];

      // Add 911 and Regulatory fees to breakdown (matching Azure logic)
      if (telco && telco > 0) {
        let quantity = extensions;
        const currency = 'usd';
        let feeRegulatory = fees.feeRegulatory[currency];
        let fee911 = fees.fee911[currency];

        if (has911Surcharge) {
          const e911Amount = duration !== 'month' 
            ? fee911 * monthsMultiplier * locations 
            : fee911 * locations;
          
          taxBreakup.push({
            description: 'Emergency 911 and Information Services Fee',
            tax_amount: parseFloat(e911Amount.toFixed(2)),
            hardwareTax: false
          });
        }

        const feeRegValue = duration !== 'month' 
          ? feeRegulatory * monthsMultiplier * quantity 
          : feeRegulatory * quantity;
        
        taxBreakup.push({
          description: 'Regulatory, Compliance and Intellectual Property Fee',
          tax_amount: parseFloat(feeRegValue.toFixed(2)),
          hardwareTax: false
        });
      }

      // Calculate total tax from complete breakdown (including 911 and Regulatory fees)
      const estimatedTotalTax = parseFloat(taxBreakup.reduce((sum: number, o: any) => sum + o.tax_amount, 0).toFixed(2));

      return NextResponse.json({
        submission_id,
        tax_data: taxBreakup,
        estimatedTotalTax,
        duration,
        zip,
        durationMonths: monthsMultiplier,
        hardwareAmount,
        breakdown: taxBreakup.reduce((acc: any, item: any) => {
          acc[item.description] = item.tax_amount;
          return acc;
        }, {})
      });

    } catch (error: any) {
      console.error('CSI API error:', error);
      // Fallback calculation
      const fallbackTax = chargeAmount * 0.47;
      return NextResponse.json({
        submission_id: null,
        tax_data: [{
          description: 'Estimated Tax (47%)',
          tax_amount: parseFloat(fallbackTax.toFixed(2)),
          hardwareTax: false
        }],
        estimatedTotalTax: parseFloat(fallbackTax.toFixed(2)),
        duration,
        zip,
        durationMonths: monthsMultiplier,
        hardwareAmount,
        breakdown: {
          'Estimated Tax (47%)': parseFloat(fallbackTax.toFixed(2))
        }
      });
    }
    
  } catch (error: any) {
    console.error('Tax calculation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
