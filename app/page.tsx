'use client';

import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import LogRocket from 'logrocket';

// Base path from next.config.ts - must match the mount path in Webflow Cloud
const basePath = '/business-advanced-checkout';

// Types
interface AddressComponents {
  street: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
}

interface Phone {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  category: string;
  image: string;
  isFree?: boolean;
  learnMoreUrl?: string;
}

const PHONES: Phone[] = [
  {
    id: 'yealink-t31p',
    name: 'Yealink SIP-T31P',
    price: 0,
    originalPrice: 75,
    category: 'Desktop',
    image: 'https://cdn.prod.website-files.com/638501673ebc933690eb0762/6985e78c1ecff63dae1a12b3_yealinksip-t31p.avif',
    isFree: true,
    learnMoreUrl: '/business/phones/yealink-sip-t31p'
  },
  {
    id: 'yealink-t34w',
    name: 'Yealink SIP-T34W',
    price: 109.95,
    originalPrice: 139,
    category: 'Desktop',
    image: 'https://cdn.prod.website-files.com/638501673ebc933690eb0762/6985e7ec19b9ef0a6b00beb5_yealinksip-t34w.avif',
    learnMoreUrl: '/business/phones/yealink-sip-t34w'
  },
  {
    id: 'yealink-t44w',
    name: 'Yealink SIP-T44W',
    price: 169.95,
    originalPrice: 179,
    category: 'Desktop',
    image: 'https://cdn.prod.website-files.com/638501673ebc933690eb0762/6985e7353febd8edf89ef21b_yealinksip-t44w.avif',
    learnMoreUrl: '/business/phones/yealink-sip-t44w'
  },
  {
    id: 'yealink-t54w',
    name: 'Yealink SIP-T54W',
    price: 255.95,
    originalPrice: 279,
    category: 'Receptionist',
    image: 'https://cdn.prod.website-files.com/638501673ebc933690eb0762/6985e728332c98dd46be3535_yealinksip-t54w.avif',
    learnMoreUrl: '/business/phones/yealink-sip-t54w'
  },
  {
    id: 'yealink-t57w',
    name: 'Yealink SIP-T57W',
    price: 319.95,
    originalPrice: 359,
    category: 'Desktop',
    image: 'https://cdn.prod.website-files.com/638501673ebc933690eb0762/6985e72d05c573cd3ed62118_yealinksip-t57w.avif',
    learnMoreUrl: '/business/phones/yealink-sip-t57w'
  },
  {
    id: 'yealink-t73w',
    name: 'Yealink SIP Phone T73W',
    price: 129.99,
    originalPrice: 129.99,
    category: 'Desktop',
    image: 'https://cdn.prod.website-files.com/638501673ebc933690eb0762/6985e79275fbf7b0160a4450_yealinksipphonet73w.avif',
    learnMoreUrl: '/business/phones/yealink-sip-phone-t73w'
  },
  {
    id: 'yealink-t74w',
    name: 'Yealink SIP Phone T74W',
    price: 174.99,
    originalPrice: 174.99,
    category: 'Desktop',
    image: 'https://cdn.prod.website-files.com/638501673ebc933690eb0762/6985e758d6f2d9eb7b05f047_yealinksipphonet74w.avif',
    learnMoreUrl: '/business/phones/yealink-sip-phone-t74w'
  },
  {
    id: 'yealink-t85w',
    name: 'Yealink SIP Phone T85W',
    price: 192.99,
    originalPrice: 192.99,
    category: 'Desktop',
    image: 'https://cdn.prod.website-files.com/638501673ebc933690eb0762/6985e75191c7da4a85d09eb8_yealinksipphonet85w.avif',
    learnMoreUrl: '/business/phones/yealink-sip-phone-t85w'
  },
  {
    id: 'yealink-w76',
    name: 'Yealink W76',
    price: 170.95,
    originalPrice: 189,
    category: 'Cordless',
    image: 'https://cdn.prod.website-files.com/638501673ebc933690eb0762/6985e81d51952c9a9db762e2_yealinkw76.avif',
    learnMoreUrl: '/business/phones/yealink-w76'
  },
  {
    id: 'yealink-wh62',
    name: 'Yealink WH62',
    price: 171.95,
    originalPrice: 219,
    category: 'Headset',
    image: 'https://cdn.prod.website-files.com/638501673ebc933690eb0762/6985e7e80bb0da0b69873991_yealinkwh62.avif',
    learnMoreUrl: '/business/phones/yealink-wh62'
  },
  {
    id: 'yealink-ax83h',
    name: 'Yealink AX83H Wi-Fi Handset',
    price: 117.99,
    originalPrice: 117.99,
    category: 'Handset',
    image: 'https://cdn.prod.website-files.com/638501673ebc933690eb0762/6985e763996d4561ba35f0df_yealinkax83hwi-fihandset.avif',
    learnMoreUrl: '/business/phones/yealink-ax83h-wi-fi-handset'
  },
  {
    id: 'grandstream-ht801',
    name: 'Grandstream HT801',
    price: 0,
    originalPrice: 49,
    category: 'Analog Adapter',
    image: 'https://cdn.prod.website-files.com/638501673ebc933690eb0762/6985e817aeeb4ed2aab3db4b_grandstreamht801.avif',
    isFree: true,
    learnMoreUrl: '/business/phones/grandstream-ht801'
  }
];

// US States
const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'District of Columbia' }
];

// Canadian Provinces
const CANADIAN_PROVINCES = [
  { code: 'AB', name: 'Alberta' },
  { code: 'BC', name: 'British Columbia' },
  { code: 'MB', name: 'Manitoba' },
  { code: 'NB', name: 'New Brunswick' },
  { code: 'NL', name: 'Newfoundland and Labrador' },
  { code: 'NS', name: 'Nova Scotia' },
  { code: 'ON', name: 'Ontario' },
  { code: 'PE', name: 'Prince Edward Island' },
  { code: 'QC', name: 'Quebec' },
  { code: 'SK', name: 'Saskatchewan' },
  { code: 'NT', name: 'Northwest Territories' },
  { code: 'NU', name: 'Nunavut' },
  { code: 'YT', name: 'Yukon' }
];

