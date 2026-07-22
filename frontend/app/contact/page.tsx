export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-2xl font-serif font-semibold mb-6">Contact Us</h1>
      <div className="card p-6 space-y-4 text-sm text-gray-600 leading-relaxed">
        <p>
          Have a question about an order, a product, or anything else? We're happy to help.
        </p>
        <div>
          <p className="font-medium text-gray-800">Email</p>
          <p>support@purnotashaj.com</p>
        </div>
        <div>
          <p className="font-medium text-gray-800">WhatsApp</p>
          <p>Use the "Ask on WhatsApp" button on any product page for the fastest response.</p>
        </div>
        <div>
          <p className="font-medium text-gray-800">Hours</p>
          <p>Monday to Saturday, 10 AM – 7 PM IST</p>
        </div>
      </div>
    </div>
  );
}
