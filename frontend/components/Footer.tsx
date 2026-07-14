import Newsletter from './Newsletter';
import AnimatedLogo from './AnimatedLogo';

export default function Footer() {
  return (
    <footer className="bg-[#2C120A] text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center mb-12">
          <AnimatedLogo variant="full" />
        </div>

        <Newsletter />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 text-sm">
          <div>
            <h4 className="text-white font-semibold mb-3">Shop</h4>
            <ul className="space-y-2">
              <li>Clothing</li>
              <li>Jewellery</li>
              <li>Ornaments</li>
              <li>Makeup</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Account</h4>
            <ul className="space-y-2">
              <li>My Orders</li>
              <li>Wishlist</li>
              <li>Track Order</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Help</h4>
            <ul className="space-y-2">
              <li>Contact Us</li>
              <li>Shipping</li>
              <li>Returns</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Purnota Shaj</h4>
            <p>Curated clothing, jewellery, ornaments and makeup — delivered with care.</p>
          </div>
        </div>
        <p className="text-center text-xs text-gray-500 mt-10">
          © {new Date().getFullYear()} Purnota Shaj. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