export default function Home() {
  // Initialize LogRocket
  LogRocket.init('uyjcld/advanced-checkout');


  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1: Address & Phone
  const [address, setAddress] = useState('');
  const [address2, setAddress2] = useState('');
  const [manualAddressEntry, setManualAddressEntry] = useState(false);
  const [country, setCountry] = useState('US'); // US or CA
  const [addressComponents, setAddressComponents] = useState<AddressComponents>({
    street: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [hasPhone, setHasPhone] = useState<boolean | null>(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneValidated, setPhoneValidated] = useState(false);
  const [phoneValidating, setPhoneValidating] = useState(false);
  const [phoneErrorMessage, setPhoneErrorMessage] = useState('');
  const [canPort, setCanPort] = useState(false);
  const [hasInternet, setHasInternet] = useState<boolean | null>(null);
  
  // Step 2: Business Needs Assessment
  const [numUsers, setNumUsers] = useState('1');
  const [callMethod, setCallMethod] = useState('');
  const [numLocations, setNumLocations] = useState('');
  const [highCallVolume, setHighCallVolume] = useState('');
  const [needCallRecording, setNeedCallRecording] = useState('');
  
  // Step 3: New Number Selection (only if hasPhone === false)
  const [areaCode, setAreaCode] = useState('412');
  const [availableNumbers, setAvailableNumbers] = useState<string[]>([]);
  const [loadingNumbers, setLoadingNumbers] = useState(false);
  const [selectedNewNumber, setSelectedNewNumber] = useState('');
  const [numberType, setNumberType] = useState<'local' | 'toll_free'>('local');
  const [numberKeyword, setNumberKeyword] = useState('');
  const [reservingNumber, setReservingNumber] = useState(false);
  const [reservationError, setReservationError] = useState('');
  const [beginCheckoutFired, setBeginCheckoutFired] = useState(false);
  const [hubspotLeadFired, setHubspotLeadFired] = useState(false);
  
  // ZIP validation state
  const [zipFromAutocomplete, setZipFromAutocomplete] = useState(false);
  const [zipValidating, setZipValidating] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ address?: string; hasPhone?: string; phoneNumber?: string; hasInternet?: string }>({});
  const [step5Errors, setStep5Errors] = useState<{ firstName?: string; lastName?: string; email?: string; mobileNumber?: string; card?: string }>({});
  const [emailValidated, setEmailValidated] = useState<boolean | null>(null); // null=unchecked, true=valid, false=invalid
  const [emailValidating, setEmailValidating] = useState(false);
  const [mobileValidated, setMobileValidated] = useState<boolean | null>(null);
  const [mobileValidating, setMobileValidating] = useState(false);
  const [zipError, setZipError] = useState('');
  const [zipHint, setZipHint] = useState('');
  
  // Step 4: Plan Selection
  const [selectedPhones, setSelectedPhones] = useState<{[phoneId: string]: number}>({});
  const [selectedPlan, setSelectedPlan] = useState<'3month' | 'annually' | '3year'>('annually');
  const [ownDevice, setOwnDevice] = useState(0);
  
  // Step 5: Payment
  const [smartyLoaded, setSmartyLoaded] = useState(false);
  const [smartySuggestions, setSmartySuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [stripe, setStripe] = useState<any>(null);
  const [elements, setElements] = useState<any>(null);
  const [paymentElement, setPaymentElement] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');
  const [loadingPaymentIntent, setLoadingPaymentIntent] = useState(false);
  const [paymentError, setPaymentError] = useState<{ type: 'card' | 'auth' | 'generic'; message: string; code?: string } | null>(null);
  const [stripeCustomerId, setStripeCustomerId] = useState<string>('');
  const [paymentElementError, setPaymentElementError] = useState(false);
  const [paymentElementReady, setPaymentElementReady] = useState(false);
  
  // Session Management
  const [sessionId, setSessionId] = useState<string>('');
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [savingSession, setSavingSession] = useState(false);
  
  // Billing address
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billingAddress, setBillingAddress] = useState('');
  const [billingAddress2, setBillingAddress2] = useState('');
  const [billingCountry, setBillingCountry] = useState('US'); // US or CA
  const [billingComponents, setBillingComponents] = useState<AddressComponents>({
    street: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [billingSuggestions, setBillingSuggestions] = useState<any[]>([]);
  const [showBillingSuggestions, setShowBillingSuggestions] = useState(false);
  const [editingShipping, setEditingShipping] = useState(false);
  const [tempAddress, setTempAddress] = useState('');
  const [tempAddress2, setTempAddress2] = useState('');
  const [tempAddressComponents, setTempAddressComponents] = useState<AddressComponents>({
    street: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [tempSuggestions, setTempSuggestions] = useState<any[]>([]);
  const [showTempSuggestions, setShowTempSuggestions] = useState(false);
  
  // Protection Plan removed - not needed for business
  
  // Internet Package (when hasInternet === false)
  const [addInternetPackage, setAddInternetPackage] = useState(false);
  
  // Automatically enable internet package when user selects "no internet"
  useEffect(() => {
    if (hasInternet === false) {
      setAddInternetPackage(true);
    } else {
      setAddInternetPackage(false);
    }
  }, [hasInternet]);
  const [internetPackage, setInternetPackage] = useState('phone-only');
  const [internetDevice, setInternetDevice] = useState('rental');
  
  // Online Fax
  const [onlineFax, setOnlineFax] = useState(false);
  
  // Exit intent popup
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [exitPopupShown, setExitPopupShown] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponEmail, setCouponEmail] = useState('');
  const [couponEmailError, setCouponEmailError] = useState('');
  const [couponEmailValidating, setCouponEmailValidating] = useState(false);
  
  // Customer Information
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  
  // Tax breakdown - Multi-entry cache
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [showManagedPhoneModal, setShowManagedPhoneModal] = useState(false);
  const [taxBreakdown, setTaxBreakdown] = useState<any>(null);
  const [loadingTax, setLoadingTax] = useState(false);
  const [taxError, setTaxError] = useState('');
  const [calculatedTaxAmount, setCalculatedTaxAmount] = useState<number | null>(null);
  const [csiSubmissionId, setCsiSubmissionId] = useState<string>('');
  const [taxCache, setTaxCache] = useState<Record<string, any>>({}); // Multi-entry cache: { cacheKey: taxData }
  
  const addressInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const bundleScrollRef = useRef<HTMLDivElement>(null);
  const hasPhoneRef = useRef<HTMLDivElement>(null);
  const phoneNumberRef = useRef<HTMLInputElement>(null);
  const hasInternetRef = useRef<HTMLDivElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const mobileNumberRef = useRef<HTMLInputElement>(null);
  const paymentElementRef = useRef<HTMLDivElement>(null);
  
  // Initialize session on page load
  useEffect(() => {
    const initializeSession = async () => {
      if (typeof window === 'undefined') return;
      
      // ── 3D Secure redirect-back handling ──────────────────────────────────
      // When Stripe 3DS requires a full page redirect, it returns the user here
      // with payment_intent_client_secret and redirect_status in the URL.
      const urlParams = new URLSearchParams(window.location.search);
      const redirectStatus = urlParams.get('redirect_status');
      const returnedPaymentIntent = urlParams.get('payment_intent');
      if (redirectStatus && returnedPaymentIntent) {
        if (redirectStatus === 'succeeded') {
          // Payment + 3DS succeeded — forward to confirmation page
          localStorage.removeItem('voiply_session_id');
          window.location.href = `${basePath}/order-confirmation?payment_intent=${returnedPaymentIntent}`;
          return;
        } else {
          // 3DS failed or was cancelled — show friendly error and clean URL
          setPaymentError({
            type: 'auth',
            message: redirectStatus === 'requires_payment_method'
              ? 'Your bank could not verify your card. Please try again with a different card.'
              : 'Authentication was not completed. Please try again.',
          });
          setCurrentStep(5);
          // Strip Stripe params from URL without reloading
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.delete('payment_intent');
          cleanUrl.searchParams.delete('payment_intent_client_secret');
          cleanUrl.searchParams.delete('redirect_status');
          window.history.replaceState({}, '', cleanUrl.toString());
        }
      }
      // ──────────────────────────────────────────────────────────────────────

      // ── Handle 3DS error redirect from order-confirmation page ────────────
      const threeDsError = urlParams.get('3ds_error');
      if (threeDsError) {
        setPaymentError({ type: 'auth', message: decodeURIComponent(threeDsError) });
        setCurrentStep(5);
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete('3ds_error');
        window.history.replaceState({}, '', cleanUrl.toString());
      }
      // ──────────────────────────────────────────────────────────────────────

      // Check URL for session ID
      const urlSessionId = urlParams.get('session');
      
      // Check localStorage for stored session ID
      const storedSessionId = localStorage.getItem('voiply_session_id');
      
      // Priority: URL session > localStorage session > New session
      const sessionIdToLoad = urlSessionId || storedSessionId;
      
      if (sessionIdToLoad) {
        // Try to load existing session
        try {
          const response = await fetch(`${basePath}/api/session/load?id=${sessionIdToLoad}`);
          
          if (response.ok) {
            const data = await response.json();
            const session = data.session;
            
            // Restore all session data
            setSessionId(session.sessionId);
            setFirstName(session.firstName || '');
            setLastName(session.lastName || '');
            setEmail(session.email || '');
            setMobileNumber(session.mobileNumber || '');
            setAddress(session.address || '');
            setAddress2(session.address2 || '');
            setCountry(session.country || 'US');
            setAddressComponents(session.addressComponents);
            setBillingSameAsShipping(session.billingSameAsShipping);
            setBillingAddress(session.billingAddress || '');
            setBillingAddress2(session.billingAddress2 || '');
            setBillingCountry(session.billingCountry || 'US');
            setBillingComponents(session.billingComponents);
            setHasPhone(session.hasPhone);
            setPhoneNumber(session.phoneNumber || '');
            setAreaCode(session.areaCode || '412');
            setSelectedNewNumber(session.selectedNewNumber || '');
            if (session.numberType) setNumberType(session.numberType);
            setCanPort(session.canPort);
            setSelectedPlan(session.selectedPlan || 'annually');
            if (session.selectedPhones) setSelectedPhones(session.selectedPhones);
            setOwnDevice(typeof session.ownDevice === 'boolean' ? (session.ownDevice ? 1 : 0) : (session.ownDevice || 0));
            setOnlineFax(session.onlineFax || false);
            if (session.hasInternet !== undefined) setHasInternet(session.hasInternet);
            if (session.addInternetPackage !== undefined) setAddInternetPackage(session.addInternetPackage);
            setInternetPackage(session.internetPackage || 'phone-only');
            setInternetDevice(session.internetDevice || 'rental');
            setStripeCustomerId(session.stripeCustomerId || '');
            if (session.numUsers) setNumUsers(session.numUsers);
            if (session.callMethod) setCallMethod(session.callMethod);
            if (session.numLocations) setNumLocations(session.numLocations);
            if (session.highCallVolume) setHighCallVolume(session.highCallVolume);
            if (session.needCallRecording) setNeedCallRecording(session.needCallRecording);
            setCurrentStep(session.currentStep || 1);
            
            // Save to localStorage
            localStorage.setItem('voiply_session_id', session.sessionId);
            
            // Update URL if not already there
            if (!urlSessionId) {
              updateURLWithSession(session.sessionId);
            }
            
            setSessionLoaded(true);
            
            if (storedSessionId && !urlSessionId) {
            } else {
            }
          } else if (response.status === 404 || response.status === 410) {
            // Session not found or expired, create new one
            const newSessionId = generateSessionId();
            setSessionId(newSessionId);
            localStorage.setItem('voiply_session_id', newSessionId);
            updateURLWithSession(newSessionId);
            setSessionLoaded(true);
          }
        } catch (error) {
          console.error('Error loading session:', error);
          // Create new session on error
          const newSessionId = generateSessionId();
          setSessionId(newSessionId);
          localStorage.setItem('voiply_session_id', newSessionId);
          updateURLWithSession(newSessionId);
          setSessionLoaded(true);
        }
      } else {
        // No session ID in URL or localStorage, create new one
        const newSessionId = generateSessionId();
        setSessionId(newSessionId);
        localStorage.setItem('voiply_session_id', newSessionId);
        updateURLWithSession(newSessionId);
        setSessionLoaded(true);
      }
    };
    
    initializeSession();
  }, []);
  
  // Check URL for coupon parameter and auto-apply
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const couponParam = urlParams.get('coupon');
    
    // If coupon=get1free in URL, auto-apply the promotion
    if (couponParam === 'get1free' && !couponApplied) {
      
      // Switch to 3-month plan
      setSelectedPlan('3month');
      setCouponApplied(true);
      
      // Save to sessionStorage to persist across page reloads
      sessionStorage.setItem('voiply_coupon_applied', 'true');
      
      // GTM tracking
      if ((window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: 'coupon_activated',
          coupon_type: '1_month_free',
          coupon_source: 'url_parameter',
          coupon_value: 11.95
        });
      }
    }
  }, []);
  
  // Initialize exit popup state from sessionStorage (persist across page reloads)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const hasShownPopup = sessionStorage.getItem('voiply_exit_popup_shown');
    const hasCoupon = sessionStorage.getItem('voiply_coupon_applied');
    
    if (hasShownPopup === 'true') {
      setExitPopupShown(true);
    }
    
    if (hasCoupon === 'true') {
      setCouponApplied(true);
      // Also set plan to 3-month since coupon only works with 3-month plan
      setSelectedPlan('3month');
    }
  }, []);
  
  // Detect country based on IP address (only for new sessions)
  useEffect(() => {
    const detectCountry = async () => {
      // Only detect on initial load, not when restoring a session
      if (typeof window === 'undefined' || !sessionLoaded) return;
      
      // Don't override if user came from a saved session with country already set
      const urlParams = new URLSearchParams(window.location.search);
      const urlSessionId = urlParams.get('session');
      const storedSessionId = localStorage.getItem('voiply_session_id');
      
      // If we loaded from URL or localStorage session, don't auto-detect (preserve user's choice)
      if (urlSessionId || storedSessionId) return;
      
      try {
        // Use ipapi.co for free IP geolocation
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok) {
          const data = await response.json();
          const countryCode = data.country_code; // Returns 'US', 'CA', etc.
          
          
          // Only set if US or Canada
          if (countryCode === 'CA') {
            setCountry('CA');
          } else {
            // Default to US for all other countries
            setCountry('US');
          }
        }
      } catch (error) {
        // Silently fail and keep default US
      }
    };
    
    detectCountry();
  }, [sessionLoaded]);
  
  // Helper function to generate session ID
  const generateSessionId = () => {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };
  
  // Helper function to update URL with session ID
  const updateURLWithSession = (sid: string) => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set('session', sid);
    window.history.replaceState({}, '', url.toString());
  };
  
  // Helper function to clear session (for starting fresh or after order completion)
  const clearSession = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('voiply_session_id');
    const url = new URL(window.location.href);
    url.searchParams.delete('session');
    window.history.replaceState({}, '', url.toString());
  };
  
  // Save session periodically
  useEffect(() => {
    if (!sessionId || !sessionLoaded) return;
    
    const saveSession = async () => {
      if (savingSession) return; // Prevent concurrent saves
      
      setSavingSession(true);
      try {
        const response = await fetch(`${basePath}/api/session/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            firstName,
            lastName,
            email,
            mobileNumber,
            address,
            address2,
            country,
            addressComponents,
            billingSameAsShipping,
            billingAddress,
            billingAddress2,
            billingCountry,
            billingComponents,
            hasPhone,
            phoneNumber,
            areaCode,
            selectedNewNumber,
            numberType,
            canPort,
            selectedPlan,
            selectedPhones,
            ownDevice,
            onlineFax,
            hasInternet,
            addInternetPackage,
            internetPackage,
            internetDevice,
            stripeCustomerId,
            paymentIntentId,
            numUsers,
            callMethod,
            numLocations,
            highCallVolume,
            needCallRecording,
            currentStep
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          console.error('Session save failed:', data);
          console.error('Status:', response.status);
          console.error('Error details:', data.error, data.details);
        } else {
        }
      } catch (error) {
        console.error('Error saving session:', error);
      } finally {
        setSavingSession(false);
      }
    };
    
    // Save immediately on major state changes
    saveSession();
    
  }, [sessionId, sessionLoaded, currentStep, firstName, lastName, email, mobileNumber, 
      address, country, addressComponents, billingSameAsShipping, billingAddress, billingCountry, billingComponents,
      hasPhone, phoneNumber, areaCode, selectedNewNumber, numberType, selectedPlan, selectedPhones, 
      ownDevice, onlineFax,
      hasInternet, addInternetPackage, internetPackage, internetDevice, stripeCustomerId,
      numUsers, callMethod, numLocations, highCallVolume, needCallRecording]);
  
  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
          addressInputRef.current && !addressInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Smarty autocomplete - direct API call (voiply.com added to allowed domains)
  const handleAddressChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);
    
    // Set street component for manual entry (both US and Canada)
    if (value.length > 0) {
      setAddressComponents(prev => ({
        ...prev,
        street: value
      }));
    } else {
      // Clear street if address is empty
      setAddressComponents(prev => ({
        ...prev,
        street: ''
      }));
    }
    
    // Skip Smarty lookup for Canada - allow manual entry
    if (country === 'CA') {
      return;
    }
    
    if (value.length < 3) {
      setShowSuggestions(false);
      setSmartySuggestions([]);
      return;
    }
    
    try {
      // Smarty autocomplete via secure proxy
      const response = await fetch(
        `${basePath}/api/smarty-autocomplete?search=${encodeURIComponent(value)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        // Safely access suggestions with fallback
        const suggestions = Array.isArray(data?.suggestions) ? data.suggestions : [];
        
        setSmartySuggestions(suggestions);
        if (suggestions.length > 0) {
          setShowSuggestions(true);
        }
      } else {
        console.error('Smarty API error:', response.status);
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
    }
  };
  
  const selectSuggestion = (suggestion: any) => {
    const fullAddress = `${suggestion.street_line}, ${suggestion.city}, ${suggestion.state} ${suggestion.zipcode}`;
    setAddress(fullAddress);
    setAddressComponents({
      street: suggestion.street_line,
      city: suggestion.city,
      state: suggestion.state,
      zipCode: suggestion.zipcode
    });
    setShowSuggestions(false);
    setZipFromAutocomplete(true); // Mark as from autocomplete
    setZipError(''); // Clear any errors
  };
  
  // Validate ZIP/postal code using CSI API (only for manually entered codes)
  const validateZipCode = async (zip: string) => {
    // Skip if empty or from autocomplete
    if (!zip || zipFromAutocomplete) {
      return true;
    }

    // Quick format check first (instant feedback)
    const formatValid = country === 'US' 
      ? /^\d{5}$/.test(zip)
      : /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i.test(zip);
    
    if (!formatValid) {
      setZipError(country === 'US' ? 'ZIP must be 5 digits' : 'Invalid postal code format');
      return false;
    }

    // CSI validation
    setZipValidating(true);
    setZipError('');
    setZipHint('');
    
    try {
      const response = await fetch(`${basePath}/api/validate-zip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zip, country })
      });
      
      const data = await response.json();
      
      if (!data.valid) {
        // Invalid ZIP from CSI
        setZipError(data.message || (country === 'US' ? 'ZIP code not found' : 'Postal code not found'));
        setZipValidating(false);
        return false;
      }
      
      // Valid! Show city/state confirmation if available
      if (data.city && data.state && !data.silentFallback) {
        setZipHint(`✓ ${data.city}, ${data.state}`);
      }
      
      // Update with formatted Canadian postal code if provided
      if (data.formattedZip && country === 'CA') {
        setAddressComponents(prev => ({ ...prev, zipCode: data.formattedZip }));
      }
      
      setZipValidating(false);
      return true;
      
    } catch (error) {
      // Silent fallback if CSI is down - no error to user
      setZipValidating(false);
      return true;
    }
  };
  
  // Create Payment Intent when reaching Step 5
  useEffect(() => {
    const createPaymentIntent = async () => {
      if (currentStep === 5 && !clientSecret && !loadingPaymentIntent) {
        setLoadingPaymentIntent(true);
        
        try {
          // Calculate total amount
          const planPrice = getPlanPrice();
          const planPriceForTax = getPlanPriceForTax(); // For tax calc (full price even with coupon)
          const devicePrice = getPhoneHardwarePrice();
          const protectionPrice = 0;
          const shippingCost = getShippingCost();
          const currency = country === 'CA' ? 'cad' : 'usd';
          
          // Calculate internet (NOT taxed)
          let internetPrice = 0;
          if (hasInternet === false && addInternetPackage) {
            const packagePrices: { [key: string]: number } = {
              'phone-only': 16.95,
              'unlimited-5g': 84.95
            };
            const packagePrice = packagePrices[internetPackage] || 16.95;
            const deviceCost = internetDevice === 'rental' ? 15 : 199;
            internetPrice = packagePrice + deviceCost;
          }
          
          // Tax phone service, device, protection, and shipping (NOT internet)
          // Use planPriceForTax to charge tax on all 3 months even if 1 month is free with coupon
          const managedDeskPhonePrice = getManagedDeskPhonePriceForTax();
            const taxableSubtotal = planPriceForTax + devicePrice + managedDeskPhonePrice + protectionPrice + shippingCost;
          const taxes = taxableSubtotal * 0.47;
          // Add internet AFTER taxes (internet is not taxed)
          const total = taxableSubtotal + taxes + internetPrice;
          
          // Prepare customer details for lookup/creation
          const customerAddress = billingSameAsShipping ? {
            line1: addressComponents.street,
            line2: address2 || '',
            city: addressComponents.city,
            state: addressComponents.state,
            postal_code: addressComponents.zipCode,
            country: country === 'CA' ? 'CA' : 'US'
          } : {
            line1: billingComponents.street,
            line2: billingAddress2 || '',
            city: billingComponents.city,
            state: billingComponents.state,
            postal_code: billingComponents.zipCode,
            country: billingCountry === 'CA' ? 'CA' : 'US'
          };
          
          // Call our API to create payment intent with customer
          const response = await fetch(`${basePath}/api/create-payment-intent`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: total,
              currency: currency,
              email: email || '',
              name: `${firstName} ${lastName}`.trim(),
              phone: mobileNumber || '',
              address: customerAddress,
              submission_id: csiSubmissionId || '',
              plan: selectedPlan
            })
          });
          
          if (!response.ok) {
            throw new Error('Failed to create payment intent');
          }
          
          const data = await response.json();
          setClientSecret(data.clientSecret);
          setPaymentIntentId(data.paymentIntentId);
          if (data.customerId) {
            setStripeCustomerId(data.customerId);
          }
          
        } catch (error) {
          console.error('Error creating payment intent:', error);
          setLoadingPaymentIntent(false);
        }
      }
    };
    
    createPaymentIntent();
  }, [currentStep, clientSecret, loadingPaymentIntent]);
  
  // Update Payment Intent when pricing changes
  useEffect(() => {
    const updatePaymentIntent = async () => {
      if (currentStep === 5 && paymentIntentId && !loadingPaymentIntent) {
        try {
          // Calculate total amount
          const planPrice = getPlanPrice();
          const planPriceForTax = getPlanPriceForTax(); // For tax calc (full price even with coupon)
          const devicePrice = getPhoneHardwarePrice();
          const protectionPrice = 0;
          const shippingCost = getShippingCost();
          
          // Calculate internet (NOT taxed)
          let internetPrice = 0;
          if (hasInternet === false && addInternetPackage) {
            const packagePrices: { [key: string]: number } = {
              'phone-only': 16.95,
              'unlimited-5g': 84.95
            };
            const packagePrice = packagePrices[internetPackage] || 16.95;
            const deviceCost = internetDevice === 'rental' ? 15 : 199;
            internetPrice = packagePrice + deviceCost;
          }
          
          // Tax phone service, device, protection, and shipping (NOT internet)
          // Use planPriceForTax to charge tax on all 3 months even if 1 month is free with coupon
          const managedDeskPhonePrice = getManagedDeskPhonePriceForTax();
            const taxableSubtotal = planPriceForTax + devicePrice + managedDeskPhonePrice + protectionPrice + shippingCost;
          const taxes = taxableSubtotal * 0.47;
          // Add internet AFTER taxes (internet is not taxed)
          const total = taxableSubtotal + taxes + internetPrice;
          
          
          // Update payment intent with new amount
          const response = await fetch(`${basePath}/api/update-payment-intent`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentIntentId,
              amount: total,
              submission_id: csiSubmissionId || '',
              plan: selectedPlan
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Failed to update payment intent:', errorData);
          } else {
            const data = await response.json();
          }
          
        } catch (error) {
          console.error('Error updating payment intent:', error);
        }
      }
    };
    
    updatePaymentIntent();
  }, [currentStep, paymentIntentId, selectedPlan, selectedPhones, ownDevice, hasInternet, addInternetPackage, internetPackage, internetDevice, onlineFax]);
  
  // Clean up Stripe when leaving Step 5
  useEffect(() => {
    if (currentStep !== 5 && stripe) {
      setStripe(null);
      setElements(null);
      setPaymentElement(null);
      setPaymentElementReady(false);
      setCardComplete(false);
    }
  }, [currentStep]);
  
  // Initialize Stripe Elements with Payment Element
  useEffect(() => {
    if (currentStep === 5 && stripeLoaded && clientSecret && typeof window !== 'undefined' && !stripe) {
      try {
        setPaymentElementError(false);
        setPaymentElementReady(false);
        
        const isProduction = window.location.hostname.includes('voiply.com');
        const publishableKey = isProduction
          ? 'pk_live_D6rvZlsemkyp8H52V8TiP4YY'
          : 'pk_test_xUOr3G0ru1UKcGvNOCg1nRUN';
        const stripeInstance = (window as any).Stripe(publishableKey);
        setStripe(stripeInstance);
        
        // Create Payment Element with client secret and locale
        const elementsInstance = stripeInstance.elements({
          clientSecret: clientSecret,
          locale: country === 'CA' ? 'en-CA' : 'en-US'
        });
        setElements(elementsInstance);
        
        const paymentEl = elementsInstance.create('payment', {
          layout: {
            type: 'accordion',
            defaultCollapsed: false,
            radios: false,
            spacedAccordionItems: true
          },
          paymentMethodOrder: ['card'],
          fields: {
            billingDetails: {
              name: 'never',
              email: 'never',
              phone: 'never',
              address: {
                country: 'never',
                postalCode: 'never'
              }
            }
          }
        });
        
        let errorTimeoutId: NodeJS.Timeout | null = null;
        let pollingIntervalId: NodeJS.Timeout | null = null;
        let readyFired = false;
        
        // Verification function - checks if element is actually loaded
        const verifyElementLoaded = () => {
          const container = document.getElementById('payment-element');
          const hasIframe = container?.querySelector('iframe') !== null;
          const hasContent = container && container.children.length > 0;
          
          return hasIframe || hasContent;
        };
        
        // Start polling to verify element loaded
        pollingIntervalId = setInterval(() => {
          if (verifyElementLoaded()) {
            if (pollingIntervalId) clearInterval(pollingIntervalId);
            if (errorTimeoutId) clearTimeout(errorTimeoutId);
            setPaymentElementReady(true);
            setPaymentElementError(false);
            setLoadingPaymentIntent(false);
          }
        }, 500); // Check every 500ms
        
        // Set up timeout to detect if element fails to load
        errorTimeoutId = setTimeout(() => {
          console.error('Payment element timeout - checking final state');
          
          // Do final verification before showing error
          if (verifyElementLoaded() || readyFired) {
            setPaymentElementReady(true);
            setPaymentElementError(false);
          } else {
            console.error('Payment element genuinely failed to load');
            setPaymentElementError(true);
          }
          
          if (pollingIntervalId) clearInterval(pollingIntervalId);
          setLoadingPaymentIntent(false);
        }, 12000); // 12 second timeout (longer for mobile)
        
        // Mount the payment element (mount() is void, not a Promise)
        try {
          paymentEl.mount('#payment-element');
        } catch (mountError: any) {
          console.error('Payment element mount error:', mountError);
          if (errorTimeoutId) clearTimeout(errorTimeoutId);
          if (pollingIntervalId) clearInterval(pollingIntervalId);
          setPaymentElementError(true);
          setLoadingPaymentIntent(false);
        }
        
        setPaymentElement(paymentEl);
        
        // Listen for successful load (ready event)
        paymentEl.on('ready', () => {
          readyFired = true;
          if (errorTimeoutId) clearTimeout(errorTimeoutId);
          if (pollingIntervalId) clearInterval(pollingIntervalId);
          setPaymentElementReady(true);
          setPaymentElementError(false);
          setLoadingPaymentIntent(false);
        });
        
        paymentEl.on('change', (event: any) => {
          setCardComplete(event.complete);
          if (event.complete) setStep5Errors(prev => ({ ...prev, card: undefined }));
        });
        
      } catch (error) {
        console.error('Error initializing Stripe:', error);
        setPaymentElementError(true);
        setLoadingPaymentIntent(false);
      }
    }
  }, [currentStep, stripeLoaded, clientSecret, stripe, country]);
  
  // Detect country from IP address on initial load
  useEffect(() => {
    const detectCountry = async () => {
      // Only detect on first load, don't override if user already selected or session exists
      const session = localStorage.getItem('voiply_session_id');
      if (session) return; // Don't override for returning users
      
      try {
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok) {
          const data = await response.json();
          const countryCode = data.country_code; // Returns 'US', 'CA', etc.
          
          if (countryCode === 'CA') {
            setCountry('CA');
          } else if (countryCode === 'US') {
            setCountry('US');
          } else {
            // Default to US for other countries
            setCountry('US');
          }
        }
      } catch (error) {
        console.error('Error detecting country from IP:', error);
        // Keep default 'US' if detection fails
      }
    };
    
    detectCountry();
  }, []); // Run once on mount
  
  // Exit intent detection - only on step 5 (order page)
  useEffect(() => {
    if (currentStep !== 5 || exitPopupShown || couponApplied) return;
    
    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger when mouse leaves at the top of the page
      // Safari compatibility: check both clientY and relatedTarget
      const isLeavingTop = e.clientY <= 0 || (e.relatedTarget === null && e.clientY < 10);
      
      if (isLeavingTop && !exitPopupShown) {
        setShowExitPopup(true);
        setExitPopupShown(true);
        setCouponEmail(email); // Pre-fill with their email if available
        
        // Save to sessionStorage to persist across page reloads
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('voiply_exit_popup_shown', 'true');
        }
      }
    };
    
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [currentStep, exitPopupShown, couponApplied, email]);
  
  // Handle browser back button (including Safari)
  useEffect(() => {
    const handlePopState = () => {
      // Simply call handleBack when browser back is clicked
      // This works because handleBack already has the right logic
      handleBack();
    };
    
    // Add listener only if not on first step
    if (currentStep > 1) {
      window.addEventListener('popstate', handlePopState);
      
      // Push state to create history entry
      window.history.pushState({ step: currentStep }, '');
    }
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentStep, hasPhone]);
  
  // Handle coupon activation
  const handleActivateCoupon = async () => {
    setCouponEmailError('');
    if (!couponEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(couponEmail.trim())) {
      setCouponEmailError('Please enter a valid email address.');
      return;
    }

    // Validate with SendGrid
    setCouponEmailValidating(true);
    try {
      const res = await fetch(`${basePath}/api/validate-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: couponEmail.trim() }),
      });
      const data = await res.json();
      if (!data.valid && !data.fallback) {
        setCouponEmailError('We could not verify this email address. Please check for typos and try again.');
        setCouponEmailValidating(false);
        return;
      }
    } catch {
      // fail open — proceed if API is down
    } finally {
      setCouponEmailValidating(false);
    }
    
    // Switch to 3-month plan
    setSelectedPlan('3month');
    setCouponApplied(true);
    setEmail(couponEmail.trim()); // Update their email if they changed it
    setShowExitPopup(false);
    
    // Save to sessionStorage to persist across page reloads
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('voiply_coupon_applied', 'true');
    }
    
    // GTM tracking
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'coupon_activated',
        coupon_type: '1_month_free',
        coupon_value: 11.95
      });
    }
    
    // HubSpot Custom Behavioral Event tracking
    if (typeof window !== 'undefined') {
      const _hsq = (window as any)._hsq = (window as any)._hsq || [];
      _hsq.push(['trackCustomBehavioralEvent', {
        name: 'pe28395928_coupon_activated',
        properties: {
          email: couponEmail,
          coupon_type: '1_month_free',
          coupon_source: 'exit_popup',
          coupon_value: 11.95,
          plan_selected: '3month'
        }
      }]);
    }
  };
  
  // Helper function to get plan price (accounts for coupon)
  // Business Advanced Plan: $11.95/mo ($4 telco + $7.95 support)
  // NOTE: Coupon ONLY applies to 3-month plan
  const getUserCount = () => parseInt(numUsers) || 1;

  const getPlanPrice = () => {
    // $11.95/mo per user pricing
    const users = getUserCount();
    if (selectedPlan === 'annually') return 119.50 * users;
    if (selectedPlan === '3year') return 358.50 * users;
    if (selectedPlan === '3month') {
      return couponApplied ? 23.90 * users : 35.85 * users;
    }
    return 35.85 * users;
  };
  
  // Get plan price for tax calculation (ALWAYS full price, even with coupon)
  const getPlanPriceForTax = (planOverride?: string) => {
    const plan = planOverride || selectedPlan;
    const users = getUserCount();
    if (plan === 'annually') return 119.50 * users;
    if (plan === '3year') return 358.50 * users;
    if (plan === '3month') return 35.85 * users;
    return 35.85 * users;
  };

  // Get the plan months multiplier (for calculating managed desk phone costs)
  const getPlanMonths = (planOverride?: string) => {
    const plan = planOverride || selectedPlan;
    if (plan === '3month') return 3;
    if (plan === 'annually') return 10; // pay for 10, get 12
    if (plan === '3year') return 30; // pay for 30, get 36
    return 10;
  };

  // Get total number of desk phones in cart
  const getTotalPhoneCount = () => {
    return Object.values(selectedPhones).reduce((sum, qty) => sum + qty, 0);
  };

  // Get total managed phones (cart phones + own devices)
  const getTotalManagedPhones = () => {
    return getTotalPhoneCount() + ownDevice;
  };

  // Get total hardware cost for selected phones
  const getPhoneHardwarePrice = () => {
    return Object.entries(selectedPhones).reduce((total, [phoneId, qty]) => {
      const phone = PHONES.find(p => p.id === phoneId);
      if (phone) return total + (phone.price * qty);
      return total;
    }, 0);
  };

  // Get managed desk phone monthly support cost ($5/mo per phone, includes own devices)
  const getManagedDeskPhonePrice = () => {
    const totalPhones = getTotalManagedPhones();
    const months = getPlanMonths();
    return totalPhones * 5 * months; // $5/mo per phone * plan months
  };

  // Get managed desk phone price for tax (always full months, includes own devices)
  const getManagedDeskPhonePriceForTax = (planOverride?: string) => {
    const totalPhones = getTotalManagedPhones();
    const plan = planOverride || selectedPlan;
    let months = 3;
    if (plan === 'annually') months = 12;
    if (plan === '3year') months = 36;
    return totalPhones * 5 * months;
  };

  // Add phone to cart
  const addPhoneToCart = (phoneId: string) => {
    setSelectedPhones(prev => ({
      ...prev,
      [phoneId]: (prev[phoneId] || 0) + 1
    }));

  };

  // Remove phone from cart
  const removePhoneFromCart = (phoneId: string) => {
    setSelectedPhones(prev => {
      const newCart = { ...prev };
      if (newCart[phoneId] && newCart[phoneId] > 1) {
        newCart[phoneId] = newCart[phoneId] - 1;
      } else {
        delete newCart[phoneId];
      }
      return newCart;
    });
  };

  // Check if phones step should be shown (desk phones or both selected)
  const needsPhonesStep = callMethod === 'desk-phones' || callMethod === 'both';

  // Get phones summary string for webhooks/metadata
  const getPhonesSummary = () => {
    if (ownDevice > 0) return `Own Equipment (×${ownDevice})`;
    const phoneEntries = Object.entries(selectedPhones);
    if (phoneEntries.length === 0) return 'No Hardware';
    return phoneEntries.map(([id, qty]) => {
      const phone = PHONES.find(p => p.id === id);
      return `${phone?.name || id} x${qty}`;
    }).join(', ');
  };
  
  // Get online fax price based on country
  const getOnlineFaxPrice = () => {
    return country === 'CA' ? 6.95 : 5.00;
  };
  
  // Get shipping cost based on country
  const getShippingCost = () => {
    return country === 'CA' ? 14.99 : 0;
  };
  
  // Send GTM event helper function
  const sendGTMEvent = (eventName: string, additionalData: any = {}) => {
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      // Calculate total and tax
      const planPrice = getPlanPrice();
      const planPriceForTax = getPlanPriceForTax(); // For tax calc (full price even with coupon)
      const devicePrice = getPhoneHardwarePrice();
      const protectionPrice = 0;
      const shippingCost = getShippingCost();
      const managedDeskPhonePrice = getManagedDeskPhonePriceForTax();
            const taxableSubtotal = planPriceForTax + devicePrice + managedDeskPhonePrice + protectionPrice + shippingCost;
      const taxes = calculatedTaxAmount !== null ? calculatedTaxAmount : taxableSubtotal * 0.47;
      const total = taxableSubtotal + taxes;
      
      const eventData = {
        event: eventName,
        user_firstname: firstName || undefined,
        user_lastname: lastName || undefined,
        user_email: email || undefined,
        user_phone: mobileNumber || undefined,
        user_city: addressComponents.city || undefined,
        user_region: addressComponents.state || undefined,
        user_postal: addressComponents.zipCode || undefined,
        user_country: country || undefined,
        product: 'advanced',
        plan: 'advanced',
        quantity: '1',
        total: total.toFixed(2),
        tax: taxes.toFixed(2),
        currency: country === 'CA' ? 'CAD' : 'USD',
        ...additionalData
      };
      
      // Remove undefined values
      Object.keys(eventData).forEach(key => eventData[key] === undefined && delete eventData[key]);
      
      (window as any).dataLayer.push(eventData);
    }
  };
  
  // Fetch available numbers from Telnyx
  const fetchAvailableNumbers = async (code: string, type: 'local' | 'toll_free' = 'local', keyword: string = '') => {
    if (type === 'local' && code.length !== 3) return;
    
    setLoadingNumbers(true);
    setReservationError('');
    setSelectedNewNumber('');
    try {
      const params = new URLSearchParams({ type });
      if (type === 'local') params.set('area_code', code);
      if (keyword.trim()) params.set('keyword', keyword.trim());
      
      const response = await fetch(`${basePath}/api/available-numbers?${params.toString()}`);
      const data = await response.json();
      
      if (response.ok) {
        setAvailableNumbers(data.numbers || []);
      } else {
        console.error('Failed to fetch numbers:', data.error);
        setAvailableNumbers([]);
      }
    } catch (error) {
      console.error('Error fetching numbers:', error);
      setAvailableNumbers([]);
    } finally {
      setLoadingNumbers(false);
    }
  };
  
  // Fetch numbers when entering step 3 (new number selection)
  useEffect(() => {
    if (currentStep === 3 && hasPhone === false) {
      if (numberType === 'local' && areaCode.length === 3) {
        fetchAvailableNumbers(areaCode, 'local', numberKeyword);
      } else if (numberType === 'toll_free') {
        fetchAvailableNumbers('', 'toll_free', numberKeyword);
      }
    }
  }, [currentStep, hasPhone, areaCode, numberType]);
  
  // Auto-select first number when available numbers change
  useEffect(() => {
    if (availableNumbers.length > 0 && !selectedNewNumber) {
      setSelectedNewNumber(availableNumbers[0]);
    }
  }, [availableNumbers]);
  
  // Handle area code input
  const handleAreaCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
    setAreaCode(value);
    // Clear selected number so new first number will auto-select
    setSelectedNewNumber('');
    if (value.length === 3) {
      fetchAvailableNumbers(value);
    }
  };

  // Handle number selection (no reservation until Next is clicked)
  const handleSelectNumber = (number: string) => {
    setSelectedNewNumber(number);
    setReservationError(''); // Clear any previous errors
  };

  // Phone validation using Telnyx API
  useEffect(() => {
    const numbers = phoneNumber.replace(/\D/g, '');
    if (numbers.length === 10 && hasPhone === true) {
      setPhoneValidating(true);
      setPhoneValidated(false);
      setPhoneErrorMessage('');
      
      // Use basePath for Webflow Cloud compatibility
      const apiUrl = `${basePath}/api/check-portability`;
      
      // Call our API route which handles Telnyx
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phoneNumber: numbers })
      })
        .then(res => res.json())
        .then(data => {
          setPhoneValidating(false);
          if (data.portable) {
            setPhoneValidated(true);
            setPhoneErrorMessage('');
          } else {
            setPhoneValidated(false);
            const reason = data.notPortableReasonDescription || 
                          data.notPortableReason || 
                          'This number cannot be ported';
            setPhoneErrorMessage(reason);
          }
        })
        .catch(error => {
          console.error('Error checking portability:', error);
          setPhoneValidating(false);
          setPhoneValidated(false);
          setPhoneErrorMessage('Unable to verify number. Please try again.');
        });
    } else {
      setPhoneValidated(false);
      setPhoneValidating(false);
      setPhoneErrorMessage('');
    }
  }, [phoneNumber, hasPhone]);
  
  const canProceedStep1 = 
    address && 
    addressComponents.street && 
    hasPhone !== null &&
    (hasPhone === false || (phoneNumber && phoneValidated)) &&
    hasInternet !== null;
  
  // Step 2 is business needs assessment
  const canProceedStep2 = numUsers !== '' && callMethod !== '' && highCallVolume !== '';
  
  // Step 3 is number selection (only shown if hasPhone === false)  
  const canProceedStep3 = selectedNewNumber !== '';
  
  // Step 4 is bundle selection
  const canProceedStep4 = ownDevice > 0 || getTotalPhoneCount() > 0;
  
  // Step 5 is payment
  const canProceedStep5 = cardComplete;
  
  // Calculate delivery date (5 business days from today, skipping weekends)
  const getDeliveryDate = () => {
    const today = new Date();
    let businessDaysAdded = 0;
    let currentDate = new Date(today);
    
    while (businessDaysAdded < 5) {
      currentDate.setDate(currentDate.getDate() + 1);
      const dayOfWeek = currentDate.getDay();
      // Skip Saturday (6) and Sunday (0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        businessDaysAdded++;
      }
    }
    
    // Format date as "Monday, February 24th"
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const dayName = days[currentDate.getDay()];
    const monthName = months[currentDate.getMonth()];
    const date = currentDate.getDate();
    
    // Add ordinal suffix (st, nd, rd, th)
    const getOrdinal = (n: number) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };
    
    return `${dayName}, ${monthName} ${getOrdinal(date)}`;
  };
  
  // Validate step 1 and scroll to incomplete section
  const validateAndScrollStep1 = () => {
    const errors: { address?: string; hasPhone?: string; phoneNumber?: string; hasInternet?: string } = {};

    // Check address
    if (!address || !addressComponents.street) {
      errors.address = 'Please enter your business address';
    }

    // Check hasPhone question
    if (hasPhone === null) {
      errors.hasPhone = 'Please let us know if you already have a home phone number';
    }

    // Check phone number if they have one
    if (hasPhone === true && (!phoneNumber || !phoneValidated)) {
      errors.phoneNumber = phoneNumber ? 'Please wait for phone number validation to complete' : 'Please enter your current phone number';
    }

    // Check hasInternet question
    if (hasInternet === null) {
      errors.hasInternet = 'Please let us know if you already have internet service';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      // Scroll to the first error field
      if (errors.address) {
        addressInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        addressInputRef.current?.focus();
      } else if (errors.hasPhone) {
        hasPhoneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (errors.phoneNumber) {
        phoneNumberRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        phoneNumberRef.current?.focus();
      } else if (errors.hasInternet) {
        hasInternetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }

    setFieldErrors({});
    return true;
  };
  
  const handleNextStep = async () => {
    // If leaving step 3 (number selection), reserve the number first
    if (currentStep === 3 && selectedNewNumber) {
      setReservingNumber(true);
      setReservationError('');
      
      try {
        const response = await fetch(`${basePath}/api/reserve-number`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone_number: selectedNewNumber
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          const msg = data.error || 'Failed to reserve number';
          console.error('Reserve number failed:', msg, data.details);
          throw new Error(msg);
        }
        
        // Successfully reserved - proceed to phones or payment
        if (needsPhonesStep) {
          setCurrentStep(4);
        } else {
          setCurrentStep(5);
        }
        
      } catch (error: any) {
        console.error('Error reserving number:', error);
        setReservationError(error.message || 'Failed to reserve number. Please try again or select a different number.');
        // Don't proceed if reservation failed
      } finally {
        setReservingNumber(false);
      }
      return;
    }
    
    // Normal step progression for other steps
    if (currentStep === 1) {
      // Validate step 1 first
      if (!validateAndScrollStep1()) {
        return; // Stop if validation fails
      }
      // Send GTM lead event
      sendGTMEvent('lead');
      // Always go to business needs assessment
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // From business needs: go to number selection or phones/payment
      if (hasPhone === false) {
        setCurrentStep(3);
      } else if (needsPhonesStep) {
        setCurrentStep(4);
      } else {
        setCurrentStep(5);
      }
    } else if (currentStep === 4) {
      // Send GTM add_to_cart event
      sendGTMEvent('add_to_cart');
      // From phones to payment
      setCurrentStep(5);
    }
  };
  
  const handleBack = () => {
    if (currentStep === 2) {
      // From business needs back to address
      setCurrentStep(1);
    } else if (currentStep === 3) {
      // From number selection back to business needs
      setCurrentStep(2);
    } else if (currentStep === 4 && hasPhone === false) {
      // From phones back to number selection
      setCurrentStep(3);
    } else if (currentStep === 4 && hasPhone === true) {
      // From phones back to business needs (skip number selection)
      setCurrentStep(2);
    } else if (currentStep === 5 && needsPhonesStep) {
      // From payment back to phones
      setCurrentStep(4);
    } else if (currentStep === 5 && !needsPhonesStep && hasPhone === false) {
      // From payment back to number selection (no phones step)
      setCurrentStep(3);
    } else if (currentStep === 5 && !needsPhonesStep) {
      // From payment back to business needs
      setCurrentStep(2);
    }
  };
  
  // Scroll bundle carousel
  const scrollBundles = (direction: 'left' | 'right') => {
    if (bundleScrollRef.current) {
      const scrollAmount = 250; // Scroll by ~1 card width
      const newScrollPosition = bundleScrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      bundleScrollRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
  };
  
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };
  
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setMobileNumber(formatted);
  };
  
  // Handle editing shipping address
  const handleEditShipping = () => {
    setTempAddress(address);
    setTempAddress2(address2);
    setTempAddressComponents(addressComponents);
    setEditingShipping(true);
  };
  
  const handleSaveShipping = () => {
    setAddress(tempAddress);
    setAddress2(tempAddress2);
    setAddressComponents(tempAddressComponents);
    setEditingShipping(false);
  };
  
  const handleCancelEditShipping = () => {
    setEditingShipping(false);
    setTempSuggestions([]);
    setShowTempSuggestions(false);
  };
  
  // Smarty autocomplete for temp/editing address
  const handleTempAddressChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTempAddress(value);
    
    if (value.length < 3) {
      setShowTempSuggestions(false);
      setTempSuggestions([]);
      return;
    }
    
    try {
      const response = await fetch(
        `${basePath}/api/smarty-autocomplete?search=${encodeURIComponent(value)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setTempSuggestions(data.suggestions || []);
        setShowTempSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
    }
  };
  
  const selectTempSuggestion = (suggestion: any) => {
    const fullAddress = `${suggestion.street_line}, ${suggestion.city}, ${suggestion.state} ${suggestion.zipcode}`;
    setTempAddress(fullAddress);
    setTempAddressComponents({
      street: suggestion.street_line,
      city: suggestion.city,
      state: suggestion.state,
      zipCode: suggestion.zipcode
    });
    setShowTempSuggestions(false);
    setZipFromAutocomplete(true); // Mark as from autocomplete
    setZipError(''); // Clear any errors
  };
  
  // Smarty autocomplete for billing address
  const handleBillingAddressChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBillingAddress(value);
    
    if (value.length < 3) {
      setShowBillingSuggestions(false);
      setBillingSuggestions([]);
      return;
    }
    
    try {
      const response = await fetch(
        `${basePath}/api/smarty-autocomplete?search=${encodeURIComponent(value)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setBillingSuggestions(data.suggestions || []);
        setShowBillingSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
    }
  };
  
  const selectBillingSuggestion = (suggestion: any) => {
    const fullAddress = `${suggestion.street_line}, ${suggestion.city}, ${suggestion.state} ${suggestion.zipcode}`;
    setBillingAddress(fullAddress);
    setBillingComponents({
      street: suggestion.street_line,
      city: suggestion.city,
      state: suggestion.state,
      zipCode: suggestion.zipcode
    });
    setShowBillingSuggestions(false);
    setZipFromAutocomplete(true); // Mark as from autocomplete
    setZipError(''); // Clear any errors
  };
  
  const validateStep4 = (): boolean => {
    const errors: { firstName?: string; lastName?: string; email?: string; mobileNumber?: string; card?: string } = {};

    if (!firstName.trim()) errors.firstName = 'Please enter your first name';
    if (!lastName.trim()) errors.lastName = 'Please enter your last name';
    if (!email.trim()) {
      errors.email = 'Please enter your email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
    } else if (emailValidated === false) {
      errors.email = 'We could not verify this email address. Please check for typos and try again.';
    }
    if (!mobileNumber.trim()) {
      errors.mobileNumber = 'Please enter your mobile number';
    } else if (mobileValidated === false) {
      errors.mobileNumber = 'We could not verify this phone number. Please make sure you entered all 10 digits correctly.';
    }
    if (!cardComplete) errors.card = 'Please complete your payment details';

    if (Object.keys(errors).length > 0) {
      setStep5Errors(errors);
      // Scroll to first error
      if (errors.firstName) {
        firstNameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstNameRef.current?.focus();
      } else if (errors.lastName) {
        lastNameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        lastNameRef.current?.focus();
      } else if (errors.email) {
        emailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        emailRef.current?.focus();
      } else if (errors.mobileNumber) {
        mobileNumberRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        mobileNumberRef.current?.focus();
      } else if (errors.card) {
        paymentElementRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }

    setStep5Errors({});
    return true;
  };

  const handleSubmitOrder = async () => {
    if (!stripe || !elements) return;

    if (!validateStep4()) return;

    // Validate mobile number format (basic check for 10 digits)
    const phoneDigits = mobileNumber.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      setStep5Errors(prev => ({ ...prev, mobileNumber: 'Please enter a valid 10-digit mobile number' }));
      mobileNumberRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      mobileNumberRef.current?.focus();
      return;
    }
    
    setLoadingPaymentIntent(true);
    
    try {
      // STEP 1: Add delay to ensure all payment intent updates are complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // STEP 2: Calculate expected total to verify payment intent
      const planPrice = getPlanPrice();
      const planPriceForTax = getPlanPriceForTax(); // For tax calc (full price even with coupon)
      const devicePrice = getPhoneHardwarePrice();
      const protectionPrice = 0;
      const shippingCost = getShippingCost();
      
      let internetPrice = 0;
      if (hasInternet === false && addInternetPackage) {
        const packagePrices: { [key: string]: number } = {
          'phone-only': 16.95,
              'unlimited-5g': 84.95
        };
        const packagePrice = packagePrices[internetPackage] || 16.95;
        const deviceCost = internetDevice === 'rental' ? 15 : 199;
        internetPrice = packagePrice + deviceCost;
      }
      
      const managedDeskPhonePrice = getManagedDeskPhonePriceForTax();
            const taxableSubtotal = planPriceForTax + devicePrice + managedDeskPhonePrice + protectionPrice + shippingCost;
      const taxes = calculatedTaxAmount !== null ? calculatedTaxAmount : taxableSubtotal * 0.47;
      const expectedTotal = taxableSubtotal + taxes + internetPrice;
      
      
      // STEP 3: ENSURE CUSTOMER EXISTS - Create/attach customer to payment intent before confirming
      let finalCustomerId = stripeCustomerId;
      
      if (!finalCustomerId) {
        
        try {
          const customerAddress = billingSameAsShipping ? {
            line1: addressComponents.street,
            line2: address2 || '',
            city: addressComponents.city,
            state: addressComponents.state,
            postal_code: addressComponents.zipCode,
            country: country === 'CA' ? 'CA' : 'US'
          } : {
            line1: billingComponents.street,
            line2: billingAddress2 || '',
            city: billingComponents.city,
            state: billingComponents.state,
            postal_code: billingComponents.zipCode,
            country: billingCountry === 'CA' ? 'CA' : 'US'
          };
          
          const customerResponse = await fetch(`${basePath}/api/ensure-customer`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentIntentId: paymentIntentId,
              email: email,
              name: `${firstName} ${lastName}`.trim(),
              phone: mobileNumber,
              address: customerAddress
            })
          });
          
          if (customerResponse.ok) {
            const customerData = await customerResponse.json();
            if (customerData.customerId) {
              finalCustomerId = customerData.customerId;
              setStripeCustomerId(finalCustomerId);
              
              // Save customer ID to session immediately
              try {
                await fetch(`${basePath}/api/session/save`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    sessionId,
                    stripeCustomerId: finalCustomerId,
                    // Include minimal fields to update just the customer ID
                    firstName,
                    lastName,
                    email,
                    mobileNumber,
                    address,
                    address2,
                    country,
                    addressComponents,
                    billingSameAsShipping,
                    billingAddress,
                    billingAddress2,
                    billingCountry,
                    billingComponents,
                    hasPhone,
                    phoneNumber,
                    areaCode,
                    selectedNewNumber,
                    canPort,
                    selectedPlan,
                    selectedPhones,
                    ownDevice,
                    onlineFax,
                    paymentIntentId,
                    currentStep
                  })
                });
              } catch (sessionError) {
                console.error('Error saving customer ID to session:', sessionError);
              }
            } else {
              console.error('No customer ID returned from ensure-customer API');
            }
          } else {
            console.error('Failed to ensure customer exists');
          }
        } catch (customerError) {
          console.error('Error ensuring customer:', customerError);
          // Continue with payment anyway - Stripe will handle it
        }
      } else {
      }
      
      // STEP 4: Verify we have a customer ID before proceeding
      if (!finalCustomerId) {
        console.error('CRITICAL: No customer ID available before payment confirmation');
        setPaymentError({ type: 'generic', message: 'An error occurred preparing your order. Please try again.' });
        setLoadingPaymentIntent(false);
        return;
      }

      // STEP 4b: Force-update payment intent to the exact total shown on screen
      // This ensures the charge amount always matches what is displayed to the customer
      // Compute finalTotal outside the try block so it's available for pre-save and success branch
      const finalPlanPriceForTax = getPlanPriceForTax();
      const finalDevicePrice = getPhoneHardwarePrice();
      const finalProtectionPrice = 0;
      const finalShippingCost = getShippingCost();
      let finalInternetPrice = 0;
      if (hasInternet === false && addInternetPackage) {
        const pkgPrices: { [key: string]: number } = { 'phone-only': 16.95, 'unlimited-5g': 84.95 };
        const pkgPrice = pkgPrices[internetPackage] || 16.95;
        const devCost = internetDevice === 'rental' ? 15 : 199;
        finalInternetPrice = pkgPrice + devCost;
      }
      const finalTaxableSubtotal = finalPlanPriceForTax + finalDevicePrice + finalProtectionPrice + finalShippingCost;
      const finalTaxes = calculatedTaxAmount !== null ? calculatedTaxAmount : finalTaxableSubtotal * 0.47;
      const finalTotal = finalTaxableSubtotal + finalTaxes + finalInternetPrice;

      try {

        const updateRes = await fetch(`${basePath}/api/update-payment-intent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId,
            amount: finalTotal,
            submission_id: csiSubmissionId || '',
            plan: selectedPlan
          })
        });
        if (!updateRes.ok) {
          console.error('Failed to sync payment intent amount before confirm');
        }
      } catch (updateErr) {
        console.error('Error syncing payment intent amount:', updateErr);
        // Non-fatal: proceed with confirm anyway
      }

      // Clear any previous payment error
      setPaymentError(null);

      // ── Pre-save order details BEFORE confirmPayment ──────────────────────
      // When Stripe requires a full-page 3DS redirect, the browser navigates
      // away immediately and no code after confirmPayment() ever runs.
      // Saving here ensures the thank-you page always has order data available.
      const generateOrderNumber = () => {
        const base = (firstName + lastName).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const minDigits = Math.max(2, 12 - base.length);
        const numDigits = Math.max(3, minDigits);
        const digits = Math.floor(Math.random() * Math.pow(10, numDigits)).toString().padStart(numDigits, '0');
        return base + digits;
      };
      const preSaveOrderDetails = {
        orderNumber: generateOrderNumber(),
        phoneNumber: hasPhone === false && selectedNewNumber
          ? formatPhoneNumber(selectedNewNumber.replace('+1', ''))
          : hasPhone === true && phoneNumber
          ? phoneNumber
          : 'N/A',
        plan: selectedPlan,
        bundle: ownDevice > 0 ? 'Service Only' : getPhonesSummary(),
        address: addressComponents,
        email: email,
        name: `${firstName} ${lastName}`,
        total: finalTotal.toFixed(2),
        country: country,
        hasPhone: hasPhone,
        customerId: finalCustomerId,
        internetPackage: (hasInternet === false && addInternetPackage) ? internetPackage : null,
        internetDevice: (hasInternet === false && addInternetPackage) ? internetDevice : null,
      };
      localStorage.setItem('lastOrder', JSON.stringify(preSaveOrderDetails));

      // ── Pre-save webhook + metadata + GTM for 3DS redirect resilience ────
      // If Stripe triggers a full-page 3DS redirect, code after confirmPayment
      // never runs. These are picked up by the order-confirmation page.

      // Pending n8n webhook
      const getPreSaveInterval = () => {
        if (selectedPlan === '3month') return 'quarter';
        if (selectedPlan === 'annually') return 'year';
        if (selectedPlan === '3year') return '3year';
        return 'year';
      };
      const getPreSavePhoneDigits = () => {
        let pd = '';
        if (hasPhone === false && selectedNewNumber) pd = selectedNewNumber.replace(/\D/g, '');
        else if (hasPhone === true && phoneNumber) pd = phoneNumber.replace(/\D/g, '');
        return pd.length > 10 ? pd.slice(-10) : pd;
      };
      const pendingWebhook = {
        plan: 'residential',
        phoneNumber: getPreSavePhoneDigits(),
        customerId: finalCustomerId,
        orderId: preSaveOrderDetails.orderNumber,
        userCount: String(getUserCount()),
        version: typeof window !== 'undefined' && window.location.hostname.includes('voiply.com') ? 'prod' : 'dev',
        interval: getPreSaveInterval(),
        newNumber: hasPhone === false,
        email: email,
        address_1: addressComponents.street,
        address_2: address2 || '',
        city: addressComponents.city,
        country: country,
        name: `${firstName} ${lastName}`,
        postal_code: addressComponents.zipCode,
        shipping_method: '',
        state: addressComponents.state,
        bundle: getPhonesSummary(),
        ...(onlineFax ? { fax: true } : {}),
        ...(hasInternet === false && addInternetPackage ? {
          internetorder: true,
          internetrental: internetDevice === 'rental',
          internetbundle: internetPackage === 'unlimited-5g' ? 'unlimited' : 'phone-only'
        } : {})
      };
      localStorage.setItem('pendingWebhook', JSON.stringify(pendingWebhook));

      // Pending Stripe customer metadata update
      const preSavePrimaryNumber = getPreSavePhoneDigits();
      const preSaveBillingAddr = billingSameAsShipping ? {
        line1: addressComponents.street,
        line2: address2 || '',
        city: addressComponents.city,
        state: addressComponents.state,
        postal_code: addressComponents.zipCode,
        country: country === 'CA' ? 'CA' : 'US',
      } : {
        line1: billingComponents.street,
        line2: billingAddress2 || '',
        city: billingComponents.city,
        state: billingComponents.state,
        postal_code: billingComponents.zipCode,
        country: billingCountry === 'CA' ? 'CA' : 'US',
      };
      const preSaveShippingAddr = {
        name: `${firstName} ${lastName}`.trim(),
        line1: addressComponents.street,
        line2: address2 || '',
        city: addressComponents.city,
        state: addressComponents.state,
        postal_code: addressComponents.zipCode,
        country: country === 'CA' ? 'CA' : 'US',
      };
      const pendingMetadataUpdate = {
        customerId: finalCustomerId,
        orderId: preSaveOrderDetails.orderNumber,
        primaryNumber: preSavePrimaryNumber,
        product: ownDevice > 0 ? '' : (() => {
          const phoneEntries = Object.entries(selectedPhones);
          if (phoneEntries.length === 0) return '';
          return phoneEntries.map(([id, qty]) => {
            const phone = PHONES.find(p => p.id === id);
            return `${phone?.name || id} x${qty}`;
          }).join(', ');
        })(),
        billingAddress: preSaveBillingAddr,
        shippingAddress: preSaveShippingAddr,
      };
      localStorage.setItem('pendingMetadataUpdate', JSON.stringify(pendingMetadataUpdate));

      // Pending GTM purchase event (GA4 ecommerce)
      const preSaveGtmTax = calculatedTaxAmount !== null ? calculatedTaxAmount : finalTaxes;
      const pendingGTMPurchasePreSave = {
        event: 'purchase',
        user_firstname: firstName || undefined,
        user_lastname: lastName || undefined,
        user_email: email || undefined,
        user_phone: mobileNumber || undefined,
        user_city: addressComponents.city || undefined,
        user_region: addressComponents.state || undefined,
        user_postal: addressComponents.zipCode || undefined,
        user_country: country || undefined,
        product: 'advanced',
        plan: 'advanced',
        ecommerce: {
          transaction_id: String(preSaveOrderDetails.orderNumber),
          value: parseFloat(finalTotal.toFixed(2)),
          tax: parseFloat(preSaveGtmTax.toFixed(2)),
          currency: country === 'CA' ? 'CAD' : 'USD',
          items: [{
            item_id: 'advanced',
            item_name: 'Voiply Advanced Business',
            item_category: 'advanced',
            quantity: getUserCount(),
            price: parseFloat(finalTotal.toFixed(2)),
          }],
        },
      };
      localStorage.setItem('pendingGTMPurchase', JSON.stringify(pendingGTMPurchasePreSave));
      // ──────────────────────────────────────────────────────────────────────

      // Confirm the payment with Stripe
      // return_url MUST include basePath — used when 3DS requires a full-page redirect
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: typeof window !== 'undefined' ? `${window.location.origin}${basePath}/order-confirmation` : '',
          payment_method_data: {
            billing_details: {
              name: `${firstName} ${lastName}`,
              email: email,
              phone: mobileNumber,
              address: billingSameAsShipping ? {
                line1: addressComponents.street,
                line2: address2 || undefined,
                city: addressComponents.city,
                state: addressComponents.state,
                postal_code: addressComponents.zipCode,
                country: country === 'CA' ? 'CA' : 'US'
              } : {
                line1: billingComponents.street,
                line2: billingAddress2 || undefined,
                city: billingComponents.city,
                state: billingComponents.state,
                postal_code: billingComponents.zipCode,
                country: billingCountry === 'CA' ? 'CA' : 'US'
              }
            }
          },
          shipping: {
            name: `${firstName} ${lastName}`,
            phone: mobileNumber,
            address: {
              line1: addressComponents.street,
              line2: address2 || undefined,
              city: addressComponents.city,
              state: addressComponents.state,
              postal_code: addressComponents.zipCode,
              country: country === 'CA' ? 'CA' : 'US'
            }
          }
        },
        redirect: 'if_required'
      });
      
      if (error) {
        console.error('Payment error:', error);

        // Categorise the error for a customer-friendly message
        let errType: 'card' | 'auth' | 'generic' = 'generic';
        let errMsg = 'Something went wrong processing your payment. Please try again or contact us.';

        if (error.type === 'card_error') {
          errType = 'card';
          // Map common Stripe decline codes to plain-English messages
          const declineMessages: Record<string, string> = {
            card_declined: 'Your card was declined. Please try a different card or contact your bank.',
            insufficient_funds: 'Your card has insufficient funds. Please try a different card.',
            incorrect_cvc: 'The security code (CVV) you entered is incorrect. Please check and try again.',
            expired_card: 'Your card has expired. Please use a different card.',
            incorrect_number: 'Your card number appears to be invalid. Please double-check and try again.',
            do_not_honor: 'Your bank declined this transaction. Please contact your bank or try a different card.',
            lost_card: 'This card has been reported lost. Please use a different payment method.',
            stolen_card: 'This card has been reported stolen. Please use a different payment method.',
            processing_error: 'A processing error occurred. Please try again in a moment.',
          };
          errMsg = (error.code && declineMessages[error.code]) || error.message || errMsg;
        } else if (error.type === 'validation_error') {
          errType = 'card';
          errMsg = error.message || 'Please check your payment details and try again.';
        } else if (
          error.code === 'payment_intent_authentication_failure' ||
          error.type === 'invalid_request_error'
        ) {
          errType = 'auth';
          errMsg = 'Your bank requires additional verification, but it could not be completed. Please try again or use a different card.';
        }

        setPaymentError({ type: errType, message: errMsg, code: error.code });
        setLoadingPaymentIntent(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded
        
        // Update finalCustomerId from payment intent if available (additional safety check)
        if (paymentIntent.customer) {
          if (!finalCustomerId) {
            finalCustomerId = paymentIntent.customer as string;
            setStripeCustomerId(finalCustomerId);
          }
        }
        
        // Save order details to localStorage for thank you page
        // Patch the pre-saved order with the confirmed payment intent ID and final total
        const confirmedOrder = {
          ...preSaveOrderDetails,
          paymentIntentId: paymentIntent.id,
          total: finalTotal.toFixed(2),
        };
        localStorage.setItem('lastOrder', JSON.stringify(confirmedOrder));
        const orderDetails = confirmedOrder;
        const orderTotal = finalTotal;

        // Send GTM purchase event
        sendGTMEvent('purchase', {
          transaction_id: orderDetails.orderNumber,
          value: orderTotal.toFixed(2)
        });

        // Persist GTM purchase event data to localStorage.
        // Fired on the thank you page — same clean-page strategy as the n8n webhook.
        // GA4 requires transaction_id and purchase fields inside an ecommerce object.
        const gtmTax = calculatedTaxAmount !== null ? calculatedTaxAmount : finalTaxes;
        const pendingGTMPurchase = {
          event: 'purchase',
          user_firstname: firstName || undefined,
          user_lastname: lastName || undefined,
          user_email: email || undefined,
          user_phone: mobileNumber || undefined,
          user_city: orderDetails.address?.city || undefined,
          user_region: orderDetails.address?.state || undefined,
          user_postal: orderDetails.address?.zipCode || undefined,
          user_country: country || undefined,
          product: 'advanced',
          plan: 'advanced',
          ecommerce: {
            transaction_id: String(orderDetails.orderNumber),
            value: parseFloat(orderTotal.toFixed(2)),
            tax: parseFloat(gtmTax.toFixed(2)),
            currency: country === 'CA' ? 'CAD' : 'USD',
            items: [{
              item_id: 'advanced',
              item_name: 'Voiply Advanced Business',
              item_category: 'advanced',
              quantity: getUserCount(),
              price: parseFloat(orderTotal.toFixed(2)),
            }],
          },
        };
        localStorage.setItem('pendingGTMPurchase', JSON.stringify(pendingGTMPurchase));
        
        // Send order data to n8n webhook
        try {
          // Map plan to interval
          const getInterval = () => {
            if (selectedPlan === '3month') return 'quarter';
            if (selectedPlan === 'annually') return 'year';
            if (selectedPlan === '3year') return '3year';
            return 'year';
          };
          
          // Get phone number in digits only format (last 10 digits, exclude +1)
          const getPhoneDigits = () => {
            let phoneDigits = '';
            if (hasPhone === false && selectedNewNumber) {
              phoneDigits = selectedNewNumber.replace(/\D/g, '');
            } else if (hasPhone === true && phoneNumber) {
              phoneDigits = phoneNumber.replace(/\D/g, '');
            }
            
            // Return last 10 digits only (remove +1 country code if present)
            return phoneDigits.length > 10 ? phoneDigits.slice(-10) : phoneDigits;
          };
          
          const webhookData = {
            plan: 'residential',
            phoneNumber: getPhoneDigits(),
            customerId: finalCustomerId, // Use the guaranteed customer ID
            orderId: orderDetails.orderNumber,
            userCount: '1',
            version: typeof window !== 'undefined' && window.location.hostname.includes('voiply.com') ? 'prod' : 'dev',
            interval: getInterval(),
            newNumber: hasPhone === false,
            email: email,
            address_1: addressComponents.street,
            address_2: address2 || '',
            city: addressComponents.city,
            country: country,
            name: `${firstName} ${lastName}`,
            postal_code: addressComponents.zipCode,
            shipping_method: '',
            state: addressComponents.state,
            bundle: getPhonesSummary(),
            ...(onlineFax ? { fax: true } : {}),
            ...(hasInternet === false && addInternetPackage ? {
              internetorder: true,
              internetrental: internetDevice === 'rental',
              internetbundle: internetPackage === 'unlimited-5g' ? 'unlimited' : 'phone-only'
            } : {})
          };
          
          // Verify customer ID exists before sending webhook
          if (!webhookData.customerId) {
            console.error('CRITICAL: Webhook customerId is empty!');
          }
          
          
          // Fire-and-forget — do NOT await. A slow/hung webhook must never block the redirect.
          fetch('https://voiply.app.n8n.cloud/webhook/6aceed8e-b47d-4b24-84ac-8e948357fed6', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(webhookData)
          }).catch(e => console.error('n8n webhook error:', e));
          
        } catch (webhookError) {
          console.error('Error sending to n8n webhook:', webhookError);
          // Don't block redirect if webhook fails
        }

        // Update Stripe customer with order metadata, billing and shipping addresses
        try {
          const billingAddr = billingSameAsShipping ? {
            line1: addressComponents.street,
            line2: address2 || '',
            city: addressComponents.city,
            state: addressComponents.state,
            postal_code: addressComponents.zipCode,
            country: country === 'CA' ? 'CA' : 'US',
          } : {
            line1: billingComponents.street,
            line2: billingAddress2 || '',
            city: billingComponents.city,
            state: billingComponents.state,
            postal_code: billingComponents.zipCode,
            country: billingCountry === 'CA' ? 'CA' : 'US',
          };

          const shippingAddr = {
            name: `${firstName} ${lastName}`.trim(),
            line1: addressComponents.street,
            line2: address2 || '',
            city: addressComponents.city,
            state: addressComponents.state,
            postal_code: addressComponents.zipCode,
            country: country === 'CA' ? 'CA' : 'US',
          };

          // 10-digit primary number (port or new)
          const primaryNumber = (() => {
            const raw = hasPhone === false && selectedNewNumber
              ? selectedNewNumber
              : hasPhone === true && phoneNumber
              ? phoneNumber
              : '';
            const digits = raw.replace(/\D/g, '');
            return digits.length > 10 ? digits.slice(-10) : digits;
          })();

          await fetch(`${basePath}/api/update-customer-metadata`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customerId: finalCustomerId,
              orderId: orderDetails.orderNumber,
              primaryNumber,
              product: ownDevice > 0 ? '' : (() => {
                const phoneEntries = Object.entries(selectedPhones);
                if (phoneEntries.length === 0) return '';
                return phoneEntries.map(([id, qty]) => {
                  const phone = PHONES.find(p => p.id === id);
                  return `${phone?.name || id} x${qty}`;
                }).join(', ');
              })(),
              zip: addressComponents.zipCode,
              fullName: `${firstName} ${lastName}`.trim(),
              shippingAddress: shippingAddr,
              billingAddress: billingAddr,
            }),
          });
        } catch (metaError) {
          console.error('Error updating Stripe customer metadata:', metaError);
          // Non-blocking — don't prevent redirect
        }
        
        // Clear session so returning to the URL starts fresh
        localStorage.removeItem('voiply_session_id');
        // Redirect to thank you page
        window.location.href = `${basePath}/order-confirmation?payment_intent=${paymentIntent.id}`;
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      setPaymentError({ type: 'generic', message: 'An unexpected error occurred. Please try again or call us at (844) 486-4759.' });
      setLoadingPaymentIntent(false);
    }
  };
  
  // Fetch tax breakdown
  const fetchTaxBreakdown = async (showModal: boolean = true, planOverride?: string) => {
    // Use override plan if provided, otherwise use selected plan
    const planToCalculate = planOverride || selectedPlan;
    
    // Generate cache key from current inputs including date
    const hardwareAmount = getPhoneHardwarePrice();
    const protectionAmount = 0;
    const shippingAmount = getShippingCost();
    const actualPlanPriceForTax = getPlanPriceForTax(planToCalculate);
    
    // Get current date for cache key (YYYYMMDD format)
    const today = new Date();
    const dateKey = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    
    const currentCacheKey = JSON.stringify({
      date: dateKey, // Invalidate cache on new day
      zip: addressComponents.zipCode,
      plan: planToCalculate,
      hardware: hardwareAmount,
      protection: protectionAmount,
      shipping: shippingAmount,
      planPrice: actualPlanPriceForTax,
      numUsers: getUserCount(),
      managedPhones: getTotalManagedPhones(),
      country
    });
    
    // Check if we have cached data for this exact combination
    const cachedData = taxCache[currentCacheKey];
    if (cachedData) {
      // Only restore display state if this is for the currently selected plan
      if (planToCalculate === selectedPlan) {
        setTaxBreakdown(cachedData);
        setCalculatedTaxAmount(cachedData.estimatedTotalTax || 0);
        
        // Ensure CSI submission_id is set from cached breakdown
        if (cachedData.submission_id && cachedData.submission_id !== csiSubmissionId) {
          setCsiSubmissionId(cachedData.submission_id);
        }
      }
      
      if (showModal && planToCalculate === selectedPlan) {
        setShowTaxModal(true);
      }
      return;
    }
    
    setLoadingTax(true);
    setTaxError('');
    
    try {
      // Map planToCalculate to duration (matching Azure function)
      const duration = planToCalculate === '3month' ? 'quarter' : planToCalculate === 'annually' ? 'year' : '3year';
      
      // Calculate actual monthly rate from plan (per user)
      const monthsMultiplier = duration === 'quarter' ? 3 : duration === 'year' ? 12 : 36;
      const actualMonthlyRate = actualPlanPriceForTax / monthsMultiplier;
      const numUsers = getUserCount();
      const totalManagedPhones = getTotalManagedPhones(); // desk phones + BYO
      
      // Split users into two telco categories:
      // - Hardware users: users with a desk phone or BYO device → V001-15
      // - App-only users: remaining users with no hardware → V001-7
      // Hardware users = min(totalManagedPhones, numUsers) — can't exceed total users
      const hardwareUsers = Math.min(totalManagedPhones, numUsers);
      const appOnlyUsers = numUsers - hardwareUsers;
      
      // Fixed $4/mo per user for telco regardless of category
      const telcoPerUser = 4.00;
      
      // V001-7: app-only users telco
      const telcoAppOnly = telcoPerUser * appOnlyUsers;
      // V001-15: hardware users telco
      const telcoHardwareTotal = telcoPerUser * hardwareUsers;
      
      // Support = (plan rate minus telco) × all users + managed desk phone ($5/mo each) + shipping
      const remainingMonthlyRate = actualMonthlyRate - telcoPerUser;
      const managedDeskPhoneMonthly = totalManagedPhones * 5;
      const supportTotal = (remainingMonthlyRate * numUsers) + managedDeskPhoneMonthly + (shippingAmount / monthsMultiplier);
      
      const response = await fetch(`${basePath}/api/calculate-taxes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          zip: addressComponents.zipCode,
          duration,
          hardwareAmount,
          support: supportTotal, // Monthly support total: (plan-telco)×users + $5×phones + shipping (C001-14)
          telco: telcoAppOnly, // App-only users: $4/mo × qty (V001-7)
          telcoHardware: telcoHardwareTotal, // Hardware users: $4/mo × qty (V001-15)
          protection: protectionAmount,
          extensions: 1, // Already multiplied into totals above
          locations: 1, // 1 business location for E911
          plan: selectedPlan, // E911 always applies (plan name won't contain 'advanced')
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to calculate taxes');
      }
      
      const data = await response.json();
      
      // Only update display state if this is for the currently selected plan
      if (planToCalculate === selectedPlan) {
        setTaxBreakdown(data);
        // Store the calculated tax for consistent display
        setCalculatedTaxAmount(data.estimatedTotalTax || 0);
        // Store the CSI submission_id for Stripe metadata
        if (data.submission_id) {
          setCsiSubmissionId(data.submission_id);
        }
      }
      
      // Store in multi-entry cache (always cache regardless of selected plan)
      setTaxCache(prev => ({
        ...prev,
        [currentCacheKey]: data
      }));
      
      if (showModal && planToCalculate === selectedPlan) {
        setShowTaxModal(true);
      }
    } catch (error) {
      console.error('Error fetching tax breakdown:', error);
      setTaxError('Unable to calculate tax breakdown. Please try again.');
    } finally {
      setLoadingTax(false);
    }
  };
  
  // Fetch taxes for all 3 plans (3-month, annual, 3-year)
  const fetchTaxesForAllPlans = async () => {
    
    // Fetch taxes for all plans in parallel (don't show modal)
    const plans = ['3month', 'annually', '3year'];
    
    try {
      await Promise.all(
        plans.map(plan => fetchTaxBreakdown(false, plan))
      );
    } catch (error) {
      console.error('Error pre-calculating taxes for all plans:', error);
      // Don't throw - let individual plan calculations work on demand
    }
  };
  
  // Auto-fetch taxes for all plans when entering step 5
  useEffect(() => {
    if (currentStep === 5 && addressComponents.zipCode) {
      fetchTaxesForAllPlans();
    }
  }, [currentStep, addressComponents.zipCode]);
  
  // Re-fetch taxes when plan selection or options change on step 5
  useEffect(() => {
    if (currentStep === 5 && addressComponents.zipCode) {
      // Fetch for currently selected plan (will use cache if available)
      fetchTaxBreakdown(false);
    }
  }, [selectedPlan, selectedPhones, ownDevice, numUsers]);
  
  const progressPercentage = (() => {
    // Calculate total steps based on flow
    let totalSteps = 2; // address + business needs always
    if (hasPhone === false) totalSteps++; // number selection
    if (needsPhonesStep) totalSteps++; // phone selection
    totalSteps++; // payment always
    
    // Calculate actual position
    let position = 0;
    if (currentStep >= 1) position = 1; // address
    if (currentStep >= 2) position = 2; // business needs
    if (currentStep >= 3 && hasPhone === false) position = 3; // number selection
    if (currentStep >= 4 && needsPhonesStep) {
      position = hasPhone === false ? 4 : 3; // phone selection
    }
    if (currentStep >= 5) position = totalSteps; // payment
    
    return (position / totalSteps) * 100;
  })();

  return (
    <>
      {/* Stripe SDK - Only load on Step 5 (payment page) */}
      {currentStep === 5 && (
        <Script 
          src="https://js.stripe.com/v3/"
          strategy="lazyOnload"
          onLoad={() => setStripeLoaded(true)}
        />
      )}
      
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header */}
        <header className="w-full">
          <div className="max-w-[1440px] mx-auto px-6 py-[18px] flex justify-between items-center gap-8">
            <div className="w-[100px] h-8">
              <img 
                src="https://63b4b496a6f4b9b3afd358772c056add.cdn.bubble.io/f1753191012861x650931340984918900/Auto%20Layout%20Horizontal.svg" 
                alt="Voiply Logo"
                className="w-full h-full"
                loading="eager"
                fetchPriority="high"
              />
            </div>
            <div className="text-sm text-[#585858]">
              Get Help at <a href="tel:8444864759" className="text-[#F53900]">(844) 486-4759</a>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-1 bg-[#FEEBE6]">
            <div 
              className="h-full bg-[#F53900] rounded-r-[5px] transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </header>

        {/* Main Content */}
        <main className={`flex-1 w-full mx-auto px-4 py-6 md:px-6 md:py-8 ${currentStep === 5 ? 'max-w-[975px]' : 'max-w-[650px]'}`}>
          {/* Step 1: Address & Phone */}
          {currentStep === 1 && (
            <>
              <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-[#080808] mb-2 leading-tight">
                  Let's verify your business address
                </h1>
                <p className="text-base md:text-lg text-[#585858] leading-tight">
                  We'll confirm Voiply service is available in your area
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-b from-transparent to-[#d9d9d926] p-4 md:p-6 space-y-4 md:space-y-6">
                  {/* Country Selection */}
                  <div className="space-y-1">
                    <label className="block text-sm text-[#080808]">
                      Country:
                    </label>
                    <select
                      value={country}
                      onChange={(e) => {
                        setCountry(e.target.value);
                        // Clear address fields when switching countries
                        setAddress('');
                        setAddress2('');
                        setAddressComponents({
                          street: '',
                          city: '',
                          state: '',
                          zipCode: ''
                        });
                        setSmartySuggestions([]);
                        setShowSuggestions(false);
                      }}
                      className="w-full h-10 md:h-12 px-3 bg-white border border-[#D9D9D9] rounded text-base text-[#080808] focus:outline-none focus:border-[#F53900] focus:ring-0"
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                    </select>
                  </div>
                  
                  {/* Address Autocomplete */}
                  <div className="space-y-1 relative">
                    <label className="block text-sm text-[#080808]">
                      Type your address:
                    </label>
                    <input
                      ref={addressInputRef}
                      type="text"
                      placeholder="Address"
                      value={address}
                      onChange={(e) => { handleAddressChange(e); setFieldErrors(prev => ({ ...prev, address: undefined })); }}
                      onFocus={() => smartySuggestions.length > 0 && setShowSuggestions(true)}
                      className={`w-full h-10 md:h-12 px-3 bg-white border rounded text-base text-[#080808] placeholder-[#585858] focus:outline-none focus:border-[#F53900] focus:ring-0 ${fieldErrors.address ? 'border-[#F53900]' : 'border-[#D9D9D9]'}`}
                    />
                    {fieldErrors.address && (
                      <p className="mt-1 text-sm text-[#F53900] flex items-center gap-1">
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                        {fieldErrors.address}
                      </p>
                    )}
                    
                    {/* Suggestions Dropdown */}
                    {showSuggestions && smartySuggestions.length > 0 && (
                      <div 
                        ref={suggestionsRef}
                        className="absolute z-[100] w-full mt-1 bg-white border-2 border-[#F6562A] rounded-lg shadow-2xl max-h-60 overflow-y-auto"
                      >
                        {smartySuggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => selectSuggestion(suggestion)}
                            className="w-full px-4 py-3 text-left hover:bg-[#FEEBE6] text-sm text-[#080808] border-b border-gray-200 last:border-b-0 transition-colors"
                          >
                            <div className="font-medium">{suggestion.street_line}</div>
                            <div className="text-xs text-[#585858] mt-1">
                              {suggestion.city}, {suggestion.state} {suggestion.zipcode}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Address Line 2 */}
                  {(addressComponents.street || address.length > 0) && (
                    <div className="space-y-1">
                      <input
                        type="text"
                        placeholder="Apt, suite, unit, building, floor, etc."
                        value={address2}
                        onChange={(e) => setAddress2(e.target.value)}
                        className="w-full h-10 md:h-12 px-3 bg-white border border-[#D9D9D9] rounded text-base text-[#080808] placeholder-[#585858] focus:outline-none focus:border-[#F53900] focus:ring-0"
                      />
                    </div>
                  )}

                  {/* City, State, Zip - Single line with manual entry option */}
                  {(addressComponents.street || address.length > 0) && (
                    <>
                      <div className="grid grid-cols-3 gap-3 md:gap-4">
                        <input
                          type="text"
                          placeholder="City"
                          value={addressComponents.city}
                          onChange={(e) => setAddressComponents({...addressComponents, city: e.target.value})}
                          className="h-10 md:h-12 px-3 bg-white border border-[#D9D9D9] rounded text-base text-[#080808] placeholder-[#585858] focus:outline-none focus:border-[#F53900] focus:ring-0"
                        />
                        {country === 'US' ? (
                          <select
                            value={addressComponents.state}
                            onChange={(e) => setAddressComponents({...addressComponents, state: e.target.value})}
                            className="h-10 md:h-12 px-3 bg-white border border-[#D9D9D9] rounded text-base text-[#080808] focus:outline-none focus:border-[#F53900] focus:ring-0"
                          >
                            <option value="">State</option>
                            {US_STATES.map(state => (
                              <option key={state.code} value={state.code}>
                                {state.code}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <select
                            value={addressComponents.state}
                            onChange={(e) => setAddressComponents({...addressComponents, state: e.target.value})}
                            className="h-10 md:h-12 px-3 bg-white border border-[#D9D9D9] rounded text-base text-[#080808] focus:outline-none focus:border-[#F53900] focus:ring-0"
                          >
                            <option value="">Province</option>
                            {CANADIAN_PROVINCES.map(province => (
                              <option key={province.code} value={province.code}>
                                {province.code}
                              </option>
                            ))}
                          </select>
                        )}
                        <input
                          type="text"
                          placeholder={country === 'CA' ? 'Postal Code' : 'Zip Code'}
                          value={addressComponents.zipCode}
                          onChange={(e) => {
                            setAddressComponents({...addressComponents, zipCode: e.target.value});
                            setZipFromAutocomplete(false); // Mark as manual entry
                            setZipError(''); // Clear error while typing
                            setZipHint(''); // Clear hint while typing
                          }}
                          onBlur={(e) => validateZipCode(e.target.value)}
                          inputMode={country === 'CA' ? 'text' : 'numeric'}
                          maxLength={country === 'CA' ? 7 : 5}
                          disabled={zipValidating}
                          className={`h-10 md:h-12 px-3 bg-white border rounded text-base text-[#080808] placeholder-[#585858] focus:outline-none focus:border-[#F53900] focus:ring-0 ${
                            zipError ? 'border-red-500' : 'border-[#D9D9D9]'
                          } ${zipValidating ? 'opacity-50 cursor-wait' : ''}`}
                        />
                      </div>
                      {/* ZIP validation messages below the entire row */}
                      {zipValidating && (
                        <p className="text-xs text-[#585858] mt-1">Validating...</p>
                      )}
                      {zipError && (
                        <p className="text-xs text-red-500 mt-1">{zipError}</p>
                      )}
                      {zipHint && !zipError && (
                        <p className="text-xs text-green-600 mt-1">{zipHint}</p>
                      )}
                    </>
                  )}

                  {/* Phone Question */}
                  <div ref={hasPhoneRef} className="space-y-1">
                    <label className="block text-sm text-[#080808]">
                      Would you like to keep your current phone number?
                    </label>
                    <div className="flex gap-4 md:gap-6">
                      <button
                        type="button"
                        onClick={() => { setHasPhone(true); setFieldErrors(prev => ({ ...prev, hasPhone: undefined })); }}
                        className={`flex-initial h-10 md:h-12 px-3 flex items-center gap-4 bg-white border rounded hover:border-[#F53900]/50 transition-colors ${fieldErrors.hasPhone && hasPhone === null ? 'border-[#F53900]' : 'border-[#D9D9D9]'}`}
                      >
                        <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center ${
                          hasPhone === true ? 'border-[#F53900]' : 'border-[#D9D9D9]'
                        }`}>
                          {hasPhone === true && <div className="w-[10px] h-[10px] rounded-full bg-[#F53900]"></div>}
                        </div>
                        <span className="text-sm text-[#080808]">Yes</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={async () => { 
                          setHasPhone(false); 
                          setFieldErrors(prev => ({ ...prev, hasPhone: undefined }));
                          // Query Telnyx for area code by city/state, fallback to 412
                          const city = addressComponents.city || '';
                          const state = addressComponents.state || '';
                          if (state) {
                            try {
                              const params = new URLSearchParams({ state });
                              if (city) params.set('city', city);
                              const res = await fetch(`${basePath}/api/area-code-lookup?${params}`);
                              const data = await res.json();
                              if (data.areaCode) {
                                setAreaCode(data.areaCode);
                                setSelectedNewNumber('');
                                return;
                              }
                            } catch {
                              // fall through to default
                            }
                          }
                          setAreaCode('412');
                        }}
                        className={`flex-1 h-10 md:h-12 px-3 flex items-center gap-4 bg-white border rounded hover:border-[#F53900]/50 transition-colors ${fieldErrors.hasPhone && hasPhone === null ? 'border-[#F53900]' : 'border-[#D9D9D9]'}`}
                      >
                        <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center ${
                          hasPhone === false ? 'border-[#F53900]' : 'border-[#D9D9D9]'
                        }`}>
                          {hasPhone === false && <div className="w-[10px] h-[10px] rounded-full bg-[#F53900]"></div>}
                        </div>
                        <span className="text-sm text-[#080808]">No, get a new number</span>
                      </button>
                    </div>
                    {fieldErrors.hasPhone && (
                      <p className="mt-1 text-sm text-[#F53900] flex items-center gap-1">
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                        {fieldErrors.hasPhone}
                      </p>
                    )}
                  </div>

                  {/* Phone Number Input */}
                  {hasPhone === true && (
                    <div className="space-y-2">
                      <label className="block text-sm text-[#080808]">
                        Enter your primary business number:
                      </label>
                      <div className="relative">
                        <input
                          ref={phoneNumberRef}
                          type="tel"
                          placeholder="(717) 123-4567"
                          value={phoneNumber}
                          onChange={(e) => { handlePhoneChange(e); setFieldErrors(prev => ({ ...prev, phoneNumber: undefined })); }}
                          inputMode="tel"
                          className={`w-full h-10 md:h-12 px-3 pr-16 bg-white border rounded text-base text-[#080808] placeholder-[#BDBDBD] focus:outline-none focus:border-[#F53900] focus:ring-0 ${fieldErrors.phoneNumber ? 'border-[#F53900]' : 'border-[#D9D9D9]'}`}
                        />
                        
                        {/* Validation Checkmark */}
                        {phoneValidated && !phoneValidating && (
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#FEEBE6] flex items-center justify-center text-[#F53900]"
                            title="We can transfer this number!"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                          </button>
                        )}
                        
                        {/* Loading Spinner */}
                        {phoneValidating && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="w-5 h-5 border-2 border-[#F53900] border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>
                      
                      {/* Error Message */}
                      {(phoneErrorMessage || fieldErrors.phoneNumber) && (
                        <div className="text-sm text-red-600 flex items-start gap-2">
                          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                          </svg>
                          <span>{phoneErrorMessage || fieldErrors.phoneNumber}</span>
                        </div>
                      )}
                      
                      {/* Success Message */}
                      {phoneValidated && (
                        <div className="text-sm text-green-600 flex items-start gap-2">
                          <svg className="w-4 h-4 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                          <div>
                            <div className="font-medium">Great news! We can transfer your number</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Internet Question */}
                  <div ref={hasInternetRef} className="space-y-1">
                    <label className="block text-sm text-[#080808]">
                      Do you have internet service?
                    </label>
                    <div className="flex gap-6">
                      <button
                        type="button"
                        onClick={() => { setHasInternet(true); setFieldErrors(prev => ({ ...prev, hasInternet: undefined })); }}
                        className={`flex-1 h-12 px-3 flex items-center gap-4 bg-white border rounded hover:border-[#F53900]/50 transition-colors ${fieldErrors.hasInternet && hasInternet === null ? 'border-[#F53900]' : 'border-[#D9D9D9]'}`}
                      >
                        <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center ${
                          hasInternet === true ? 'border-[#F53900]' : 'border-[#D9D9D9]'
                        }`}>
                          {hasInternet === true && <div className="w-[10px] h-[10px] rounded-full bg-[#F53900]"></div>}
                        </div>
                        <span className="text-sm text-[#080808]">Yes</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => { setHasInternet(false); setFieldErrors(prev => ({ ...prev, hasInternet: undefined })); }}
                        className={`flex-1 h-12 px-3 flex items-center gap-4 bg-white border rounded hover:border-[#F53900]/50 transition-colors ${fieldErrors.hasInternet && hasInternet === null ? 'border-[#F53900]' : 'border-[#D9D9D9]'}`}
                      >
                        <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center ${
                          hasInternet === false ? 'border-[#F53900]' : 'border-[#D9D9D9]'
                        }`}>
                          {hasInternet === false && <div className="w-[10px] h-[10px] rounded-full bg-[#F53900]"></div>}
                        </div>
                        <span className="text-sm text-[#080808]">No</span>
                      </button>
                    </div>
                    {fieldErrors.hasInternet && (
                      <p className="mt-1 text-sm text-[#F53900] flex items-center gap-1">
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                        {fieldErrors.hasInternet}
                      </p>
                    )}
                  </div>
                </div>


                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full max-w-[300px] h-12 md:h-14 rounded-[5px] text-base md:text-lg font-semibold transition-colors bg-[#F53900] text-white hover:bg-[#d63300] cursor-pointer"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Step 2: Business Needs Assessment */}
          {currentStep === 2 && (
            <>
              <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-[#080808] mb-2 leading-tight">
                  Learn more about your business needs
                </h1>
                <p className="text-base md:text-lg text-[#585858] leading-tight">
                  Help us understand your requirements to get you the best quote
                </p>
              </div>

              <div className="space-y-6 md:space-y-8">
                {/* How many users need a phone number? - Slider */}
                <div>
                  <label className="block text-sm font-medium text-[#080808] mb-4">
                    How many users need a phone number?
                  </label>
                  <div className="bg-[#F9F9F9] rounded-xl p-5 md:p-6">
                    <div className="flex items-center justify-center mb-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            const current = parseInt(numUsers) || 1;
                            if (current > 1) setNumUsers(String(current - 1));
                          }}
                          disabled={!numUsers || parseInt(numUsers) <= 1}
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                            !numUsers || parseInt(numUsers) <= 1
                              ? 'border-[#E8E8E8] text-[#CCC] cursor-not-allowed'
                              : 'border-[#F53900] text-[#F53900] hover:bg-[#FFF5F2] active:scale-95'
                          }`}
                        >
                          <span className="text-xl font-bold leading-none">−</span>
                        </button>
                        <div className="text-center min-w-[80px]">
                          <span className="text-4xl font-bold text-[#F53900]">{numUsers || '1'}</span>
                          <p className="text-xs text-[#999] mt-0.5">user{(!numUsers || numUsers === '1') ? '' : 's'}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const current = parseInt(numUsers) || 0;
                            if (current < 25) setNumUsers(String(current + 1));
                          }}
                          disabled={parseInt(numUsers) >= 25}
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                            parseInt(numUsers) >= 25
                              ? 'border-[#E8E8E8] text-[#CCC] cursor-not-allowed'
                              : 'border-[#F53900] text-[#F53900] hover:bg-[#FFF5F2] active:scale-95'
                          }`}
                        >
                          <span className="text-xl font-bold leading-none">+</span>
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="25"
                      value={numUsers || '1'}
                      onChange={(e) => setNumUsers(e.target.value)}
                      className="w-full h-2 bg-[#E8E8E8] rounded-full appearance-none cursor-pointer accent-[#F53900]"
                      style={{
                        background: `linear-gradient(to right, #F53900 0%, #F53900 ${((parseInt(numUsers || '1') - 1) / 24) * 100}%, #E8E8E8 ${((parseInt(numUsers || '1') - 1) / 24) * 100}%, #E8E8E8 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-[#999] mt-1">
                      <span>1</span>
                      <span>5</span>
                      <span>10</span>
                      <span>15</span>
                      <span>20</span>
                      <span>25</span>
                    </div>
                  </div>
                </div>

                {/* How will your team make and receive calls? - Card selection */}
                <div>
                  <label className="block text-sm font-medium text-[#080808] mb-3">
                    How will your team make and receive calls?
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'app-only', label: 'Mobile App', icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      )},
                      { value: 'desk-phones', label: 'Desk Phone', icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      )},
                      { value: 'both', label: 'Both', icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      )}
                    ].map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setCallMethod(option.value)}
                        className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 transition-all ${
                          callMethod === option.value
                            ? 'border-[#F53900] bg-[#FFF5F2] text-[#F53900]'
                            : 'border-[#E8E8E8] bg-white text-[#585858] hover:border-[#F53900]/50'
                        }`}
                      >
                        <div className={callMethod === option.value ? 'text-[#F53900]' : 'text-[#585858]'}>
                          {option.icon}
                        </div>
                        <span className={`text-sm font-semibold ${callMethod === option.value ? 'text-[#F53900]' : 'text-[#080808]'}`}>
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* What type of business calling do you do? */}
                <div>
                  <label className="block text-sm font-medium text-[#080808] mb-2">
                    What type of business calling do you do?
                  </label>
                  <select
                    value={highCallVolume}
                    onChange={(e) => setHighCallVolume(e.target.value)}
                    className="w-full h-12 px-3 bg-white border border-[#D9D9D9] rounded text-base text-[#080808] focus:outline-none focus:border-[#F53900] focus:ring-0 appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23585858' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                  >
                    <option value="" disabled>Select call type</option>
                    <option value="standard">Standard business use</option>
                    <option value="high-volume">High call volumes</option>
                    <option value="call-center">Call center operations</option>
                  </select>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="w-full max-w-[140px] h-12 md:h-14 rounded-[5px] text-base md:text-lg font-semibold transition-colors border border-[#D9D9D9] text-[#585858] hover:bg-gray-50 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={!canProceedStep2}
                    className={`w-full max-w-[300px] h-12 md:h-14 rounded-[5px] text-base md:text-lg font-semibold transition-colors ${
                      canProceedStep2
                        ? 'bg-[#F53900] text-white hover:bg-[#d63300] cursor-pointer'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Step 3: New Number Selection (only if hasPhone === false) */}
          {currentStep === 3 && (
            <>
              <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-[#080808] mb-2 leading-tight">
                  Select your new number
                </h1>
                <p className="text-base md:text-lg text-[#585858] leading-tight">
                  Choose a local or toll-free number for your business
                </p>
              </div>

              <div className="space-y-5">
                {/* Local / Toll-Free Toggle */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => { setNumberType('local'); setAvailableNumbers([]); setSelectedNewNumber(''); }}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${
                      numberType === 'local'
                        ? 'border-[#F53900] bg-[#FFF5F2] text-[#F53900]'
                        : 'border-[#E8E8E8] bg-white text-[#585858] hover:border-[#F53900]/50'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className={`text-sm font-semibold ${numberType === 'local' ? 'text-[#F53900]' : 'text-[#080808]'}`}>Local Number</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNumberType('toll_free'); setAvailableNumbers([]); setSelectedNewNumber(''); }}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${
                      numberType === 'toll_free'
                        ? 'border-[#F53900] bg-[#FFF5F2] text-[#F53900]'
                        : 'border-[#E8E8E8] bg-white text-[#585858] hover:border-[#F53900]/50'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className={`text-sm font-semibold ${numberType === 'toll_free' ? 'text-[#F53900]' : 'text-[#080808]'}`}>Toll-Free Number</span>
                  </button>
                </div>

                {/* Search Controls */}
                <div className="bg-gradient-to-b from-transparent to-[#d9d9d926] p-4 md:p-6 space-y-3">
                  {numberType === 'local' && (
                    <div>
                      <label className="block text-sm text-[#080808] font-medium mb-1.5">
                        Area code
                      </label>
                      <input
                        type="text"
                        value={areaCode}
                        onChange={handleAreaCodeChange}
                        placeholder="412"
                        inputMode="numeric"
                        maxLength={3}
                        className="w-[100px] md:w-[120px] h-12 px-3 bg-white border border-[#D9D9D9] rounded-lg text-xl font-semibold text-[#080808] text-center tracking-[6px] placeholder-[#BDBDBD] focus:outline-none focus:border-[#F53900] focus:ring-0 transition-all"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm text-[#080808] font-medium mb-1.5">
                      Search by keyword <span className="text-[#999] font-normal">(optional)</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={numberKeyword}
                        onChange={(e) => setNumberKeyword(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (numberType === 'local' && areaCode.length === 3) {
                              fetchAvailableNumbers(areaCode, 'local', numberKeyword);
                            } else if (numberType === 'toll_free') {
                              fetchAvailableNumbers('', 'toll_free', numberKeyword);
                            }
                          }
                        }}
                        placeholder={numberType === 'toll_free' ? 'e.g. 800, 888, or digits like 1234' : 'e.g. digits like 7000 or 1234'}
                        className="flex-1 h-12 px-3 bg-white border border-[#D9D9D9] rounded-lg text-sm text-[#080808] placeholder-[#BDBDBD] focus:outline-none focus:border-[#F53900] focus:ring-0 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (numberType === 'local' && areaCode.length === 3) {
                            fetchAvailableNumbers(areaCode, 'local', numberKeyword);
                          } else if (numberType === 'toll_free') {
                            fetchAvailableNumbers('', 'toll_free', numberKeyword);
                          }
                        }}
                        disabled={numberType === 'local' && areaCode.length !== 3}
                        className={`h-12 px-5 rounded-lg text-sm font-semibold transition-all ${
                          (numberType === 'toll_free' || areaCode.length === 3)
                            ? 'bg-[#F53900] text-white hover:bg-[#d63300] cursor-pointer'
                            : 'bg-[#E8E8E8] text-[#999] cursor-not-allowed'
                        }`}
                      >
                        Search
                      </button>
                    </div>
                  </div>
                </div>

                {/* Available Numbers Grid */}
                <div className="space-y-2">
                  {loadingNumbers ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-8 h-8 border-2 border-[#F53900] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : availableNumbers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <svg className="w-16 h-16 text-gray-300 mb-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                      </svg>
                      <p className="text-sm text-[#585858]">No results found</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        {availableNumbers.slice(0, 10).map((number) => (
                          <button
                            key={number}
                            type="button"
                            onClick={() => handleSelectNumber(number)}
                            className={`h-10 md:h-12 px-4 rounded border text-sm md:text-base font-medium transition-all ${
                              selectedNewNumber === number
                                ? 'border-[#F53900] bg-[#FEEBE6] text-[#080808]'
                                : 'border-[#D9D9D9] bg-white text-[#080808] hover:border-[#F53900]/50 hover:bg-[#FEEBE6]/30'
                            }`}
                          >
                            {formatPhoneNumber(number.replace('+1', ''))}
                          </button>
                        ))}
                      </div>
                      
                      {/* Reservation Error Message */}
                      {reservationError && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                          <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                          </svg>
                          <div className="flex-1">
                            <p className="text-sm text-red-800 font-medium">This number is no longer available</p>
                            <p className="text-xs text-red-700 mt-1">Please select a different number</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="min-w-[150px] h-10 md:h-12 rounded-[5px] text-sm md:text-base border border-[#D9D9D9] text-[#080808] hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={!canProceedStep3 || reservingNumber}
                    onClick={handleNextStep}
                    className={`flex-1 h-10 md:h-12 rounded-[5px] text-sm md:text-base transition-colors ${
                      canProceedStep3 && !reservingNumber
                        ? 'bg-[#F53900] text-white hover:bg-[#d63300] cursor-pointer' 
                        : 'bg-[#E9E9E9] text-[#A5A5A5] cursor-not-allowed'
                    }`}
                  >
                    {reservingNumber ? 'Reserving number...' : 'Next'}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Step 4: Bundle Selection */}
          {currentStep === 4 && (
            <>
              <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-[#080808] mb-2 leading-tight">
                  Select Your Desk Phones
                </h1>
                <p className="text-base md:text-lg text-[#585858] leading-tight">
                  Choose the phones your team needs. Each desk phone includes managed support ($5/mo).
                </p>
              </div>

              <div className="space-y-6">
                {/* Cart Summary - sticky on mobile */}
                {getTotalPhoneCount() > 0 && (
                  <div className="bg-[#FFF5F2] border border-[#F53900]/20 rounded-xl p-4 md:sticky md:top-4 z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#F53900] flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{getTotalPhoneCount()}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#080808]">
                            {getTotalPhoneCount()} {getTotalPhoneCount() === 1 ? 'phone' : 'phones'} selected
                          </p>
                          <p className="text-xs text-[#585858]">
                            Hardware: ${getPhoneHardwarePrice().toFixed(2)} + ${(getTotalPhoneCount() * 5).toFixed(2)}/mo support
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedPhones({})}
                        className="text-xs text-[#F53900] hover:underline font-medium"
                      >
                        Clear all
                      </button>
                    </div>
                    {/* Cart items */}
                    <div className="mt-3 pt-3 border-t border-[#F53900]/10 space-y-2">
                      {Object.entries(selectedPhones).map(([phoneId, qty]) => {
                        const phone = PHONES.find(p => p.id === phoneId);
                        if (!phone) return null;
                        return (
                          <div key={phoneId} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img src={phone.image} alt={phone.name} className="w-8 h-8 object-contain" />
                              <span className="text-xs font-medium text-[#080808]">{phone.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={() => removePhoneFromCart(phoneId)}
                                className="w-6 h-6 rounded-full border border-[#D9D9D9] flex items-center justify-center text-[#585858] hover:bg-[#F5F5F5]">
                                <span className="text-xs font-bold">−</span>
                              </button>
                              <span className="text-sm font-semibold w-6 text-center">{qty}</span>
                              <button type="button" onClick={() => addPhoneToCart(phoneId)}
                                className="w-6 h-6 rounded-full border border-[#D9D9D9] flex items-center justify-center text-[#585858] hover:bg-[#F5F5F5]">
                                <span className="text-xs font-bold">+</span>
                              </button>
                              <span className="text-xs font-semibold text-[#080808] w-16 text-right">
                                {phone.isFree ? 'FREE' : `$${(phone.price * qty).toFixed(2)}`}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Phone Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {PHONES.map((phone) => {
                    const qtyInCart = selectedPhones[phone.id] || 0;
                    return (
                      <div
                        key={phone.id}
                        className={`relative border rounded-xl overflow-hidden transition-all ${
                          qtyInCart > 0
                            ? 'border-[#F53900] shadow-[0_0_0_2px_#FEEBE6]'
                            : 'border-[#D9D9D9] hover:border-[#F53900]/50'
                        }`}
                      >
                        {/* Quantity badge */}
                        {qtyInCart > 0 && (
                          <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-[#F53900] flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{qtyInCart}</span>
                          </div>
                        )}

                        {/* Free badge */}
                        {phone.isFree && (
                          <div className="absolute top-2 left-2 z-10 bg-[#17DB4E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            FREE
                          </div>
                        )}

                        {/* Phone Image */}
                        <div className="bg-gradient-to-b from-[#FAFAFA] to-[#F0F0F0] p-3 md:p-4">
                          <div className="relative w-full aspect-square">
                            <img
                              src={phone.image}
                              alt={phone.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </div>

                        {/* Phone Details */}
                        <div className="p-3 md:p-4 space-y-2">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-[#999] font-medium">{phone.category}</p>
                            <h3 className="text-xs md:text-sm font-bold text-[#080808] leading-tight mt-0.5">{phone.name}</h3>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {phone.isFree ? (
                              <>
                                <span className="text-xs text-[#999] line-through">${phone.originalPrice}</span>
                                <span className="text-sm font-bold text-[#17DB4E]">FREE</span>
                              </>
                            ) : (
                              <>
                                {phone.originalPrice > phone.price && (
                                  <span className="text-xs text-[#999] line-through">${phone.originalPrice}</span>
                                )}
                                <span className="text-sm font-bold text-[#080808]">${phone.price.toFixed(2)}</span>
                              </>
                            )}
                          </div>

                          {/* Add to cart / quantity controls */}
                          {qtyInCart === 0 ? (
                            <button
                              type="button"
                              onClick={() => addPhoneToCart(phone.id)}
                              className="w-full py-2 rounded-lg text-xs font-semibold bg-[#F53900] text-white hover:bg-[#d63300] transition-colors"
                            >
                              Add to Cart
                            </button>
                          ) : (
                            <div className="flex items-center justify-between bg-[#F5F5F5] rounded-lg py-1 px-2">
                              <button type="button" onClick={() => removePhoneFromCart(phone.id)}
                                className="w-7 h-7 rounded-full bg-white border border-[#D9D9D9] flex items-center justify-center hover:bg-[#FFF5F2] transition-colors">
                                <span className="text-sm font-bold text-[#585858]">−</span>
                              </button>
                              <span className="text-sm font-bold text-[#080808]">{qtyInCart}</span>
                              <button type="button" onClick={() => addPhoneToCart(phone.id)}
                                className="w-7 h-7 rounded-full bg-white border border-[#D9D9D9] flex items-center justify-center hover:bg-[#FFF5F2] transition-colors">
                                <span className="text-sm font-bold text-[#585858]">+</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Own Device Option - with quantity controls */}
                <div className={`relative border-2 rounded-xl p-3 md:p-6 transition-all ${
                  ownDevice > 0
                    ? 'border-[#F53900] bg-[#FEEBE6]/30 shadow-[0_0_0_2px_#FEEBE6]' 
                    : 'border-[#D9D9D9] bg-white'
                }`}>
                  {ownDevice > 0 && (
                    <div className="absolute top-3 md:top-4 right-3 md:right-4 bg-[#F53900] text-white text-xs px-3 py-1 rounded-full font-semibold">
                      {ownDevice} selected
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className={`hidden md:flex w-12 h-12 rounded-full items-center justify-center flex-shrink-0 ${
                      ownDevice > 0 ? 'bg-[#F53900]' : 'bg-[#F5F5F5]'
                    }`}>
                      <svg className={`w-6 h-6 ${ownDevice > 0 ? 'text-white' : 'text-[#585858]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                      </svg>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm md:text-base lg:text-lg font-bold text-[#080808] mb-1 md:mb-2">
                        I have my own VoIP phones
                      </h3>
                      <p className="text-xs md:text-sm text-[#585858] mb-3">
                        Already have compatible VoIP phones? We&#39;ll help you set them up.
                      </p>
                      
                      {/* Quantity controls */}
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            if (ownDevice > 0) setOwnDevice(ownDevice - 1);
                          }}
                          disabled={ownDevice <= 0}
                          className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${
                            ownDevice <= 0
                              ? 'border-[#E8E8E8] text-[#CCC] cursor-not-allowed'
                              : 'border-[#F53900] text-[#F53900] hover:bg-[#FFF5F2] active:scale-95'
                          }`}
                        >
                          <span className="text-lg font-bold leading-none">&minus;</span>
                        </button>
                        <span className="text-xl font-bold text-[#080808] w-8 text-center">{ownDevice}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setOwnDevice(ownDevice + 1);

                          }}
                          className="w-9 h-9 rounded-full border-2 border-[#F53900] text-[#F53900] hover:bg-[#FFF5F2] flex items-center justify-center transition-all active:scale-95"
                        >
                          <span className="text-lg font-bold leading-none">+</span>
                        </button>
                      </div>
                      
                      <div className="hidden md:flex items-center gap-2 text-xs text-[#585858] mt-3">
                        <svg className="w-4 h-4 text-[#17DB4E]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        <span className="font-medium">Not sure if yours is compatible?</span>
                        <span>We&#39;re happy to help - just ask!</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="min-w-[150px] h-12 rounded-[5px] text-base border border-[#D9D9D9] text-[#080808] hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={!canProceedStep4}
                    onClick={handleNextStep}
                    className={`flex-1 h-12 rounded-[5px] text-base transition-colors ${
                      canProceedStep4
                        ? 'bg-[#F53900] text-white hover:bg-[#d63300] cursor-pointer' 
                        : 'bg-[#E9E9E9] text-[#A5A5A5] cursor-not-allowed'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Step 5: Payment - Two Column Layout */}
          {currentStep === 5 && (
            <>
              <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-[#080808] mb-2 leading-tight">
                  Almost there! Review your order
                </h1>
                <p className="text-base md:text-lg text-[#585858] leading-tight">
                  Check everything looks good, then complete your secure payment
                </p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* LEFT COLUMN - Order Summary */}
                <div className="space-y-6">
                  <div className="bg-white border border-[#D9D9D9] rounded-lg p-4 md:p-6 space-y-4 md:space-y-5">

                    {/* Expected Delivery - top of card, replaces ORDER SUMMARY heading */}
                    <div className="flex items-center gap-3 pb-4 border-b border-[#F0F0F0]">
                      <div className="w-9 h-9 rounded-full bg-[#FFF0ED] flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-[#F53900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-[#AAAAAA]">Expected Delivery</p>
                        <p className="text-sm font-semibold text-[#080808]">{getDeliveryDate()}</p>
                      </div>
                    </div>

                    {/* Line Items - uniform style */}
                    <div className="space-y-0">

                      {/* Activation / Transfer */}
                      <div className="flex justify-between items-center py-2.5 border-b border-[#F5F5F5]">
                        <div>
                          <p className="text-sm font-medium text-[#080808]">
                            {hasPhone ? 'Transfer' : 'Activate'}&nbsp;
                            <span className="text-[#F53900]">{formatPhoneNumber((hasPhone ? phoneNumber : selectedNewNumber).replace('+1', ''))}</span>
                          </p>
                        </div>
                        <span className="text-sm font-bold text-[#17DB4E]">FREE</span>
                      </div>

                      {/* Selected Phones - Hardware */}
                      {ownDevice === 0 && Object.entries(selectedPhones).map(([phoneId, qty]) => {
                        const phone = PHONES.find(p => p.id === phoneId);
                        if (!phone) return null;
                        return (
                          <div key={phoneId} className="flex justify-between items-center py-2.5 border-b border-[#F5F5F5]">
                            <div>
                              <p className="text-sm font-medium text-[#080808]">
                                {phone.name}{qty > 1 ? ` ×${qty}` : ''}
                              </p>
                              <p className="text-xs text-[#999]">Hardware</p>
                            </div>
                            <span className={`text-sm font-bold ${phone.isFree ? 'text-[#17DB4E]' : 'text-[#080808]'}`}>
                              {phone.isFree ? 'FREE' : `$${(phone.price * qty).toFixed(2)}`}
                            </span>
                          </div>
                        );
                      })}

                      {/* Managed Desk Phone - recurring per phone (includes own devices) */}
                      {getTotalManagedPhones() > 0 && (
                        <div className="flex justify-between items-center py-2.5 border-b border-[#F5F5F5]">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-medium text-[#080808]">
                                Managed Desk Phone{getTotalManagedPhones() > 1 ? ` ×${getTotalManagedPhones()}` : ''}
                              </p>
                              <button
                                type="button"
                                onClick={() => setShowManagedPhoneModal(true)}
                                title="What's included?"
                                className="w-4 h-4 rounded-full bg-[#E8E8E8] hover:bg-[#D9D9D9] flex items-center justify-center transition-colors flex-shrink-0"
                              >
                                <span className="text-[9px] font-bold text-[#666] leading-none">?</span>
                              </button>
                            </div>
                            <p className="text-xs text-[#999]">${(5).toFixed(2)}/mo per phone × {getPlanMonths()} mo</p>
                          </div>
                          <span className="text-sm font-bold text-[#080808]">
                            ${getManagedDeskPhonePrice().toFixed(2)}
                          </span>
                        </div>
                      )}

                      {/* Own Equipment */}
                      {ownDevice > 0 && (
                        <div className="flex justify-between items-center py-2.5 border-b border-[#F5F5F5]">
                          <p className="text-sm font-medium text-[#080808]">Own Equipment{ownDevice > 1 ? ` ×${ownDevice}` : ''}</p>
                          <span className="text-sm font-bold text-[#17DB4E]">No hardware cost</span>
                        </div>
                      )}

                      {/* Online Fax */}
                      {onlineFax && (
                        <div className="flex justify-between items-center py-2.5 border-b border-[#F5F5F5]">
                          <div>
                            <p className="text-sm font-medium text-[#080808]">Online Fax</p>
                            <p className="text-xs text-[#999]">First month free, then ${getOnlineFaxPrice().toFixed(2)}/mo</p>
                          </div>
                          <span className="text-sm font-bold text-[#17DB4E]">FREE</span>
                        </div>
                      )}

                      {/* Internet Package */}
                      {hasInternet === false && addInternetPackage && (
                        <div className="flex justify-between items-center py-2.5 border-b border-[#F5F5F5]">
                          <div>
                            <p className="text-sm font-medium text-[#080808]">Voiply Internet</p>
                            <p className="text-xs text-[#999]">
                              {internetPackage === 'phone-only' ? 'Phone Only' : 'Unlimited 5G'} + {internetDevice === 'rental' ? 'Rental Device' : 'Device Purchase'}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-[#080808]">
                            ${(() => {
                              const pp: { [key: string]: number } = { 'phone-only': 16.95, 'unlimited-5g': 84.95 };
                              return (pp[internetPackage] || 16.95) + (internetDevice === 'rental' ? 15 : 199);
                            })().toFixed(2)}{country === 'CA' ? ' CAD' : ''}
                          </span>
                        </div>
                      )}

                      {/* Shipping */}
                      {getShippingCost() > 0 && (
                        <div className="flex justify-between items-center py-2.5 border-b border-[#F5F5F5]">
                          <div>
                            <p className="text-sm font-medium text-[#080808]">Shipping</p>
                            <p className="text-xs text-[#999]">Flat rate to Canada</p>
                          </div>
                          <span className="text-sm font-bold text-[#080808]">${getShippingCost().toFixed(2)} CAD</span>
                        </div>
                      )}

                      {/* Taxes & Fees */}
                      <div className="flex justify-between items-center py-2.5 border-b border-[#F5F5F5]">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium text-[#080808]">Taxes & Fees</p>
                          <button
                            type="button"
                            onClick={() => fetchTaxBreakdown(true)}
                            disabled={loadingTax}
                            title="View tax breakdown"
                            className="w-4 h-4 rounded-full bg-[#E8E8E8] hover:bg-[#D9D9D9] flex items-center justify-center transition-colors flex-shrink-0"
                          >
                            {loadingTax
                              ? <svg className="w-2.5 h-2.5 text-[#888] animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                              : <span className="text-[9px] font-bold text-[#666] leading-none">?</span>
                            }
                          </button>
                          {taxError && <p className="text-xs text-red-500">{taxError}</p>}
                        </div>
                        <span className="text-sm font-bold text-[#080808]">
                          ${(() => {
                            if (calculatedTaxAmount !== null) return calculatedTaxAmount.toFixed(2);
                            const planPriceForTax = getPlanPriceForTax();
                            const devicePrice = getPhoneHardwarePrice();
                            const protectionPrice = 0;
                            const shippingCost = getShippingCost();
                            const managedDeskPhonePrice = getManagedDeskPhonePriceForTax();
            const taxableSubtotal = planPriceForTax + devicePrice + managedDeskPhonePrice + protectionPrice + shippingCost;
                            return (taxableSubtotal * 0.47).toFixed(2);
                          })()}{country === 'CA' ? ' CAD' : ''}
                        </span>
                      </div>

                    </div>

                    {/* Plan Selector - 3 vertical card boxes */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold uppercase tracking-widest text-[#AAAAAA]">
                          Select your plan for {getUserCount()} user{getUserCount() !== 1 ? 's' : ''}
                        </p>
                        <div className="flex items-center gap-3">
                          {needsPhonesStep && (
                            <button
                              type="button"
                              onClick={() => setCurrentStep(4)}
                              className="flex items-center gap-1 text-xs text-[#F53900] hover:underline font-medium"
                              title="Edit phone selection"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                              Edit phones
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* User quantity control */}
                      <div className="flex items-center justify-between bg-[#F9F9F9] rounded-lg px-4 py-2.5 mb-3">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-[#585858]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-sm font-medium text-[#080808]">Users</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const current = getUserCount();
                              if (current > 1) setNumUsers(String(current - 1));
                            }}
                            disabled={getUserCount() <= 1}
                            className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors ${
                              getUserCount() <= 1 ? 'border-[#E8E8E8] text-[#CCC] cursor-not-allowed' : 'border-[#D9D9D9] text-[#585858] hover:bg-[#FFF5F2] hover:border-[#F53900]'
                            }`}
                          >
                            <span className="text-sm font-bold">−</span>
                          </button>
                          <span className="text-base font-bold text-[#080808] w-8 text-center">{getUserCount()}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const current = getUserCount();
                              if (current < 25) setNumUsers(String(current + 1));
                            }}
                            disabled={getUserCount() >= 25}
                            className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors ${
                              getUserCount() >= 25 ? 'border-[#E8E8E8] text-[#CCC] cursor-not-allowed' : 'border-[#D9D9D9] text-[#585858] hover:bg-[#FFF5F2] hover:border-[#F53900]'
                            }`}
                          >
                            <span className="text-sm font-bold">+</span>
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">

                        {/* 3-Month */}
                        <button
                          type="button"
                          onClick={() => setSelectedPlan('3month')}
                          className={`w-full flex justify-between items-center px-4 py-3 rounded-xl border-2 transition-all ${
                            selectedPlan === '3month'
                              ? 'border-[#F53900] bg-[#FFF5F2]'
                              : 'border-[#E8E8E8] bg-white hover:border-[#F53900]'
                          }`}
                        >
                          <div className="text-left">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-semibold ${selectedPlan === '3month' ? 'text-[#F53900]' : 'text-[#080808]'}`}>3-Month</span>
                              {couponApplied && (
                                <span className="text-[9px] font-bold text-white bg-[#17DB4E] px-1.5 py-0.5 rounded-full">1 MONTH FREE</span>
                              )}
                            </div>
                            <p className="text-xs text-[#999] mt-0.5">{couponApplied ? '$7.97' : '$11.95'}/mo per user</p>
                          </div>
                          <div className="text-right">
                            {couponApplied && (
                              <p className="text-xs text-[#CCC] line-through">${(35.85 * getUserCount()).toFixed(2)}</p>
                            )}
                            <span className={`text-base font-bold ${selectedPlan === '3month' ? 'text-[#F53900]' : 'text-[#080808]'}`}>
                              ${(couponApplied ? 23.90 * getUserCount() : 35.85 * getUserCount()).toFixed(2)}
                            </span>
                          </div>
                        </button>

                        {/* 1-Year */}
                        <button
                          type="button"
                          onClick={() => setSelectedPlan('annually')}
                          className={`w-full flex justify-between items-center px-4 py-3 rounded-xl border-2 transition-all relative ${
                            selectedPlan === 'annually'
                              ? 'border-[#F53900] bg-[#FFF5F2]'
                              : 'border-[#E8E8E8] bg-white hover:border-[#F53900]'
                          }`}
                        >
                          <div className="text-left">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-semibold ${selectedPlan === 'annually' ? 'text-[#F53900]' : 'text-[#080808]'}`}>1-Year</span>
                              <span className="text-[9px] font-bold text-white bg-[#17DB4E] px-1.5 py-0.5 rounded-full">MOST POPULAR</span>
                            </div>
                            <p className="text-xs text-[#999] mt-0.5">12 months for the price of 10 · $9.95/mo per user</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-[#CCC] line-through">${(143.40 * getUserCount()).toFixed(2)}</p>
                            <span className={`text-base font-bold ${selectedPlan === 'annually' ? 'text-[#F53900]' : 'text-[#080808]'}`}>
                              ${(119.50 * getUserCount()).toFixed(2)}
                            </span>
                          </div>
                        </button>

                        {/* 3-Year */}
                        <button
                          type="button"
                          onClick={() => setSelectedPlan('3year')}
                          className={`w-full flex justify-between items-center px-4 py-3 rounded-xl border-2 transition-all ${
                            selectedPlan === '3year'
                              ? 'border-[#F53900] bg-[#FFF5F2]'
                              : 'border-[#E8E8E8] bg-white hover:border-[#F53900]'
                          }`}
                        >
                          <div className="text-left">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-semibold ${selectedPlan === '3year' ? 'text-[#F53900]' : 'text-[#080808]'}`}>3-Year</span>
                              <span className="text-[9px] font-bold text-white bg-[#7C5CF6] px-1.5 py-0.5 rounded-full">LOCK IN YOUR RATE</span>
                            </div>
                            <p className="text-xs text-[#999] mt-0.5">36 months for the price of 30 · $9.96/mo per user</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-[#CCC] line-through">${(430.20 * getUserCount()).toFixed(2)}</p>
                            <span className={`text-base font-bold ${selectedPlan === '3year' ? 'text-[#F53900]' : 'text-[#080808]'}`}>
                              ${(358.50 * getUserCount()).toFixed(2)}
                            </span>
                          </div>
                        </button>

                      </div>
                    </div>

                    {/* Internet Package Upsell - Only show if hasInternet === false */}
                    {hasInternet === false && (
                      <div className="border border-[#D9D9D9] rounded-lg p-4 md:p-6 space-y-4">
                        {/* Header */}
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#FFF0ED] flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-5 h-5 text-[#F53900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-[#080808]">Home Internet Service</p>
                            <p className="text-xs text-[#585858]">Reliable home internet to stay connected and have a backup. Easy plug and play setup with free shipping.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => { setAddInternetPackage(false); setHasInternet(true); }}
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-[#F0F0F0] hover:bg-[#E0E0E0] transition-colors flex-shrink-0"
                          >
                            <svg className="w-4 h-4 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        {/* Package selector - vertical plan-style cards */}
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-widest text-[#AAAAAA] mb-2">Select package</p>
                          <div className="space-y-2">
                            {[
                              { id: 'phone-only', label: 'Phone Only', sub: 'Basic connectivity for calls', price: '$16.95', per: '/mo' },
                              { id: 'unlimited-5g', label: 'Unlimited 5G', sub: 'Fast 5G data with no speed limits', price: '$84.95', per: '/mo' },
                            ].map(pkg => (
                              <button
                                key={pkg.id}
                                type="button"
                                onClick={() => setInternetPackage(pkg.id)}
                                className={`w-full flex justify-between items-center px-4 py-3 rounded-xl border-2 transition-all ${
                                  internetPackage === pkg.id
                                    ? 'border-[#F53900] bg-[#FFF5F2]'
                                    : 'border-[#E8E8E8] bg-white hover:border-[#F53900]'
                                }`}
                              >
                                <div className="text-left">
                                  <span className={`text-sm font-semibold ${internetPackage === pkg.id ? 'text-[#F53900]' : 'text-[#080808]'}`}>{pkg.label}</span>
                                  <p className="text-xs text-[#999] mt-0.5">{pkg.sub}</p>
                                </div>
                                <span className={`text-base font-bold ${internetPackage === pkg.id ? 'text-[#F53900]' : 'text-[#080808]'}`}>{pkg.price}<span className="text-xs font-normal text-[#999]">{pkg.per}</span></span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Device selector - vertical plan-style cards */}
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-widest text-[#AAAAAA] mb-2">Equipment options</p>
                          <div className="space-y-2">
                            <div>
                              <button
                                type="button"
                                onClick={() => setInternetDevice('rental')}
                                className={`w-full flex justify-between items-center px-4 py-3 rounded-xl border-2 transition-all ${
                                  internetDevice === 'rental'
                                    ? 'border-[#F53900] bg-[#FFF5F2]'
                                    : 'border-[#E8E8E8] bg-white hover:border-[#F53900]'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-semibold ${internetDevice === 'rental' ? 'text-[#F53900]' : 'text-[#080808]'}`}>Rental</span>
                                  <span className="text-[9px] font-bold text-white bg-[#17DB4E] px-1.5 py-0.5 rounded-full">MOST POPULAR</span>
                                </div>
                                <span className={`text-base font-bold ${internetDevice === 'rental' ? 'text-[#F53900]' : 'text-[#080808]'}`}>+$15<span className="text-xs font-normal text-[#999]">/mo</span></span>
                              </button>
                              
                            </div>
                            <div>
                              <button
                                type="button"
                                onClick={() => setInternetDevice('purchase')}
                                className={`w-full flex justify-between items-center px-4 py-3 rounded-xl border-2 transition-all ${
                                  internetDevice === 'purchase'
                                    ? 'border-[#F53900] bg-[#FFF5F2]'
                                    : 'border-[#E8E8E8] bg-white hover:border-[#F53900]'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-semibold ${internetDevice === 'purchase' ? 'text-[#F53900]' : 'text-[#080808]'}`}>Purchase</span>
                                  <span className="text-[9px] font-bold text-white bg-[#7C5CF6] px-1.5 py-0.5 rounded-full">LONG-TERM SAVINGS</span>
                                </div>
                                <span className={`text-base font-bold ${internetDevice === 'purchase' ? 'text-[#F53900]' : 'text-[#080808]'}`}>+$199</span>
                              </button>
                              
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Total */}
                    <div className="pt-4 border-t-2 border-[#333]">
                      <div className="flex justify-between items-center">
                        <p className="text-lg md:text-xl font-bold text-[#080808]">Total Due Today</p>
                        <p className="text-lg md:text-xl font-bold text-[#080808]">
                          ${(() => {
                            const planPrice = getPlanPrice();
                            const planPriceForTax = getPlanPriceForTax();
                            const devicePrice = getPhoneHardwarePrice();
                            const managedPhonePrice = getManagedDeskPhonePrice();
                            const protectionPrice = 0;
                            const shippingCost = getShippingCost();
                            
                            // Calculate internet package pricing (NOT taxed)
                            let internetPrice = 0;
                            if (hasInternet === false && addInternetPackage) {
                              const packagePrices: { [key: string]: number } = {
                                'phone-only': 16.95,
              'unlimited-5g': 84.95
                              };
                              const packagePrice = packagePrices[internetPackage] || 16.95;
                              const deviceCost = internetDevice === 'rental' ? 15 : 199;
                              internetPrice = packagePrice + deviceCost;
                            }
                            
                            // Use API-calculated tax when available, fallback to estimate
                            const managedDeskPhonePriceTax = getManagedDeskPhonePriceForTax();
                            const taxableSubtotal = planPriceForTax + devicePrice + managedDeskPhonePriceTax + protectionPrice + shippingCost;
                            const taxes = calculatedTaxAmount !== null ? calculatedTaxAmount : taxableSubtotal * 0.47;
                            const total = planPrice + devicePrice + managedPhonePrice + protectionPrice + shippingCost + taxes + internetPrice;
                            return total.toFixed(2);
                          })()}{country === 'CA' ? ' CAD' : ''}
                        </p>
                      </div>
                    </div>

                    <div className="text-center text-sm text-[#666]">
                      Our specialists are just a call away → <a href="tel:8444864759" className="text-[#F53900] font-semibold">(844) 486-4759</a>
                    </div>
                  </div>

                  {/* Online Fax */}
                  <div
                    className={`bg-white border rounded-lg p-4 md:p-6 cursor-pointer transition-all ${onlineFax ? 'border-[#F53900] bg-[#FFF5F2]' : 'border-[#D9D9D9] hover:border-[#F53900]/50'}`}
                    onClick={() => setOnlineFax(!onlineFax)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-9 h-9 rounded-full bg-[#FFF0ED] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-5 h-5 text-[#F53900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-[#080808]">Online Fax</p>
                            <span className="text-[9px] font-bold text-white bg-[#17DB4E] px-1.5 py-0.5 rounded-full">1ST MONTH FREE</span>
                          </div>
                          <p className="text-xs text-[#585858] mb-1">Send &amp; receive faxes from any device. Includes dedicated fax number.</p>
                          <p className="text-xs text-[#080808]">
                            Then <strong className="text-[#F53900]">${getOnlineFaxPrice().toFixed(2)}/mo{country === 'CA' ? ' CAD' : ''}</strong>
                            <span className="text-[#999] line-through ml-1">{country === 'CA' ? '$13.90' : '$9.99'}/mo</span>
                          </p>
                        </div>
                      </div>
                      {/* Toggle */}
                      <div className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 mt-1 ${onlineFax ? 'bg-[#F53900]' : 'bg-[#D9D9D9]'}`}>
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${onlineFax ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN - Billing & Payment */}
                <div className="space-y-6">
                  <div className="bg-white border border-[#D9D9D9] rounded-lg p-4 md:p-6 space-y-4 md:space-y-6">
                    <h2 className="text-base md:text-lg font-semibold text-[#080808]">BILLING / SHIPPING INFORMATION</h2>
                    <p className="text-sm text-[#666] -mt-4">* Required fields</p>
                    
                    {/* Customer Information */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                      <input
                        ref={firstNameRef}
                        type="text"
                        value={firstName}
                        onChange={(e) => { setFirstName(e.target.value); setStep5Errors(prev => ({ ...prev, firstName: undefined })); }}
                        placeholder="First Name *"
                        required
                        className={`w-full h-12 px-3 bg-white border rounded text-base text-[#080808] placeholder-[#A5A5A5] focus:outline-none focus:border-[#F53900] focus:ring-0 ${step5Errors.firstName ? 'border-[#F53900]' : 'border-[#D9D9D9]'}`}
                      />
                      {step5Errors.firstName && (
                        <p className="mt-1 text-sm text-[#F53900] flex items-center gap-1">
                          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                          {step5Errors.firstName}
                        </p>
                      )}
                      </div>
                      <div className="space-y-1">
                      <input
                        ref={lastNameRef}
                        type="text"
                        value={lastName}
                        onChange={(e) => { setLastName(e.target.value); setStep5Errors(prev => ({ ...prev, lastName: undefined })); }}
                        placeholder="Last Name *"
                        required
                        className={`w-full h-12 px-3 bg-white border rounded text-base text-[#080808] placeholder-[#A5A5A5] focus:outline-none focus:border-[#F53900] focus:ring-0 ${step5Errors.lastName ? 'border-[#F53900]' : 'border-[#D9D9D9]'}`}
                      />
                      {step5Errors.lastName && (
                        <p className="mt-1 text-sm text-[#F53900] flex items-center gap-1">
                          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                          {step5Errors.lastName}
                        </p>
                      )}
                      </div>
                    </div>

                    <div className="space-y-1">
                    <input
                      ref={emailRef}
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setStep5Errors(prev => ({ ...prev, email: undefined }));
                        // Fire begin_checkout GTM event once when email is verified
                        // (also fires at blur if not yet fired and emailValidated becomes true)
                        

                      }}
                      placeholder="Enter your email *"
                      required
                      onBlur={async (e) => {
                        const val = e.target.value.trim();
                        if (!val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return;
                        setEmailValidating(true);
                        try {
                          const res = await fetch(`${basePath}/api/validate-email`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: val }),
                          });
                          const data = await res.json();
                          setEmailValidated(data.valid);
                          if (!data.valid) {
                            setStep5Errors(prev => ({ ...prev, email: 'We could not verify this email address. Please check for typos and try again.' }));
                          } else {
                            setStep5Errors(prev => ({ ...prev, email: undefined }));
                            // Fire GTM begin_checkout once email is verified
                            if (!beginCheckoutFired) {
                              sendGTMEvent('begin_checkout');
                              setBeginCheckoutFired(true);
                            }
                            // Fire HubSpot res_lead once email is verified
                            if (!hubspotLeadFired) {
                              const _hsq = (window as any)._hsq = (window as any)._hsq || [];
                              _hsq.push(['trackCustomBehavioralEvent', {
                                name: 'pe45056553_res_lead',
                                properties: {
                                  email: val,
                                  first_name: firstName,
                                  last_name: lastName,
                                  address_line_1: address,
                                  address_line_2: address2,
                                  city_address: addressComponents.city,
                                  state_address: addressComponents.state,
                                  zip_code: addressComponents.zipCode,
                                  country_address: country,
                                  mobile_number: mobileNumber.replace(/\D/g, ''),
                                  home_phone_number: hasPhone ? phoneNumber.replace(/\D/g, '') : '',
                                  selected_plan: selectedPlan,
                                  selected_bundle: ownDevice ? 'own_device' : JSON.stringify(selectedPhones),
                                  has_internet: String(hasInternet),
                                  phone_type: hasPhone ? 'existing_number' : 'new_number'
                                }
                              }]);
                              setHubspotLeadFired(true);
                              // Also identify in LogRocket
                              LogRocket.identify(sessionId, { name: `${firstName} ${lastName}`.trim(), email: val });
                            }
                          }
                        } catch {
                          setEmailValidated(true); // fail open
                        } finally {
                          setEmailValidating(false);
                        }
                      }}
                      className={`w-full h-12 px-3 bg-white border rounded text-base text-[#080808] placeholder-[#A5A5A5] focus:outline-none focus:border-[#F53900] focus:ring-0 ${step5Errors.email ? 'border-[#F53900]' : 'border-[#D9D9D9]'}`}
                    />
                    {emailValidating && (
                      <p className="mt-1 text-xs text-[#999] flex items-center gap-1">
                        <span className="inline-block w-3 h-3 border-2 border-[#F53900] border-t-transparent rounded-full animate-spin"></span>
                        Verifying email...
                      </p>
                    )}

                    {step5Errors.email && (
                      <p className="mt-1 text-sm text-[#F53900] flex items-center gap-1">
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                        {step5Errors.email}
                      </p>
                    )}
                    </div>

                    <div className="space-y-1">
                    <input
                      ref={mobileNumberRef}
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => { handleMobileChange(e); setStep5Errors(prev => ({ ...prev, mobileNumber: undefined })); }}
                      placeholder="Enter your mobile number *"
                      required
                      onBlur={async (e) => {
                        const digits = e.target.value.replace(/\D/g, '');
                        if (digits.length !== 10) return;
                        setMobileValidating(true);
                        try {
                          const res = await fetch(`${basePath}/api/validate-phone`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ phone: digits }),
                          });
                          const data = await res.json();
                          setMobileValidated(data.valid);
                          if (!data.valid) {
                            setStep5Errors(prev => ({ ...prev, mobileNumber: 'We could not verify this phone number. Please make sure you entered all 10 digits correctly.' }));
                          } else {
                            setStep5Errors(prev => ({ ...prev, mobileNumber: undefined }));
                          }
                        } catch {
                          setMobileValidated(true); // fail open
                        } finally {
                          setMobileValidating(false);
                        }
                      }}
                      className={`w-full h-12 px-3 bg-white border rounded text-base text-[#080808] placeholder-[#A5A5A5] focus:outline-none focus:border-[#F53900] focus:ring-0 ${step5Errors.mobileNumber ? 'border-[#F53900]' : 'border-[#D9D9D9]'}`}
                    />
                    {mobileValidating && (
                      <p className="mt-1 text-xs text-[#999] flex items-center gap-1">
                        <span className="inline-block w-3 h-3 border-2 border-[#F53900] border-t-transparent rounded-full animate-spin"></span>
                        Verifying phone number...
                      </p>
                    )}

                    {step5Errors.mobileNumber && (
                      <p className="mt-1 text-sm text-[#F53900] flex items-center gap-1">
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                        {step5Errors.mobileNumber}
                      </p>
                    )}
                    </div>

                    {/* Shipping Address Display with Edit */}
                    <div className="bg-[#F9F9F9] p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                          </svg>
                          <h3 className="text-sm font-semibold text-green-700">Shipping Address</h3>
                        </div>
                        <button
                          type="button"
                          onClick={handleEditShipping}
                          className="text-[#F53900] text-sm font-medium hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                      {!editingShipping ? (
                        <div className="text-sm text-[#585858] space-y-1">
                          <div>{addressComponents.street}</div>
                          {address2 && <div>{address2}</div>}
                          <div>{addressComponents.city}, {addressComponents.state} {addressComponents.zipCode}</div>
                          <div>{country === 'CA' ? 'Canada' : 'United States'}</div>
                        </div>
                      ) : (
                        <div className="space-y-3 mt-3">
                          <select
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full h-12 px-3 bg-white border border-[#D9D9D9] rounded text-base text-[#080808] focus:outline-none focus:border-[#F53900] focus:ring-0"
                          >
                            <option value="US">United States</option>
                            <option value="CA">Canada</option>
                          </select>
                          <div className="relative">
                            <input
                              type="text"
                              value={tempAddress}
                              onChange={handleTempAddressChange}
                              placeholder="Street Address"
                              className="w-full h-12 px-3 bg-white border border-[#D9D9D9] rounded text-base text-[#080808] placeholder-[#A5A5A5] focus:outline-none focus:border-[#F53900] focus:ring-0"
                            />
                            {showTempSuggestions && tempSuggestions.length > 0 && (
                              <div className="absolute z-50 w-full mt-1 bg-white border border-[#D9D9D9] rounded shadow-lg max-h-60 overflow-y-auto">
                                {tempSuggestions.map((suggestion, idx) => (
                                  <div
                                    key={idx}
                                    onClick={() => selectTempSuggestion(suggestion)}
                                    className="px-3 py-2 hover:bg-[#FEEBE6] cursor-pointer text-sm"
                                  >
                                    <div className="font-medium">{suggestion.street_line}</div>
                                    <div className="text-xs text-[#585858]">{suggestion.city}, {suggestion.state} {suggestion.zipcode}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <input
                            type="text"
                            value={tempAddress2}
                            onChange={(e) => setTempAddress2(e.target.value)}
                            placeholder="Apt, suite, unit, building, floor, etc."
                            className="w-full h-12 px-3 bg-white border border-[#D9D9D9] rounded text-base text-[#080808] placeholder-[#A5A5A5] focus:outline-none focus:border-[#F53900] focus:ring-0"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={handleSaveShipping}
                              className="flex-1 h-10 bg-[#F53900] text-white rounded font-medium hover:bg-[#d63300]"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEditShipping}
                              className="flex-1 h-10 border border-[#D9D9D9] text-[#080808] rounded font-medium hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Billing Address Checkbox */}
                    <div className="space-y-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={billingSameAsShipping}
                          onChange={(e) => {
                            setBillingSameAsShipping(e.target.checked);
                            // When unchecking, set billing country to match shipping country
                            if (!e.target.checked) {
                              setBillingCountry(country);
                            }
                          }}
                          className="w-5 h-5 mt-0.5 accent-[#F53900] cursor-pointer"
                        />
                        <span className="text-sm text-[#080808]">
                          Billing address is the same as the shipping address
                        </span>
                      </label>

                      {/* Show billing address form if not same as shipping */}
                      {!billingSameAsShipping && (
                        <div className="space-y-3 pl-8">
                          <select
                            value={billingCountry}
                            onChange={(e) => setBillingCountry(e.target.value)}
                            className="w-full h-12 px-3 bg-white border border-[#D9D9D9] rounded text-base text-[#080808] focus:outline-none focus:border-[#F53900] focus:ring-0"
                          >
                            <option value="US">United States</option>
                            <option value="CA">Canada</option>
                          </select>
                          <div className="relative">
                            <input
                              type="text"
                              value={billingAddress}
                              onChange={handleBillingAddressChange}
                              placeholder="Billing Street Address"
                              className="w-full h-12 px-3 bg-white border border-[#D9D9D9] rounded text-base text-[#080808] placeholder-[#A5A5A5] focus:outline-none focus:border-[#F53900] focus:ring-0"
                            />
                            {showBillingSuggestions && billingSuggestions.length > 0 && (
                              <div className="absolute z-50 w-full mt-1 bg-white border border-[#D9D9D9] rounded shadow-lg max-h-60 overflow-y-auto">
                                {billingSuggestions.map((suggestion, idx) => (
                                  <div
                                    key={idx}
                                    onClick={() => selectBillingSuggestion(suggestion)}
                                    className="px-3 py-2 hover:bg-[#FEEBE6] cursor-pointer text-sm"
                                  >
                                    <div className="font-medium">{suggestion.street_line}</div>
                                    <div className="text-xs text-[#585858]">{suggestion.city}, {suggestion.state} {suggestion.zipcode}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <input
                            type="text"
                            value={billingAddress2}
                            onChange={(e) => setBillingAddress2(e.target.value)}
                            placeholder="Apt, suite, unit, building, floor, etc."
                            className="w-full h-12 px-3 bg-white border border-[#D9D9D9] rounded text-base text-[#080808] placeholder-[#A5A5A5] focus:outline-none focus:border-[#F53900] focus:ring-0"
                          />
                        </div>
                      )}
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-4">
                      <h2 className="text-base md:text-lg font-semibold text-[#080808]">PAYMENT METHOD</h2>
                      
                      {loadingPaymentIntent && !clientSecret ? (
                        <div className="w-full h-40 flex items-center justify-center bg-[#F9F9F9] rounded-lg">
                          <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#F53900]"></div>
                            <p className="text-sm text-[#585858] mt-2">Loading secure payment form...</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div 
                            ref={paymentElementRef}
                            id="payment-element"
                            className="w-full"
                          ></div>
                          {step5Errors.card && (
                            <p className="mt-1 text-sm text-[#F53900] flex items-center gap-1">
                              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                              {step5Errors.card}
                            </p>
                          )}
                          
                          {/* Refresh button for payment element errors */}
                          {paymentElementError && !paymentElementReady && (
                            <div className="mt-4 p-4 bg-[#FFF5F3] border border-[#F53900] rounded-lg">
                              <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-[#F53900] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-[#F53900] mb-2">
                                    Payment form didn't load properly
                                  </p>
                                  <p className="text-xs text-[#585858] mb-3">
                                    This can happen due to network issues or browser extensions. Click below to try reloading the payment form.
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      // Reset states and force remount
                                      setPaymentElementError(false);
                                      setPaymentElementReady(false);
                                      setLoadingPaymentIntent(true);
                                      if (paymentElement) {
                                        paymentElement.unmount();
                                      }
                                      setPaymentElement(null);
                                      setStripe(null);
                                      setElements(null);
                                      // The useEffect will reinitialize everything
                                    }}
                                    className="px-4 py-2 bg-[#F53900] text-white rounded-lg text-sm font-medium hover:bg-[#d63300] transition-colors flex items-center gap-2"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Reload Payment Form
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      localStorage.removeItem('voiply_session_id');
                                      // Strip session (and any other params) from URL so the page loads truly fresh
                                      window.location.href = window.location.pathname;
                                    }}
                                    className="px-4 py-2 bg-white border border-[#D9D9D9] text-[#585858] rounded-lg text-sm font-medium hover:bg-[#F9F9F9] transition-colors flex items-center gap-2"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    Start Over
                                  </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Payment Error Banner */}
                    {paymentError && (
                      <div className={`rounded-xl border p-4 flex gap-3 items-start ${
                        paymentError.type === 'auth'
                          ? 'bg-[#FFFBF0] border-[#FFE8A3]'
                          : 'bg-[#FFF5F2] border-[#FFD8CC]'
                      }`}>
                        <div className="flex-shrink-0 mt-0.5">
                          {paymentError.type === 'auth' ? (
                            <svg className="w-5 h-5 text-[#B8860B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-6V7m-7 10a9 9 0 1118 0H5z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-[#F53900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold mb-0.5 ${paymentError.type === 'auth' ? 'text-[#7A5800]' : 'text-[#C0392B]'}`}>
                            {paymentError.type === 'card' ? 'Payment Declined' : paymentError.type === 'auth' ? 'Verification Required' : 'Payment Failed'}
                          </p>
                          <p className={`text-sm ${paymentError.type === 'auth' ? 'text-[#7A5800]' : 'text-[#666]'}`}>
                            {paymentError.message}
                          </p>
                          <p className="text-xs text-[#999] mt-2">
                            Need help? Call us at <a href="tel:8444864759" className="text-[#F53900] font-semibold">(844) 486-4759</a>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPaymentError(null)}
                          className="flex-shrink-0 text-[#CCC] hover:text-[#999] transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleSubmitOrder}
                      className="w-full h-12 rounded-[5px] text-sm md:text-base transition-colors bg-[#F53900] text-white hover:bg-[#d63300] cursor-pointer"
                    >
                      {loadingPaymentIntent ? 'Processing...' : 'Place Your Order'}
                    </button>

                    <div className="text-xs text-center text-[#666] space-y-2">
                      <div>
                        By placing your order, you agree to <a href="https://www.voiply.com/terms" target="_blank" rel="noopener noreferrer" className="text-[#F53900] hover:underline">Terms of Service</a>
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <svg className="w-4 h-4 inline-block text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        <span>30-Day Money Back Guarantee</span>
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <svg className="w-4 h-4 inline-block text-[#666]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                        </svg>
                        <span>Secured by Stripe</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Back Button - Centered */}
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={handleBack}
                  className="min-w-[150px] h-12 rounded-[5px] text-base border border-[#D9D9D9] text-[#080808] hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
              </div>
            </>
          )}
        </main>
      </div>
      
      {/* Managed Desk Phone Info Modal */}
      {showManagedPhoneModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowManagedPhoneModal(false)}>
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-[#D9D9D9] p-4 md:p-6 flex justify-between items-center">
              <h2 className="text-xl md:text-2xl font-bold text-[#080808]">Managed Desk Phone Support</h2>
              <button
                onClick={() => setShowManagedPhoneModal(false)}
                className="text-[#585858] hover:text-[#080808] transition-colors w-10 h-10 flex items-center justify-center rounded-full bg-[#F53900] hover:bg-[#d93100]"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 md:p-6 space-y-4">
              <p className="text-sm text-[#585858]">
                For $5/mo per phone, we handle the setup and ongoing management so your team can focus on business.
              </p>
              
              <div className="space-y-2.5">
                {[
                  'Phone provisioning & remote setup',
                  'Firmware & security updates',
                  'Feature configuration (BLF keys, speed dials, call parking)',
                  'Ongoing troubleshooting & technical support',
                  'Cloud-managed for quick remote changes',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-[#17DB4E] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-sm text-[#080808]">{item}</span>
                  </div>
                ))}
              </div>
              
              <p className="text-xs text-[#999] pt-1">
                Applies to all phones, whether purchased from us or bring your own.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tax Breakdown Modal */}
      {showTaxModal && taxBreakdown && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowTaxModal(false)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-[#D9D9D9] p-4 md:p-6 flex justify-between items-center">
              <h2 className="text-xl md:text-2xl font-bold text-[#080808]">Taxes and Fees</h2>
              <button
                onClick={() => setShowTaxModal(false)}
                className="text-[#585858] hover:text-[#080808] transition-colors w-10 h-10 flex items-center justify-center rounded-full bg-[#F53900] hover:bg-[#d93100]"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              {/* Total Taxes */}
              <div className="flex justify-between items-center pb-4 border-b-2 border-[#080808]">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg md:text-xl font-bold text-[#080808]">Total Taxes</h3>
                  {taxBreakdown.submission_id && (
                    <div className="relative group">
                      <svg 
                        className="w-5 h-5 text-[#585858] cursor-help" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-[#080808] text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                        <div className="font-semibold mb-1">CSI Tax ID</div>
                        <div className="font-mono break-all">{taxBreakdown.submission_id}</div>
                        <div className="absolute -top-1 left-4 w-2 h-2 bg-[#080808] transform rotate-45"></div>
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-xl md:text-2xl font-bold text-[#F53900]">
                  ${(taxBreakdown.estimatedTotalTax || 0).toFixed(2)}
                </span>
              </div>

              {/* Plan Type Taxes */}
              <div>
                <h4 className="text-base md:text-lg font-semibold text-[#080808] mb-3">
                  {taxBreakdown.duration === 'quarter' ? '3 Month' : taxBreakdown.duration === 'year' ? 'Annual' : '3 Year'} Taxes
                </h4>
                
                <div className="space-y-3">
                  {/* Service Tax Breakdown (recurring) */}
                  {taxBreakdown.tax_data && taxBreakdown.tax_data.length > 0 ? (
                    <>
                      {taxBreakdown.tax_data
                        .filter((item: any) => !item.hardwareTax)
                        .map((item: any, index: number) => (
                          <div key={index} className="flex justify-between text-base">
                            <span className="text-[#585858]">{item.description}</span>
                            <span className="font-medium text-[#080808]">
                              ${(item.tax_amount || 0).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      
                      {/* Hardware Taxes Section (one-time) */}
                      {taxBreakdown.tax_data.some((item: any) => item.hardwareTax) && (
                        <div className="mt-6 pt-4 border-t border-[#D9D9D9]">
                          <h5 className="text-sm font-semibold text-[#080808] mb-3">
                            Hardware Taxes (one time)
                          </h5>
                          <div className="space-y-3">
                            {taxBreakdown.tax_data
                              .filter((item: any) => item.hardwareTax)
                              .map((item: any, index: number) => (
                                <div key={`hw-${index}`} className="flex justify-between text-base">
                                  <span className="text-[#585858]">{item.description}</span>
                                  <span className="font-medium text-[#080808]">
                                    ${(item.tax_amount || 0).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-[#585858]">No tax breakdown available</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exit Intent Popup - 1 Month Free Offer */}
      {showExitPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowExitPopup(false)}>
          <div className="bg-white rounded-lg max-w-lg w-full p-8" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowExitPopup(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F53900] hover:bg-[#d93100] transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Heading */}
            <h2 className="text-4xl font-bold text-[#080808] mb-2">
              Enter your email and
            </h2>
            <h2 className="text-4xl font-bold mb-6">
              get <span className="text-[#F53900]">1 MONTH FREE</span>
            </h2>

            {/* Email Input and Button */}
            <div className="mb-4">
              <input
                type="email"
                value={couponEmail}
                onChange={(e) => { setCouponEmail(e.target.value); setCouponEmailError(''); }}
                placeholder="Enter your email"
                className="w-full h-14 px-4 mb-4 bg-white border border-[#D9D9D9] rounded text-base text-[#080808] placeholder-[#A5A5A5] focus:outline-none focus:ring-2 focus:ring-[#F53900] focus:border-[#F53900]"
              />
              {couponEmailError && (
                <p className="mb-3 text-sm text-[#F53900] flex items-center gap-1">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                  {couponEmailError}
                </p>
              )}
              <button
                onClick={handleActivateCoupon}
                disabled={couponEmailValidating}
                className="w-full h-12 md:h-14 bg-[#F53900] hover:bg-[#d93100] disabled:opacity-60 text-white text-base md:text-lg font-bold rounded transition-colors flex items-center justify-center gap-2"
              >
                {couponEmailValidating ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Verifying...
                  </>
                ) : 'Activate Coupon'}
              </button>
            </div>

            {/* Privacy Policy */}
            <p className="text-sm text-[#585858] text-center">
              To see how we may use your information, take a look at our{' '}
              <a href="https://www.voiply.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#4169E1] hover:underline">
                Privacy Policy
              </a>.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
