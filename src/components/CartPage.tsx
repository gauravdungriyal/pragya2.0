import React, { useState } from 'react';
import {
  ShoppingBag, Trash2, Plus, Minus, Check, ArrowRight,
  Loader, Sparkles, ChevronDown, ChevronUp, CheckCircle2, Tag, User
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/apiConfig';

interface CartPageProps {
  onViewChange?: (view: string) => void;
  onOpenBooking?: (type?: string, title?: string, details?: any) => void;
}

type Step = 'cart' | 'checkout' | 'order';
type PaymentMethod = 'gateway' | 'bank' | 'reserve_desk';

export const CartPage: React.FC<CartPageProps> = ({ onViewChange }) => {
  const { items, cartCount, subtotal, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user, authFetch, setSessionTokens } = useAuth();

  const [step, setStep] = useState<Step>('cart');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [showCouponAccordion, setShowCouponAccordion] = useState(false);
  const [showTopCouponAccordion, setShowTopCouponAccordion] = useState(false);
  const [showLoginAccordion, setShowLoginAccordion] = useState(false);

  const [firstName, setFirstName] = useState(user?.name ? user.name.split(' ')[0] : '');
  const [lastName, setLastName] = useState(user?.name ? user.name.split(' ').slice(1).join(' ') : '');
  const [street1, setStreet1] = useState('');
  const [street2, setStreet2] = useState('');
  const [city, setCity] = useState('');
  const [stateRegion, setStateRegion] = useState('Hong Kong Island');
  const [postcode, setPostcode] = useState('');
  const [countryCode, setCountryCode] = useState('852');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [hkId, setHkId] = useState('');
  const [shipDifferent, setShipDifferent] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('gateway');
  const [termsAgreed, setTermsAgreed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderResult, setOrderResult] = useState<any>(null);

  const discountAmount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const grandTotal = Math.max(0, subtotal - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponCode.trim()) { setCouponError('Please enter a coupon code.'); return; }
    if (['pys10', 'pragya10'].includes(couponCode.toLowerCase().trim())) {
      setCouponApplied(true);
    } else {
      setCouponError('Invalid coupon code. Try PYS10 for 10% off.');
    }
  };

  const resolveNumericId = (id: number | string): number => {
    const n = Number(id);
    return (!isNaN(n) && n > 0) ? n : 12795;
  };

  const packageIds = items.map((i) => resolveNumericId(i.id));

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!termsAgreed) { setError('Please accept the terms & conditions to proceed.'); return; }
    if (!email) { setError('Please enter a valid email address.'); return; }
    if (!firstName || !lastName) { setError('Please fill in your full name.'); return; }
    setLoading(true);

    try {
      // Branch 1: Online Payment Asia Gateway
      if (paymentMethod === 'gateway') {
        let payRes: any;
        if (user) {
          if (packageIds.length === 1) {
            payRes = await authFetch('create_payment', { package_id: packageIds[0] });
          } else {
            payRes = await authFetch('create_payment', { bundle_id: 1, package_ids: packageIds });
          }
        } else {
          payRes = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'create_payment',
              email,
              name: `${firstName} ${lastName}`.trim(),
              phone,
              country_code: countryCode,
              package_id: packageIds[0],
              package_ids: packageIds,
            }),
          }).then((r) => r.json());
        }

        if (payRes?.payment_url) {
          clearCart();
          window.location.href = payRes.payment_url;
          return;
        }

        // If create_payment returned an explicit error without payment_url
        if (payRes && payRes.success === "false" && payRes.message) {
          setError(payRes.message);
          setLoading(false);
          return;
        }
      }

      // Branch 2: Reservation request (or fallback)
      let res: any;
      if (user) {
        res = await authFetch('reserve_bundle', {
          package_ids: packageIds, total_amount: grandTotal, payment_method: paymentMethod,
          billing_details: { first_name: firstName, last_name: lastName, country: 'Hong Kong',
            address: `${street1} ${street2}`.trim(), city, state: stateRegion,
            postcode, phone: `${countryCode}-${phone}`, hk_id: hkId, order_notes: orderNotes },
        });
      } else {
        res = await fetch(API_BASE_URL, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'guest_reserve_bundle', email,
            name: `${firstName} ${lastName}`.trim(), phone, country_code: countryCode,
            package_ids: packageIds, total_amount: grandTotal, payment_method: paymentMethod, order_notes: orderNotes }),
        }).then((r) => r.json());
      }

      if (res?.success === true || res?.status === true) {
        if (!user && res.access_token) {
          setSessionTokens({ uid: String(res.uid || ''), name: `${firstName} ${lastName}`.trim() || email.split('@')[0],
            email, access_token: res.access_token, refresh_token: res.refresh_token || '' });
        }
        setOrderResult({
          orderId: res.order_id || res.id || `PYS-${Math.floor(100000 + Math.random() * 900000)}`,
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          items: [...items], total: grandTotal, paymentMethod,
          message: res.message || 'Your order has been placed. Our team will be in touch shortly.',
        });
        clearCart(); setStep('order');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        let msg = res?.errors?.isEmpty || res?.message || 'Order placement failed. Please try again.';
        if (msg === 'Please Try Again') msg = 'One of the items in your cart is currently unavailable.';
        setError(msg);
      }
    } catch { setError('Network error. Please try again.'); }
    setLoading(false);
  };

  const inputCls = [
    'block w-full text-sm text-[#333] bg-white',
    'border border-[#d0cac4] rounded-sm',
    'outline-none focus:outline-none focus:border-[#944426]',
    'transition-colors placeholder-[#aaa]'
  ].join(' ');

  const labelCls = 'block text-xs font-semibold text-[#444] mb-1.5';

  return (
    /* Root: bg + top padding equal to header height (100px) + extra breathing room */
    <div style={{ minHeight: '100vh', backgroundColor: '#f9f6f1', paddingTop: 100 }}>

      {/* ── STEP INDICATOR ────────────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid #e2dbd3', backgroundColor: '#fff' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '12px 24px', display: 'flex', justifyContent: 'center' }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: '#888', fontWeight: 500 }}>

            {/* Step 1 */}
            <button
              type="button"
              onClick={() => items.length > 0 && setStep('cart')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                color: step === 'cart' ? '#1a1a1a' : '#888', background: 'none', border: 'none', padding: 0, fontWeight: step === 'cart' ? 600 : 400 }}
            >
              <span style={{
                width: 28, height: 28, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, flexShrink: 0,
                backgroundColor: (step === 'checkout' || step === 'order' || step === 'cart') ? '#1a1a1a' : 'transparent',
                color: (step === 'checkout' || step === 'order' || step === 'cart') ? '#fff' : '#888',
                border: (step === 'checkout' || step === 'order' || step === 'cart') ? 'none' : '2px solid #ccc',
              }}>
                {(step === 'checkout' || step === 'order') ? <Check style={{ width: 13, height: 13 }} /> : '1'}
              </span>
              Cart
            </button>

            <span style={{ color: '#ccc', fontSize: 16 }}>›</span>

            {/* Step 2 */}
            <button
              type="button"
              onClick={() => items.length > 0 && setStep('checkout')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                color: step === 'checkout' ? '#1a1a1a' : '#aaa', background: 'none', border: 'none', padding: 0, fontWeight: step === 'checkout' ? 600 : 400 }}
            >
              <span style={{
                width: 28, height: 28, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, flexShrink: 0,
                backgroundColor: (step === 'checkout' || step === 'order') ? '#1a1a1a' : 'transparent',
                color: (step === 'checkout' || step === 'order') ? '#fff' : '#aaa',
                border: (step === 'checkout' || step === 'order') ? 'none' : '2px solid #ccc',
              }}>
                {step === 'order' ? <Check style={{ width: 13, height: 13 }} /> : '2'}
              </span>
              Checkout
            </button>

            <span style={{ color: '#ccc', fontSize: 16 }}>›</span>

            {/* Step 3 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: step === 'order' ? '#1a1a1a' : '#aaa', fontWeight: step === 'order' ? 600 : 400 }}>
              <span style={{
                width: 28, height: 28, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, flexShrink: 0,
                backgroundColor: step === 'order' ? '#1a1a1a' : 'transparent',
                color: step === 'order' ? '#fff' : '#aaa',
                border: step === 'order' ? 'none' : '2px solid #ccc',
              }}>
                3
              </span>
              Order
            </div>

          </nav>
        </div>
      </div>

      {/* ── STEP 1: CART ──────────────────────────────────────────── */}
      {step === 'cart' && (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>

          {/* Member Note */}
          <p style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#944426', marginBottom: 24 }}>
            Note : Joining fees will be waived to existing PYS members
          </p>

          {items.length === 0 ? (
            <div style={{ background: '#fff', border: '1px solid #e2dbd3', borderRadius: 4, padding: '64px 32px', textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
              <ShoppingBag style={{ width: 48, height: 48, color: '#944426', opacity: 0.5, margin: '0 auto 16px' }} />
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 24, color: '#272727', margin: '0 0 8px' }}>Your Cart is Empty</h2>
              <p style={{ fontSize: 14, color: '#888', margin: '0 0 24px' }}>Explore our memberships, sessions, and workshops.</p>
              <button
                type="button"
                onClick={() => onViewChange && onViewChange('classes')}
                style={{ padding: '12px 28px', borderRadius: 100, background: '#272727', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}
              >
                Browse Offerings
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }}>

              {/* Left: Product Table */}
              <div>
                {/* Table heading row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', borderBottom: '2px solid #e2dbd3', paddingBottom: 10, marginBottom: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#888' }}>Product</span>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#888', textAlign: 'right' }}>Total</span>
                </div>

                {items.map((item) => (
                  <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 120px', alignItems: 'center', borderBottom: '1px solid #ede8e1', padding: '20px 0', gap: 16 }}>
                    {/* Product info */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                      {item.coverImage ? (
                        <img src={item.coverImage} alt={item.title}
                          style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 4, border: '1px solid #e2dbd3', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 64, height: 64, borderRadius: 4, background: '#f0e8dd', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Sparkles style={{ width: 24, height: 24, color: '#944426' }} />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.4, marginBottom: 4 }}>{item.title}</div>
                        <div style={{ fontSize: 13, color: '#944426', fontWeight: 600, marginBottom: 8 }}>HK${item.price.toLocaleString()}</div>
                        {item.category && (
                          <div style={{ fontSize: 11, color: '#888', marginBottom: 10 }}>{item.category}</div>
                        )}
                        {/* Quantity + Remove */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            style={{ width: 24, height: 24, border: '1px solid #ccc', borderRadius: 2, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                          >
                            <Minus style={{ width: 11, height: 11 }} />
                          </button>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#333', minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            style={{ width: 24, height: 24, border: '1px solid #ccc', borderRadius: 2, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                          >
                            <Plus style={{ width: 11, height: 11 }} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            title="Remove"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', padding: '2px 4px', marginLeft: 4, display: 'flex', alignItems: 'center' }}
                          >
                            <Trash2 style={{ width: 14, height: 14 }} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Line total */}
                    <div style={{ textAlign: 'right', fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>
                      HK${(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Right: Basket Totals */}
              <div style={{ background: '#fff', border: '1px solid #e2dbd3', padding: '20px 20px 24px' }}>
                <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#888', borderBottom: '1px solid #e2dbd3', paddingBottom: 12, marginBottom: 16, margin: '0 0 16px' }}>
                  Basket Totals
                </h3>

                {/* Coupon accordion */}
                <div style={{ borderBottom: '1px solid #e8e2db', paddingBottom: 14, marginBottom: 14 }}>
                  <button
                    type="button"
                    onClick={() => setShowCouponAccordion(!showCouponAccordion)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 13, color: '#444' }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Tag style={{ width: 13, height: 13, color: '#944426' }} />
                      Add coupons
                    </span>
                    {showCouponAccordion
                      ? <ChevronUp style={{ width: 15, height: 15, color: '#999' }} />
                      : <ChevronDown style={{ width: 15, height: 15, color: '#999' }} />}
                  </button>
                  {showCouponAccordion && (
                    <form onSubmit={handleApplyCoupon} style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Coupon code"
                        style={{ flex: 1, padding: '7px 10px', fontSize: 12, border: '1px solid #ccc', borderRadius: 2, outline: 'none' }}
                      />
                      <button type="submit"
                        style={{ padding: '7px 12px', background: '#272727', color: '#fff', fontSize: 12, fontWeight: 600, border: 'none', borderRadius: 2, cursor: 'pointer' }}>
                        Apply
                      </button>
                    </form>
                  )}
                  {couponApplied && <p style={{ marginTop: 6, fontSize: 12, color: '#16a34a', fontWeight: 600 }}>10% discount applied!</p>}
                  {couponError && <p style={{ marginTop: 6, fontSize: 12, color: '#dc2626' }}>{couponError}</p>}
                </div>

                {/* Free shipping */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, borderBottom: '1px solid #e8e2db', paddingBottom: 14, marginBottom: 14, color: '#555' }}>
                  <span>Free shipping</span>
                  <span style={{ fontWeight: 700, letterSpacing: '0.08em', fontSize: 11, textTransform: 'uppercase' }}>FREE</span>
                </div>

                {couponApplied && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, borderBottom: '1px solid #e8e2db', paddingBottom: 14, marginBottom: 14, color: '#16a34a', fontWeight: 600 }}>
                    <span>Discount (10%)</span>
                    <span>−HK${discountAmount.toLocaleString()}</span>
                  </div>
                )}

                {/* Estimated total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>Estimated total</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>HK${grandTotal.toLocaleString()}</span>
                </div>

                {/* Proceed CTA */}
                <button
                  type="button"
                  onClick={() => setStep('checkout')}
                  style={{ width: '100%', padding: '13px 0', borderRadius: 100, background: '#1a1a1a', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  Proceed to Checkout
                  <ArrowRight style={{ width: 14, height: 14 }} />
                </button>
              </div>

            </div>
          )}
        </div>
      )}

      {/* ── STEP 2: CHECKOUT ──────────────────────────────────────── */}
      {step === 'checkout' && (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>

          {/* Top banners */}
          <div style={{ marginBottom: 28 }}>
            {/* Returning customer */}
            <div style={{ border: '1px solid #e2dbd3', borderRadius: 2, padding: '12px 18px', marginBottom: 8, background: '#fff', fontSize: 13, color: '#555' }}>
              <button
                type="button"
                onClick={() => setShowLoginAccordion(!showLoginAccordion)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 13, color: '#555' }}
              >
                <span>
                  Returning customer?{' '}
                  <span style={{ color: '#944426', fontWeight: 600 }}>Click here to login</span>
                </span>
                {showLoginAccordion ? <ChevronUp style={{ width: 14, height: 14, color: '#999' }} /> : <ChevronDown style={{ width: 14, height: 14, color: '#999' }} />}
              </button>
              {showLoginAccordion && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e8e2db' }}>
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('pragya-open-auth'))}
                    style={{ padding: '8px 18px', background: '#272727', color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', borderRadius: 2, cursor: 'pointer' }}
                  >
                    Open Login
                  </button>
                </div>
              )}
            </div>

            {/* Coupon */}
            <div style={{ border: '1px solid #e2dbd3', borderRadius: 2, padding: '12px 18px', background: '#fff', fontSize: 13, color: '#555' }}>
              <button
                type="button"
                onClick={() => setShowTopCouponAccordion(!showTopCouponAccordion)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 13, color: '#555' }}
              >
                <span>
                  Have a coupon?{' '}
                  <span style={{ color: '#944426', fontWeight: 600 }}>Click here to enter your code</span>
                </span>
                {showTopCouponAccordion ? <ChevronUp style={{ width: 14, height: 14, color: '#999' }} /> : <ChevronDown style={{ width: 14, height: 14, color: '#999' }} />}
              </button>
              {showTopCouponAccordion && (
                <form onSubmit={handleApplyCoupon} style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e8e2db', display: 'flex', gap: 8, maxWidth: 380 }}>
                  <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Coupon code"
                    style={{ flex: 1, padding: '7px 10px', fontSize: 12, border: '1px solid #ccc', borderRadius: 2, outline: 'none' }} />
                  <button type="submit" style={{ padding: '7px 14px', background: '#272727', color: '#fff', fontSize: 12, fontWeight: 600, border: 'none', borderRadius: 2, cursor: 'pointer' }}>Apply</button>
                </form>
              )}
              {couponApplied && <p style={{ marginTop: 6, fontSize: 12, color: '#16a34a', fontWeight: 600 }}>10% discount applied!</p>}
            </div>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', borderRadius: 2, background: '#fff5f5', border: '1px solid #fca5a5', color: '#dc2626', fontSize: 13, fontWeight: 500, marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handlePlaceOrder} style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 40, alignItems: 'start' }}>

            {/* Left: Billing Details */}
            <div>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 600, color: '#1a1a1a', margin: '0 0 24px' }}>Billing details</h2>

              {/* Field rows */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label className={labelCls}>First name *</label>
                  <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputCls} style={{ padding: '14px 14px' }} />
                </div>
                <div>
                  <label className={labelCls}>Last name *</label>
                  <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputCls} style={{ padding: '14px 14px' }} />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className={labelCls}>Country/Region *</label>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#333', margin: 0 }}>Hong Kong</p>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className={labelCls}>Street address *</label>
                <input type="text" required value={street1} onChange={(e) => setStreet1(e.target.value)}
                  placeholder="House number and street name" className={inputCls} style={{ marginBottom: 8, display: 'block', width: '100%', boxSizing: 'border-box', padding: '14px 14px', fontSize: 13, border: '1px solid #d0cac4', borderRadius: 2, outline: 'none', backgroundColor: '#fff' }} />
                <input type="text" value={street2} onChange={(e) => setStreet2(e.target.value)}
                  placeholder="Apartment, suite, unit, etc. (optional)" className={inputCls} style={{ display: 'block', width: '100%', boxSizing: 'border-box', padding: '14px 14px', fontSize: 13, border: '1px solid #d0cac4', borderRadius: 2, outline: 'none', backgroundColor: '#fff' }} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className={labelCls}>Town / City *</label>
                <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} style={{ padding: '14px 14px' }} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className={labelCls}>State / County *</label>
                <select value={stateRegion} onChange={(e) => setStateRegion(e.target.value)} className={inputCls} style={{ appearance: 'auto', padding: '14px 14px' }}>
                  <option value="Hong Kong Island">Hong Kong Island</option>
                  <option value="Kowloon">Kowloon</option>
                  <option value="New Territories">New Territories</option>
                  <option value="Outlying Islands">Outlying Islands</option>
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className={labelCls}>Postcode / ZIP (optional)</label>
                <input type="text" value={postcode} onChange={(e) => setPostcode(e.target.value)} className={inputCls} style={{ padding: '14px 14px' }} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className={labelCls}>Enter Phone Number *</label>
                <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className={inputCls} style={{ appearance: 'auto', marginBottom: 8, display: 'block', width: '100%', boxSizing: 'border-box', padding: '14px 14px', fontSize: 13, border: '1px solid #d0cac4', borderRadius: 2, outline: 'none', backgroundColor: '#f6f2ee' }}>
                  <option value="852">(+852) Hongkong</option>
                  <option value="91">(+91) India</option>
                  <option value="1">(+1) United States</option>
                  <option value="44">(+44) United Kingdom</option>
                  <option value="49">(+49) Germany</option>
                  <option value="33">(+33) France</option>
                  <option value="86">(+86) China</option>
                  <option value="81">(+81) Japan</option>
                  <option value="32">(+32) Belgium</option>
                  <option value="61">(+61) Australia</option>
                  <option value="886">(+886) Taiwan</option>
                  <option value="84">(+84) Vietnam</option>
                  <option value="63">(+63) Philippines</option>
                  <option value="31">(+31) Netherlands</option>
                  <option value="65">(+65) Singapore</option>
                  <option value="1-ca">(+1) Canada</option>
                </select>
                <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone Number" className={inputCls} style={{ padding: '14px 14px' }} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className={labelCls}>Email address *</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} style={{ padding: '14px 14px' }} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className={labelCls}>Hong Kong ID *</label>
                <input type="text" required value={hkId} onChange={(e) => setHkId(e.target.value)} placeholder="A123456(0)" className={inputCls} style={{ padding: '14px 14px' }} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#555', cursor: 'pointer' }}>
                  <input type="checkbox" checked={shipDifferent} onChange={(e) => setShipDifferent(e.target.checked)}
                    style={{ width: 15, height: 15, cursor: 'pointer' }} />
                  Ship to a different address?
                </label>
              </div>

              <div style={{ marginBottom: 8 }}>
                <label className={labelCls}>Order notes (optional)</label>
                <textarea
                  rows={5}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Notes about your order, e.g. special notes for delivery."
                  style={{ display: 'block', width: '100%', boxSizing: 'border-box', padding: '14px 14px', fontSize: 13, border: '1px solid #d0cac4', borderRadius: 2, outline: 'none', backgroundColor: '#fff', color: '#333', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
            </div>

            {/* Right: Your Order */}
            <div style={{ background: '#f3efea', border: '1px solid #e2dbd3', borderRadius: 2, padding: '20px 20px 24px' }}>
              <h3 style={{ textAlign: 'center', fontSize: 16, fontWeight: 700, color: '#1a1a1a', borderBottom: '1px solid #ddd6cd', paddingBottom: 14, margin: '0 0 16px' }}>
                Your order
              </h3>

              {/* Header row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', borderBottom: '1px solid #ddd6cd', paddingBottom: 8, marginBottom: 4 }}>
                <span>Product</span><span>Subtotal</span>
              </div>

              {items.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e6e0d8', padding: '10px 0', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.4, flex: 1 }}>
                    {item.title}{' '}
                    <span style={{ fontSize: 12, fontWeight: 400, color: '#888' }}>× {item.quantity}</span>
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', flexShrink: 0 }}>
                    HK${(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#555', borderBottom: '1px solid #e6e0d8', padding: '10px 0' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 600, color: '#1a1a1a' }}>HK${subtotal.toLocaleString()}</span>
              </div>

              {couponApplied && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#16a34a', fontWeight: 600, borderBottom: '1px solid #e6e0d8', padding: '10px 0' }}>
                  <span>Coupon Discount</span>
                  <span>−HK${discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#555', borderBottom: '1px solid #e6e0d8', padding: '10px 0' }}>
                <span>Shipment</span>
                <span style={{ fontWeight: 500 }}>Free shipping</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0 18px', borderBottom: '1px solid #ddd6cd', marginBottom: 16 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>Total</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a' }}>HK${grandTotal.toLocaleString()}</span>
              </div>

              {/* Payment Asia box */}
              <div style={{ border: '2px solid #1a1a1a', borderRadius: 3, background: '#fff', padding: '12px 14px', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>Payment Asia Gateway</span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', background: '#944426', padding: '2px 6px', borderRadius: 2 }}>PaymentAsia</span>
                </div>
                <p style={{ fontSize: 12, color: '#777', lineHeight: 1.5, margin: 0 }}>Pay securely through Payment Asia Generic services.</p>
              </div>

              {/* Terms */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: '#555', cursor: 'pointer', lineHeight: 1.5, marginBottom: 14 }}>
                <input type="checkbox" required checked={termsAgreed} onChange={(e) => setTermsAgreed(e.target.checked)}
                  style={{ marginTop: 2, width: 14, height: 14, cursor: 'pointer', flexShrink: 0 }} />
                <span>I have read and agree to the <a href="#terms" style={{ color: '#944426', fontWeight: 600 }}>terms &amp; conditions</a> *</span>
              </label>

              {/* Place Order */}
              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '13px 0', borderRadius: 100, background: '#1a1a1a', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {loading ? <Loader style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> : 'Place Order'}
              </button>

              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <button type="button" onClick={() => setStep('cart')}
                  style={{ fontSize: 12, color: '#888', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                  Return to cart
                </button>
              </div>
            </div>

          </form>
        </div>
      )}

      {/* ── STEP 3: ORDER CONFIRMATION ────────────────────────────── */}
      {step === 'order' && orderResult && (
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#16a34a' }}>
            <CheckCircle2 style={{ width: 38, height: 38 }} />
          </div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 28, color: '#1a1a1a', margin: '0 0 8px' }}>Order Confirmed!</h2>
          <p style={{ fontSize: 13, color: '#888', margin: '0 0 20px' }}>
            Order reference: <strong style={{ color: '#1a1a1a' }}>{orderResult.orderId}</strong>
          </p>
          <p style={{ fontSize: 13, color: '#555', lineHeight: 1.7, margin: '0 0 24px' }}>{orderResult.message}</p>
          <div style={{ background: '#fff', border: '1px solid #e2dbd3', borderRadius: 3, padding: '20px 24px', textAlign: 'left', marginBottom: 28 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', borderBottom: '1px solid #eee', paddingBottom: 8, margin: '0 0 12px' }}>Order Details</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#555', marginBottom: 8 }}>
              <span>Date:</span>
              <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{orderResult.date}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#555' }}>
              <span>Total Paid:</span>
              <span style={{ fontWeight: 700, color: '#944426' }}>HK${orderResult.total.toLocaleString()}</span>
            </div>
          </div>
          <button type="button" onClick={() => onViewChange && onViewChange('home')}
            style={{ padding: '12px 32px', borderRadius: 100, background: '#272727', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}>
            Return to Home
          </button>
        </div>
      )}

    </div>
  );
};
