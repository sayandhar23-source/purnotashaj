export const metadata = { title: 'Privacy Policy | Purnota Shaj' };

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-2xl font-serif font-semibold mb-2">Privacy Policy</h1>
      <p className="text-xs text-gray-400 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
      <div className="card p-6 space-y-5 text-sm text-gray-600 leading-relaxed">
        <div>
          <p className="font-medium text-gray-800 mb-1">1. What we collect</p>
          <p>
            When you create an account, place an order, or contact us, we may collect your name,
            email address, phone number, shipping address, and order history. We also
            automatically collect basic technical information (like IP address and browser type)
            for security and to keep the site working properly.
          </p>
        </div>
        <div>
          <p className="font-medium text-gray-800 mb-1">2. How we use it</p>
          <p>
            We use this information to process and deliver your orders, verify your account via
            email OTP, communicate with you about your orders, respond to enquiries (including via
            WhatsApp or live chat, if you choose to use them), and improve our products and
            service.
          </p>
        </div>
        <div>
          <p className="font-medium text-gray-800 mb-1">3. Payment information</p>
          <p>
            Payments are processed by our third-party payment providers (such as Stripe and
            Razorpay). We do not store your full card, UPI, or bank details on our own servers.
          </p>
        </div>
        <div>
          <p className="font-medium text-gray-800 mb-1">4. Sharing your information</p>
          <p>
            We don't sell your personal information. We share it only with the service providers
            necessary to run the store — for example, payment processors, email delivery, and
            shipping/logistics partners — solely to fulfil those services.
          </p>
        </div>
        <div>
          <p className="font-medium text-gray-800 mb-1">5. Cookies</p>
          <p>
            We use basic cookies/local storage to keep you logged in and to remember your cart and
            preferences. We do not use these for third-party advertising.
          </p>
        </div>
        <div>
          <p className="font-medium text-gray-800 mb-1">6. Data security</p>
          <p>
            Passwords are stored using industry-standard one-way encryption (hashing), and account
            access is protected by email OTP verification. No online service can guarantee
            absolute security, but we take reasonable measures to protect your information.
          </p>
        </div>
        <div>
          <p className="font-medium text-gray-800 mb-1">7. Your choices</p>
          <p>
            You can update your account details, change your email or password, or unsubscribe
            from our newsletter at any time from your account dashboard or via the unsubscribe
            option in any newsletter email.
          </p>
        </div>
        <div>
          <p className="font-medium text-gray-800 mb-1">8. Data retention</p>
          <p>
            We retain account and order information for as long as your account is active, or as
            needed to comply with our legal and accounting obligations.
          </p>
        </div>
        <div>
          <p className="font-medium text-gray-800 mb-1">9. Changes to this policy</p>
          <p>
            We may update this policy from time to time. Significant changes will be reflected by
            updating the date at the top of this page.
          </p>
        </div>
        <div>
          <p className="font-medium text-gray-800 mb-1">10. Contact us</p>
          <p>
            For any privacy-related questions or requests, reach out via our{' '}
            <a href="/contact" className="text-brand-500 underline">Contact Us</a> page.
          </p>
        </div>
      </div>
    </div>
  );
}
