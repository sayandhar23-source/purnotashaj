export const metadata = { title: 'Terms & Conditions | Purnota Shaj' };

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-2xl font-serif font-semibold mb-2">Terms & Conditions</h1>
      <p className="text-xs text-gray-400 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
      <div className="card p-6 space-y-5 text-sm text-gray-600 leading-relaxed">
        <div>
          <p className="font-medium text-gray-800 mb-1">1. About these terms</p>
          <p>
            By accessing or using the Purnota Shaj website, you agree to be bound by these Terms
            & Conditions. If you do not agree, please do not use this site.
          </p>
        </div>
        <div>
          <p className="font-medium text-gray-800 mb-1">2. Products & pricing</p>
          <p>
            We make reasonable efforts to display product details, images, and prices accurately.
            Prices are subject to change without notice, and we reserve the right to correct any
            pricing errors, including on orders already placed, before they are confirmed.
          </p>
        </div>
        <div>
          <p className="font-medium text-gray-800 mb-1">3. Orders & payment</p>
          <p>
            Placing an order is an offer to purchase, which we may accept or decline at our
            discretion (for example, in cases of suspected fraud or stock unavailability). Payment
            is processed securely through our third-party payment providers; we do not store your
            full card details.
          </p>
        </div>
        <div>
          <p className="font-medium text-gray-800 mb-1">4. Shipping & delivery</p>
          <p>
            Delivery timelines shown on the site are estimates, not guarantees. See our{' '}
            <a href="/shipping" className="text-brand-500 underline">Shipping Information</a> page
            for details.
          </p>
        </div>
        <div>
          <p className="font-medium text-gray-800 mb-1">5. Returns & refunds</p>
          <p>
            Our return and refund policy is described on the{' '}
            <a href="/returns" className="text-brand-500 underline">Returns & Exchanges</a> page,
            which forms part of these terms.
          </p>
        </div>
        <div>
          <p className="font-medium text-gray-800 mb-1">6. Account responsibility</p>
          <p>
            You're responsible for maintaining the confidentiality of your account credentials and
            for all activity under your account. Notify us immediately of any unauthorized use.
          </p>
        </div>
        <div>
          <p className="font-medium text-gray-800 mb-1">7. Intellectual property</p>
          <p>
            All content on this site — including product photography, logos, and text — belongs to
            Purnota Shaj or its licensors and may not be used without permission.
          </p>
        </div>
        <div>
          <p className="font-medium text-gray-800 mb-1">8. Limitation of liability</p>
          <p>
            To the extent permitted by law, Purnota Shaj is not liable for any indirect or
            consequential loss arising from your use of this site or its products.
          </p>
        </div>
        <div>
          <p className="font-medium text-gray-800 mb-1">9. Changes to these terms</p>
          <p>
            We may update these terms from time to time. Continued use of the site after changes
            are posted constitutes acceptance of the revised terms.
          </p>
        </div>
        <div>
          <p className="font-medium text-gray-800 mb-1">10. Contact</p>
          <p>
            Questions about these terms? Reach out via our{' '}
            <a href="/contact" className="text-brand-500 underline">Contact Us</a> page.
          </p>
        </div>
      </div>
    </div>
  );
}
