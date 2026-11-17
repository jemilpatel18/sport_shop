import InfoPage from '@/components/InfoPage';

export const metadata = { title: 'Shipping & Returns' };

export default function ShippingReturnsPage() {
  return (
    <InfoPage
      eyebrow="Policies"
      title="Shipping & Returns"
      sections={[
        { heading: 'Shipping', body: 'We ship across India and selected international destinations. Orders are dispatched within 24 hours from our central warehouse. Standard delivery takes 3-5 business days; express delivery is available in metro cities. Shipping is free on orders over $100.' },
        { heading: 'Tracking', body: 'Every order gets a tracking number as soon as it ships. Track live status — order placed, processing, shipped, out for delivery and delivered — from My Account > My Orders.' },
        { heading: 'Returns', body: 'Eligible for return within 30 days of delivery if the product is unused, in original packaging with tags attached. Raise a return request from your order page or email support@sportzone.com.' },
        { heading: 'Refunds', body: 'Refunds for prepaid orders are processed to the original payment method within 5-7 business days of receiving the returned item. Cash on Delivery refunds are issued via bank transfer or store credit.' },
        { heading: 'Damaged or wrong items', body: 'If you receive a damaged, defective or incorrect item, contact us within 48 hours with photos. We will arrange a free replacement or full refund — no questions asked.' },
      ]}
    />
  );
}
