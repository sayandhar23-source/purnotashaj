export default function ShippingPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-2xl font-serif font-semibold mb-6">Shipping Information</h1>
      <div className="card p-6 space-y-4 text-sm text-gray-600 leading-relaxed">
        <div>
          <p className="font-medium text-gray-800">Processing time</p>
          <p>Orders are processed within 1-2 business days of confirmation.</p>
        </div>
        <div>
          <p className="font-medium text-gray-800">Delivery time</p>
          <p>Standard delivery typically takes 4-7 business days depending on your location.</p>
        </div>
        <div>
          <p className="font-medium text-gray-800">Order tracking</p>
          <p>You can check your order status anytime from your account dashboard under "My Orders".</p>
        </div>
        <div>
          <p className="font-medium text-gray-800">Shipping charges</p>
          <p>Shipping costs, if any, are calculated at checkout before you complete payment.</p>
        </div>
      </div>
    </div>
  );
}
