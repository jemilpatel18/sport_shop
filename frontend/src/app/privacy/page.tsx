import InfoPage from '@/components/InfoPage';

export const metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Privacy Policy"
      sections={[
        { heading: 'Information We Collect', body: 'We collect information you provide directly — name, email, phone, delivery address — and usage data such as pages visited and products viewed to improve your experience.' },
        { heading: 'How We Use Your Data', body: 'Your information is used to process orders, deliver products, send order updates, provide customer support and (with consent) send promotional emails. We never sell your personal data to third parties.' },
        { heading: 'Cookies & Security', body: 'We use secure HttpOnly cookies for authentication and standard analytics cookies to understand site usage. All payments are processed through PCI-DSS compliant gateways.' },
        { heading: 'Your Rights', body: 'You can access, update or delete your account data at any time from Account Settings, or by contacting support@sportzone.com.' },
        { heading: 'Contact', body: 'For privacy questions, reach our data team at privacy@sportzone.com or write to SPORTZONE, 100 Arena Street, New York, NY 10001.' },
      ]}
    />
  );
}
