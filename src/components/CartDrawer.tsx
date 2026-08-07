import React, { useState } from 'react';
import {
  X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck,
  CreditCard, Upload, CheckCircle2, Loader, Sparkles, FileText
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { fetchFormData } from '../services/api';
import { API_BASE_URL } from '../config/apiConfig';

interface CartDrawerProps {
  onOpenBooking?: (type?: string, title?: string, details?: any) => void;
  onOpenCartPage?: () => void;
}

type CheckoutStep = 'cart' | 'checkout' | 'guest-otp' | 'bank-upload' | 'success';
type PaymentMethod = 'online' | 'bank' | 'reserve_desk';

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOpenCartPage }) => {
  const { items, cartCount, subtotal, isCartOpen, closeCart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user, authFetch, setSessionTokens } = useAuth();

  const [step, setStep] = useState<CheckoutStep>('cart');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('online');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Guest details
  const [guestEmail, setGuestEmail] = useState('');
  const [guestOtp, setGuestOtp] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [countryCode] = useState('852');

  // Bank receipt file
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  if (!isCartOpen) return null;

  const resolveNumericId = (id: number | string): number => {
    const n = Number(id);
    if (!isNaN(n) && n > 0) return n;
    return 12795; // Default live package ID
  };

  const packageIds = items.map((i) => resolveNumericId(i.id));

  const handleInitiateGuestCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!guestEmail) { setError('Please enter your email address.'); return; }
    setLoading(true);
    try {
      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'guestBookingCheckEmail', email: guestEmail }),
      }).then((r) => r.json());
      if (res?.fname) setGuestName(res.fname);
      if (res?.phone) setGuestPhone(res.phone);
      setStep('guest-otp');
    } catch {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  const handleFinalizeCheckout = async () => {
    setError('');
    setLoading(true);
    try {
      let res: any;
      if (user) {
        res = await authFetch('reserve_bundle', {
          package_ids: packageIds,
          total_amount: subtotal,
          payment_method: paymentMethod,
        });
      } else {
        res = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'guest_reserve_bundle',
            otp: guestOtp,
            email: guestEmail,
            name: guestName,
            phone: guestPhone,
            country_code: countryCode,
            package_ids: packageIds,
          }),
        }).then((r) => r.json());
      }

      if (res?.success === true || res?.status === true) {
        if (!user && res.access_token) {
          setSessionTokens({
            uid: String(res.uid || ''),
            name: res.name || guestName || guestEmail.split('@')[0],
            email: guestEmail,
            access_token: res.access_token,
            refresh_token: res.refresh_token || '',
          });
        }
        if (paymentMethod === 'bank') {
          setSuccessMsg('Cart reservation submitted! Please upload your payment receipt below.');
          setStep('bank-upload');
        } else {
          setSuccessMsg(res.message || 'Your cart reservation has been confirmed! Our sanctuary team will reach out.');
          setStep('success');
          clearCart();
        }
      } else {
        let msg = res?.errors?.isEmpty || res?.message || 'Checkout failed. Please try again.';
        if (msg === 'Please Try Again') {
          msg = 'One of the items in your cart is unavailable for reservation. Please review your cart.';
        }
        setError(msg);
      }
    } catch {
      setError('Network error during checkout.');
    }
    setLoading(false);
  };

  const handleUploadReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptFile) { setError('Please select a receipt image file.'); return; }
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('receipt_image', receiptFile);
      formData.append('amount', String(subtotal));
      formData.append('remarks', `Cart Bundle Payment (${cartCount} items)`);
      const res = await fetchFormData('upload-bank-receipt', formData, user?.access_token);
      if (res?.status || res?.success) {
        setSuccessMsg('Payment receipt uploaded successfully! Our billing team will verify your transfer.');
        setStep('success');
        clearCart();
      } else {
        setError(res?.message || 'Failed to upload receipt. Please try again.');
      }
    } catch {
      setError('Network error uploading receipt.');
    }
    setLoading(false);
  };

  const handleClose = () => {
    setStep('cart');
    setError('');
    closeCart();
  };

  return (
    <div className="fixed inset-0 z-[999999] overflow-hidden">
      {/* Backdrop with smooth blur */}
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 w-full sm:w-[420px] max-w-full flex flex-col bg-[#FAF6F0] shadow-2xl border-l border-[#D8C8BC] overflow-hidden">

        {/* HEADER */}
        <div className="flex-none flex items-center justify-between px-5 sm:px-6 py-4.5 sm:py-5 bg-[#F5EFE5] border-b border-[#D8C8BC] gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#944426]/10 border border-[#944426]/15 flex items-center justify-center text-[#944426] shrink-0 shadow-sm">
              <ShoppingBag className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-serif text-lg sm:text-xl font-medium text-[#272727] leading-tight tracking-tight">Sanctuary Cart</h3>
              <p className="text-xs font-medium text-[#8A8580] mt-0.5">{cartCount} {cartCount === 1 ? 'item' : 'items'} selected</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-stone-200/60 hover:bg-[#944426]/10 hover:text-[#944426] text-stone-600 transition-all flex items-center justify-center shrink-0 cursor-pointer"
            aria-label="Close Cart"
          >
            <X className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto overscroll-contain min-h-0 bg-[#FAF6F0]">

          {error && (
            <div className="mx-5 sm:mx-6 mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium leading-relaxed">
              {error}
            </div>
          )}

          {/* STEP 1: CART */}
          {step === 'cart' && (
            <>
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center min-h-[420px]">
                  <div className="w-20 h-20 rounded-full bg-[#F5EFE5] border border-[#D8C8BC] flex items-center justify-center text-[#944426] mb-6 shadow-sm">
                    <ShoppingBag className="w-9 h-9" />
                  </div>
                  <h4 className="font-serif text-2xl font-normal text-[#272727] mb-2.5">Your Cart is Empty</h4>
                  <p className="text-sm text-[#5A5854] leading-relaxed mb-8 max-w-[260px]">
                    Explore our sanctuary memberships, private master sessions, and workshops.
                  </p>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#944426] text-white text-xs font-bold uppercase tracking-[0.14em] leading-normal hover:bg-[#7a351c] active:scale-[0.98] transition-all shadow-md shadow-[#944426]/20 cursor-pointer"
                  >
                    Browse Offerings
                  </button>
                </div>
              ) : (
                <div className="px-4.5 sm:px-6 py-4 sm:py-5 space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-[#D8C8BC]/80 shadow-sm overflow-hidden hover:border-[#944426]/30 transition-all"
                    >
                      {/* Card Top */}
                      <div className="flex items-center gap-3 sm:gap-3.5 p-3.5 sm:p-4 bg-white">
                        {item.coverImage ? (
                          <img
                            src={item.coverImage}
                            alt={item.title}
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-[#EAE1D3] shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#F5EFE5] border border-[#EAE1D3] flex items-center justify-center text-[#944426] shrink-0">
                            <Sparkles className="w-5 h-5" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-[#272727] leading-snug line-clamp-2 mb-1.5">
                            {item.title}
                          </p>
                          {item.category && (
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#944426]/10 text-[#944426] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                              {item.category}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Bottom: Price + Controls */}
                      <div className="flex items-center justify-between px-3.5 sm:px-4 py-2.5 sm:py-3 bg-[#FAF6F0] border-t border-[#EAE1D3] gap-2">
                        <span className="text-sm sm:text-base font-bold text-[#944426] shrink-0 whitespace-nowrap">
                          HK$ {(item.price * item.quantity).toLocaleString()}
                        </span>
                        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full bg-white border border-[#D8C8BC] hover:bg-[#944426] hover:text-white hover:border-[#944426] active:scale-95 flex items-center justify-center text-stone-700 transition-all cursor-pointer"
                            aria-label="Decrease Quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 sm:w-7 text-center text-xs sm:text-sm font-bold text-[#272727]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full bg-white border border-[#D8C8BC] hover:bg-[#944426] hover:text-white hover:border-[#944426] active:scale-95 flex items-center justify-center text-stone-700 transition-all cursor-pointer"
                            aria-label="Increase Quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full bg-red-50 border border-red-100 hover:bg-red-500 hover:text-white hover:border-red-500 active:scale-95 flex items-center justify-center text-red-500 transition-all ml-1 cursor-pointer"
                            aria-label="Remove Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* STEP 2: CHECKOUT */}
          {step === 'checkout' && (
            <div className="p-6 space-y-5">

              <div className="bg-white rounded-2xl border border-[#D8C8BC] overflow-hidden shadow-sm">
                <div className="px-5 py-3.5 bg-[#F5EFE5] border-b border-[#D8C8BC]">
                  <span className="text-[11px] font-bold text-[#8A8580] uppercase tracking-widest">Order Summary</span>
                </div>
                <div className="px-5 py-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-stone-600">Items ({cartCount})</span>
                    <span className="text-sm font-semibold text-[#272727]">HK$ {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex items-baseline justify-between pt-3 border-t border-[#EAE1D3]">
                    <span className="font-serif text-base font-semibold text-[#272727]">Total Due</span>
                    <span className="font-serif text-xl font-bold text-[#944426]">HK$ {subtotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold text-[#8A8580] uppercase tracking-widest mb-3">Select Payment Method</p>
                <div className="space-y-2.5">
                  {([
                    {
                      key: 'online' as PaymentMethod,
                      icon: <CreditCard className="w-4 h-4" />,
                      title: 'Credit Card / Online Checkout',
                      desc: 'Pay via Stripe · PayMe · Gateway',
                    },
                    {
                      key: 'bank' as PaymentMethod,
                      icon: <Upload className="w-4 h-4" />,
                      title: 'Bank Transfer / FPS Upload',
                      desc: 'Upload receipt for billing verification',
                    },
                    {
                      key: 'reserve_desk' as PaymentMethod,
                      icon: <ShieldCheck className="w-4 h-4" />,
                      title: 'Reserve Cart & Pay at Studio',
                      desc: 'Hold space, complete payment at desk',
                    },
                  ] as const).map((opt) => {
                    const sel = paymentMethod === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setPaymentMethod(opt.key)}
                        className={`w-full flex items-center gap-3.5 px-4.5 py-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${sel ? 'border-[#944426] bg-[#944426]/5 shadow-sm' : 'border-[#EAE1D3] bg-white hover:border-[#944426]/30'}`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${sel ? 'bg-[#944426] text-white' : 'bg-[#F5EFE5] text-[#944426]'}`}>
                          {opt.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[#272727] leading-snug">{opt.title}</p>
                          <p className="text-xs text-stone-500 mt-0.5">{opt.desc}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${sel ? 'border-[#944426] bg-[#944426]' : 'border-stone-300'}`}>
                          {sel && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {!user && (
                <form onSubmit={handleInitiateGuestCheckout} className="pt-4 border-t border-[#D8C8BC] space-y-4">
                  <p className="text-[11px] font-bold text-[#8A8580] uppercase tracking-widest">Guest Checkout Info</p>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-3.5 rounded-xl border border-[#D8C8BC] bg-white text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-[#944426] focus:ring-2 focus:ring-[#944426]/20 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-full bg-[#944426] text-white font-bold text-xs uppercase tracking-[0.14em] hover:bg-[#7a351c] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-[#944426]/20 disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? <Loader className="w-4 h-4 animate-spin" /> : <>Send Verification OTP <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* STEP 3: GUEST OTP */}
          {step === 'guest-otp' && !user && (
            <div className="p-6 space-y-4">
              <div className="bg-white rounded-2xl border border-[#D8C8BC] px-6 py-6 text-center shadow-sm">
                <Sparkles className="w-8 h-8 text-[#944426] mx-auto mb-2.5" />
                <h4 className="font-serif text-xl font-semibold text-[#272727] mb-1">Verify Email OTP</h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  We sent a 6-digit code to <span className="font-semibold text-stone-800">{guestEmail}</span>
                </p>
              </div>
              {[
                { label: 'OTP Code', val: guestOtp, setter: setGuestOtp, type: 'text', placeholder: '6-digit code' },
                { label: 'Full Name', val: guestName, setter: setGuestName, type: 'text', placeholder: 'Your full name' },
                { label: 'Phone Number', val: guestPhone, setter: setGuestPhone, type: 'tel', placeholder: '8533969185' },
              ].map((field) => (
                <div key={field.label}>
                  <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    required
                    value={field.val}
                    onChange={(e) => field.setter(e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3.5 rounded-xl border border-[#D8C8BC] bg-white text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-[#944426] focus:ring-2 focus:ring-[#944426]/20 transition-all"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={handleFinalizeCheckout}
                disabled={loading}
                className="w-full py-4 rounded-full bg-[#944426] text-white font-bold text-xs uppercase tracking-[0.14em] hover:bg-[#7a351c] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-[#944426]/20 disabled:opacity-60 cursor-pointer"
              >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : 'Confirm Cart Checkout'}
              </button>
            </div>
          )}

          {/* STEP 4: BANK UPLOAD */}
          {step === 'bank-upload' && (
            <form onSubmit={handleUploadReceipt} className="p-6 space-y-5">
              <div className="bg-white rounded-2xl border border-[#D8C8BC] px-6 py-6 text-center shadow-sm">
                <FileText className="w-8 h-8 text-[#944426] mx-auto mb-2.5" />
                <h4 className="font-serif text-xl font-semibold text-[#272727] mb-1">Upload Transfer Receipt</h4>
                <p className="text-xs text-stone-500">
                  Total Amount: <span className="font-bold text-[#944426]">HK$ {subtotal.toLocaleString()}</span>
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                  Receipt Image File
                </label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-stone-600 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#944426] file:text-white hover:file:bg-[#7a351c] cursor-pointer"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-full bg-[#944426] text-white font-bold text-xs uppercase tracking-[0.14em] hover:bg-[#7a351c] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-[#944426]/20 disabled:opacity-60 cursor-pointer"
              >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : 'Submit Payment Proof'}
              </button>
            </form>
          )}

          {/* STEP 5: SUCCESS */}
          {step === 'success' && (
            <div className="flex flex-col items-center justify-center min-h-[450px] px-8 py-12 text-center">
              <div className="w-18 h-18 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h4 className="font-serif text-2xl font-normal text-[#272727] mb-2.5">Booking Confirmed!</h4>
              <p className="text-sm text-[#5A5854] leading-relaxed max-w-[260px] mb-8">{successMsg}</p>
              <button
                type="button"
                onClick={handleClose}
                className="inline-flex items-center justify-center px-10 py-3.5 rounded-full bg-[#944426] text-white text-xs font-bold uppercase tracking-[0.14em] hover:bg-[#7a351c] active:scale-[0.98] transition-all shadow-md shadow-[#944426]/20 cursor-pointer"
              >
                Done
              </button>
            </div>
          )}

        </div>

        {/* FOOTER */}
        {step === 'cart' && items.length > 0 && (
          <div className="flex-none border-t border-[#D8C8BC] bg-[#F5EFE5] px-6 pt-5 pb-7 sm:pb-6 space-y-4 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8A8580] font-semibold text-[11px] uppercase tracking-wider">Subtotal</span>
              <span className="font-semibold text-[#272727] text-sm">HK$ {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex items-baseline justify-between pt-2.5 border-t border-[#D8C8BC]/70">
              <div className="flex flex-col">
                <span className="font-serif text-base font-semibold text-[#272727] leading-none">Total Amount</span>
                <span className="text-[10px] text-[#8A8580] mt-1 font-medium">Taxes & charges included</span>
              </div>
              <span className="font-serif text-2xl font-bold text-[#944426] leading-none tracking-tight">
                HK$ {subtotal.toLocaleString()}
              </span>
            </div>
            {user ? (
              <button
                type="button"
                onClick={handleFinalizeCheckout}
                disabled={loading}
                className="w-full h-13 py-3.5 px-6 rounded-full bg-[#944426] text-white font-bold text-xs uppercase tracking-[0.14em] leading-none hover:bg-[#7a351c] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-[#944426]/20 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  closeCart();
                  if (onOpenCartPage) onOpenCartPage();
                  else setStep('checkout');
                }}
                className="w-full h-13 py-3.5 px-6 rounded-full bg-[#944426] text-white font-bold text-xs uppercase tracking-[0.14em] leading-none hover:bg-[#7a351c] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-[#944426]/20 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
