'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CreditCard, Banknote, Smartphone, Lock, MapPin, User, Mail, Phone, CheckCircle2 } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { cartService } from '@/services/cartService';
import { orderService, CreateOrderPayload } from '@/services/orderService';
import { paymentService, loadRazorpayScript } from '@/services/paymentService';
import { formatPrice } from '@/lib/utils';
import { Address, PaymentMethod } from '@/types';
import EmptyState from '@/components/EmptyState';
import Spinner from '@/components/Spinner';
import { toast } from '@/stores/uiStore';

const emptyAddress = {
  fullName: '',
  phone: '',
  street: '',
  apartment: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  isDefault: true,
  type: 'home' as const,
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, couponCode, clearCart } = useCartStore();
  const user = useAuthStore((s) => s.user);

  const [form, setForm] = useState({
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    customerPhone: user?.phone || '',
    ...emptyAddress,
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [placing, setPlacing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const cart = useMemo(() => cartService.calculateCart(items, couponCode), [items, couponCode]);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <EmptyState title="Nothing to checkout" description="Your cart is empty." />
        <div className="text-center mt-6">
          <Link href="/shop" className="inline-flex px-8 py-4 bg-brand-charcoal text-white font-bold rounded-xl">Browse Products</Link>
        </div>
      </div>
    );
  }

  const set = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.customerName.trim()) e.customerName = 'Name is required';
    if (!/^\S+@\S+\.\S+$/.test(form.customerEmail)) e.customerEmail = 'Valid email required';
    if (form.customerPhone.replace(/\D/g, '').length < 6) e.customerPhone = 'Valid phone required';
    if (!form.street.trim()) e.street = 'Address required';
    if (!form.city.trim()) e.city = 'City required';
    if (!form.state.trim()) e.state = 'State required';
    if (form.postalCode.trim().length < 3) e.postalCode = 'Valid PIN code required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildPayload = (razorpay?: { orderId?: string; paymentId?: string; signature?: string }): CreateOrderPayload => ({
    customerName: form.customerName,
    customerEmail: form.customerEmail,
    customerPhone: form.customerPhone,
    shippingAddress: {
      fullName: form.fullName || form.customerName,
      phone: form.customerPhone,
      street: form.street,
      apartment: form.apartment || undefined,
      city: form.city,
      state: form.state,
      postalCode: form.postalCode,
      country: form.country,
      isDefault: false,
      type: 'home',
    } as Address,
    items: items.map((i) => ({
      id: i.id,
      productId: i.productId,
      product: i.product,
      size: i.size,
      color: i.color,
      quantity: i.quantity,
      price: i.price,
    })),
    paymentMethod,
    couponCode,
    razorpayOrderId: razorpay?.orderId,
    razorpayPaymentId: razorpay?.paymentId,
  });

  const placeOrder = async () => {
    if (!validate()) {
      toast.error('Please fill all required fields');
      return;
    }
    setPlacing(true);
    try {
      if (paymentMethod === 'COD') {
        const order = await orderService.createOrder(buildPayload());
        clearCart();
        router.push(`/account/orders/${order.id || order.orderNumber}`);
        toast.success(`Order ${order.orderNumber} placed successfully!`);
        return;
      }

      // Razorpay flow
      const scriptLoaded = await loadRazorpayScript();
      const rzpOrder = await paymentService.createRazorpayOrder(Math.round(cart.total * 100));

      if (!scriptLoaded || !rzpOrder || !(window as any).Razorpay) {
        // Backend unreachable — demo mode: place order without gateway
        toast.info('Payment gateway offline — order placed in demo mode');
        const order = await orderService.createOrder(buildPayload());
        clearCart();
        router.push(`/account/orders/${order.id || order.orderNumber}`);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_sportzone_demo123',
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: 'SPORTZONE',
        description: `Order — ${items.reduce((a, i) => a + i.quantity, 0)} items`,
        order_id: rzpOrder.id,
        prefill: {
          name: form.customerName,
          email: form.customerEmail,
          contact: form.customerPhone,
        },
        theme: { color: '#111318' },
        handler: async (response: any) => {
          try {
            await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            const order = await orderService.createOrder(
              buildPayload({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
              })
            );
            clearCart();
            router.push(`/account/orders/${order.id || order.orderNumber}`);
            toast.success('Payment successful! Order confirmed.');
          } catch {
            toast.error('Payment verification failed. Please contact support.');
            setPlacing(false);
          }
        },
        modal: {
          ondismiss: () => setPlacing(false),
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', () => {
        toast.error('Payment failed. Please try again or choose COD.');
        setPlacing(false);
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to place order');
      setPlacing(false);
    }
  };

  const inputCls = (key: string) =>
    `w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-lime focus:ring-2 focus:ring-brand-lime/20 ${
      errors[key] ? 'border-red-400' : 'border-gray-200'
    }`;

  const Field = ({ label, k, type = 'text', placeholder, required = true }: { label: string; k: string; type?: string; placeholder?: string; required?: boolean }) => (
    <div>
      <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input type={type} value={(form as any)[k]} onChange={(e) => set(k, e.target.value)} placeholder={placeholder} className={inputCls(k)} />
      {errors[k] && <p className="text-xs text-red-500 mt-1">{errors[k]}</p>}
    </div>
  );

  const paymentOptions = [
    { id: 'COD' as PaymentMethod, icon: Banknote, title: 'Cash on Delivery', desc: 'Pay when your order arrives' },
    { id: 'RAZORPAY_UPI' as PaymentMethod, icon: Smartphone, title: 'UPI / Razorpay', desc: 'Pay via UPI, cards & netbanking' },
    { id: 'RAZORPAY_CARD' as PaymentMethod, icon: CreditCard, title: 'Card Payment', desc: 'Credit / Debit card via Razorpay' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-charcoal uppercase mb-2">Checkout</h1>
      <p className="text-sm text-gray-500 mb-8">Complete your order — delivery address & payment</p>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-display text-lg font-bold text-brand-charcoal uppercase mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-brand-lime" /> Contact Information
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full Name" k="customerName" placeholder="John Doe" />
              <Field label="Phone" k="customerPhone" type="tel" placeholder="+91 98765 43210" />
              <Field label="Email" k="customerEmail" type="email" placeholder="you@example.com" />
            </div>
          </div>

          {/* Shipping address */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-display text-lg font-bold text-brand-charcoal uppercase mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-lime" /> Delivery Address
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full Name (Receiver)" k="fullName" placeholder="Receiver name" />
              <Field label="Phone" k="phone" type="tel" placeholder="Delivery contact" />
              <div className="sm:col-span-2">
                <Field label="Street Address" k="street" placeholder="House no, street, area" />
              </div>
              <Field label="Apartment / Landmark" k="apartment" placeholder="Optional" required={false} />
              <Field label="City" k="city" placeholder="City" />
              <Field label="State" k="state" placeholder="State" />
              <Field label="PIN Code" k="postalCode" placeholder="PIN / ZIP" />
            </div>
          </div>

          {/* Payment method */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-display text-lg font-bold text-brand-charcoal uppercase mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-brand-lime" /> Payment Method
            </h2>
            <div className="space-y-3">
              {paymentOptions.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    paymentMethod === opt.id ? 'border-brand-lime bg-brand-lime/5' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === opt.id}
                    onChange={() => setPaymentMethod(opt.id)}
                    className="accent-brand-lime"
                  />
                  <opt.icon className="w-6 h-6 text-brand-charcoal" />
                  <div className="flex-1">
                    <p className="font-bold text-sm text-brand-charcoal">{opt.title}</p>
                    <p className="text-xs text-gray-500">{opt.desc}</p>
                  </div>
                  {paymentMethod === opt.id && <CheckCircle2 className="w-5 h-5 text-brand-lime" />}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
            <h2 className="font-display text-xl font-bold text-brand-charcoal uppercase mb-5">Order Summary</h2>
            <div className="space-y-4 max-h-64 overflow-y-auto mb-5">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-brand-gray shrink-0">
                    <Image src={item.product.images?.[0]} alt={item.product.name} fill className="object-cover" sizes="56px" />
                    <span className="absolute -top-0 -right-0 bg-brand-charcoal text-brand-lime text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-bl-lg">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-gray-400">{item.size && `Size ${item.size} · `}{item.color}</p>
                  </div>
                  <span className="text-sm font-bold">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 text-sm border-t border-gray-100 pt-4">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-semibold">{formatPrice(cart.subtotal)}</span></div>
              {cart.couponDiscount > 0 && (
                <div className="flex justify-between text-green-600"><span>Coupon ({couponCode})</span><span className="font-semibold">-{formatPrice(cart.couponDiscount)}</span></div>
              )}
              <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span className="font-semibold">{cart.shipping === 0 ? 'FREE' : formatPrice(cart.shipping)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tax</span><span className="font-semibold">{formatPrice(cart.tax)}</span></div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="font-bold">Total</span>
                <span className="text-xl font-bold text-brand-charcoal">{formatPrice(cart.total)}</span>
              </div>
            </div>

            <button
              onClick={placeOrder}
              disabled={placing}
              className="w-full mt-5 py-4 bg-brand-lime text-brand-charcoal font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-brand-lime-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {placing ? <Spinner className="w-5 h-5 border-brand-charcoal/30 border-t-brand-charcoal" /> : <Lock className="w-4 h-4" />}
              {placing ? 'Processing…' : `Place Order · ${formatPrice(cart.total)}`}
            </button>
            <p className="text-[11px] text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
              <Mail className="w-3 h-3" /> Order confirmation will be sent to your email
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
