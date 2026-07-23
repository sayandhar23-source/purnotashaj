export default function ReturnsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-2xl font-serif font-semibold mb-6">Returns & Exchanges</h1>
      <div className="card p-6 space-y-4 text-sm text-gray-600 leading-relaxed">
        <div>
          <p className="font-medium text-gray-800">Return window</p>
          <p>Items can be returned within 7 days of delivery, provided they're unused and in their original packaging.</p>
        </div>
        <div>
          <p className="font-medium text-gray-800">How to start a return</p>
          <p>Contact us via the Contact page or WhatsApp with your order number, and we'll guide you through the process.</p>
        </div>
        <div>
          <p className="font-medium text-gray-800">Non-returnable items</p>
          <p>For hygiene reasons, opened makeup and used cosmetic products cannot be returned.</p>
        </div>
        <div>
          <p className="font-medium text-gray-800">Refunds</p>
          <p>Once your return is received and inspected, refunds are processed to your original payment method within 5-7 business days.</p>
        </div>
      </div>
    </div>
  );
}
