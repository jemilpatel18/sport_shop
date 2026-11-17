import InfoPage from '@/components/InfoPage';

export const metadata = { title: 'FAQ' };

export default function FAQPage() {
  return (
    <InfoPage
      eyebrow="Help Center"
      title="Frequently Asked Questions"
      sections={[
        { heading: 'How do I place an order?', body: 'Browse the shop, add products to your cart, and proceed to checkout. Fill in your delivery details, choose Cash on Delivery or pay online via Razorpay, and confirm your order. You will receive an order confirmation email instantly.' },
        { heading: 'Is SPORTZONE selling genuine products?', body: 'Yes. We source all products from official brand distributors and authorized channels. Every item is verified for authenticity before it reaches our warehouse.' },
        { heading: 'What is your return policy?', body: 'We offer a 30-day easy return window on unused products in original packaging. Initiate a return from your order details page or contact support. Refunds are processed within 5-7 business days.' },
        { heading: 'How long does delivery take?', body: 'Standard delivery takes 3-5 business days. Express options are available at checkout for select pin codes. You can track your order in real time from your account dashboard.' },
        { heading: 'Do you offer bulk or academy pricing?', body: 'Yes — academies, schools and clubs can contact our sales team for bulk pricing on team kits, equipment and accessories.' },
      ]}
    />
  );
}
