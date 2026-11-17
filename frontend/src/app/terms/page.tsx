import InfoPage from '@/components/InfoPage';

export const metadata = { title: 'Terms of Service' };

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Terms of Service"
      sections={[
        { heading: 'Acceptance', body: 'By using SPORTZONE you agree to these terms. If you do not agree, please do not use the platform.' },
        { heading: 'Products & Pricing', body: 'We strive for accuracy in product descriptions, images and pricing. Errors may occur; if a pricing error is discovered before dispatch we may cancel and refund the order.' },
        { heading: 'Orders & Payment', body: 'Orders are confirmed once payment is verified or Cash on Delivery is selected. We reserve the right to cancel orders affected by stock errors, suspected fraud, or delivery restrictions.' },
        { heading: 'Intellectual Property', body: 'All content on SPORTZONE — logos, images, text — is owned by or licensed to SPORTZONE and may not be reproduced without permission.' },
        { heading: 'Limitation of Liability', body: 'SPORTZONE is not liable for indirect damages arising from use of the platform. Our liability is limited to the value of the affected order.' },
      ]}
    />
  );
}
