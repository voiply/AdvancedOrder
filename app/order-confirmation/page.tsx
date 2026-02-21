'use client';

import { useEffect, useState } from 'react';

const basePath = '/business-advanced-checkout';

export default function OrderConfirmation() {
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Mobile debug console — only loads when ?debug=1 is in the URL
    // Prevent back navigation
    window.history.pushState(null, '', window.location.href);
    const preventBack = () => window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', preventBack);

    // Load order details from localStorage (set by checkout page before redirect)
    try {
      const savedOrder = localStorage.getItem('lastOrder');
      if (savedOrder) {
        setOrderDetails(JSON.parse(savedOrder));
        localStorage.removeItem('lastOrder');
      }
    } catch (e) {
      console.error('Could not parse lastOrder from localStorage', e);
    }

    setLoaded(true);

    return () => window.removeEventListener('popstate', preventBack);
  }, []);

  const handleStartNewOrder = () => {
    localStorage.removeItem('voiply_session_id');
    sessionStorage.removeItem('voiply_exit_popup_shown');
    sessionStorage.removeItem('voiply_coupon_applied');
    window.location.href = basePath;
  };

  // Show nothing until client-side hydration is done (avoids SSR mismatch flash)
  if (!loaded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FEEBE6] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#F53900] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[#585858]">Loading your order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FEEBE6] to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12">

        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-center text-[#080808] mb-4">
          Thank You for Your Order!
        </h1>
        <p className="text-center text-lg text-[#585858] mb-8">
          Your order has been successfully placed and payment confirmed.
        </p>

        {/* Order Details */}
        {orderDetails && (
          <div className="bg-[#F9F9F9] rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-[#080808] mb-4">Order Summary</h2>
            <div className="space-y-0">
              {orderDetails.orderNumber && (
                <div className="flex justify-between py-2.5 border-b border-[#E8E8E8]">
                  <span className="text-sm text-[#585858]">Order Number</span>
                  <span className="text-sm font-medium text-[#080808]">{orderDetails.orderNumber}</span>
                </div>
              )}
              {orderDetails.phoneNumber && (
                <div className="flex justify-between py-2.5 border-b border-[#E8E8E8]">
                  <span className="text-sm text-[#585858]">Phone Number</span>
                  <span className="text-sm font-medium text-[#080808]">{orderDetails.phoneNumber}</span>
                </div>
              )}
              {orderDetails.plan && (
                <div className="flex justify-between py-2.5 border-b border-[#E8E8E8]">
                  <span className="text-sm text-[#585858]">Plan</span>
                  <span className="text-sm font-medium text-[#080808]">
                    {orderDetails.plan === 'annually' ? '1-Year Plan' : orderDetails.plan === '3month' ? '3-Month Plan' : '3-Year Plan'}
                  </span>
                </div>
              )}
              {orderDetails.bundle && (
                <div className="flex justify-between py-2.5 border-b border-[#E8E8E8]">
                  <span className="text-sm text-[#585858]">Device Bundle</span>
                  <span className="text-sm font-medium text-[#080808]">{orderDetails.bundle}</span>
                </div>
              )}
              {orderDetails.internetPackage && (
                <div className="flex justify-between py-2.5 border-b border-[#E8E8E8]">
                  <span className="text-sm text-[#585858]">Internet Package</span>
                  <span className="text-sm font-medium text-[#080808]">
                    {orderDetails.internetPackage === 'phone-only' ? 'Phone Only' : 'Unlimited 5G'}
                  </span>
                </div>
              )}
              {orderDetails.internetDevice && (
                <div className="flex justify-between py-2.5 border-b border-[#E8E8E8]">
                  <span className="text-sm text-[#585858]">Internet Device</span>
                  <span className="text-sm font-medium text-[#080808]">
                    {orderDetails.internetDevice === 'rental' ? 'Rental (+$15/mo)' : 'Purchase (+$199)'}
                  </span>
                </div>
              )}
              {orderDetails.address && (
                <div className="flex justify-between py-2.5 border-b border-[#E8E8E8]">
                  <span className="text-sm text-[#585858]">Shipping Address</span>
                  <span className="text-sm font-medium text-[#080808] text-right">
                    {orderDetails.address.street}<br />
                    {orderDetails.address.city}, {orderDetails.address.state} {orderDetails.address.zipCode}
                  </span>
                </div>
              )}
              {orderDetails.total && (
                <div className="flex justify-between pt-3 mt-1 border-t-2 border-[#333]">
                  <span className="font-bold text-[#080808]">Total Paid</span>
                  <span className="font-bold text-[#F53900]">
                    ${orderDetails.total}{orderDetails.country === 'CA' ? ' CAD' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* What's Next */}
        <div className="bg-[#FFF5F2] border-l-4 border-[#F53900] rounded p-4 mb-8">
          <h3 className="font-semibold text-[#080808] mb-2">What&apos;s Next?</h3>
          <ul className="text-sm text-[#585858] space-y-1">
            <li>• You will receive a confirmation email shortly</li>
            <li>• Your device will ship within 1–2 business days</li>
            {orderDetails?.internetPackage && (
              <li>• Your internet device will ship separately from a different location and may arrive at a different time</li>
            )}
            {orderDetails?.hasPhone === true ? (
              <>
                <li>• Your port request for {orderDetails.phoneNumber} has been submitted and is being processed. Most transfers complete within 3–5 business days.</li>
                <li>• You can track your port status and manage your request anytime in the customer portal</li>
              </>
            ) : orderDetails?.hasPhone === false ? (
              <li>• Your number {orderDetails.phoneNumber} will be activated within 24 hours</li>
            ) : (
              <li>• Track your order anytime in the customer portal</li>
            )}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <a
            href="https://business.voiply.com/portal-login"
            className="flex items-center justify-center w-full h-12 bg-[#F53900] text-white rounded-lg text-base font-medium hover:bg-[#d63300] transition-colors"
          >
            Log in to Customer Portal
          </a>
          <button
            onClick={handleStartNewOrder}
            className="w-full h-12 bg-white text-[#F53900] border-2 border-[#F53900] rounded-lg text-base font-medium hover:bg-[#FFF5F3] transition-colors"
          >
            Start a New Order
          </button>
        </div>

        <div className="text-center mt-8 text-sm text-[#666]">
          Need help? Call us at{' '}
          <a href="tel:8444864759" className="text-[#F53900] font-semibold hover:underline">
            (844) 486-4759
          </a>
        </div>
      </div>
    </div>
  );
}
