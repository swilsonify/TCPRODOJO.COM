import { useEffect, useState } from 'react';
import { ShoppingCart, Shirt, Ticket, ExternalLink } from 'lucide-react';

const Shop = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Square Online Store URL - Replace this with your actual Square store URL after setup
  const SQUARE_STORE_URL = 'https://square.link/u/YOUR-STORE-ID'; // UPDATE THIS
  const MERCH_CATEGORY_URL = `${SQUARE_STORE_URL}?category=merch`;
  const TICKETS_CATEGORY_URL = `${SQUARE_STORE_URL}?category=tickets`;

  const merchItems = [
    {
      id: 1,
      name: 'TC Pro Dojo T-Shirt',
      description: 'Official Torture Chamber training shirt. Premium cotton blend.',
      price: '$29.99',
      image: 'tshirt'
    },
    {
      id: 2,
      name: 'TC Championship Hoodie',
      description: 'Stay warm with our signature hoodie featuring the TC logo.',
      price: '$54.99',
      image: 'hoodie'
    },
    {
      id: 3,
      name: 'TC Training Shorts',
      description: 'Breathable athletic shorts perfect for training.',
      price: '$34.99',
      image: 'shorts'
    },
    {
      id: 4,
      name: 'TC Snapback Cap',
      description: 'Adjustable snapback with embroidered TC logo.',
      price: '$24.99',
      image: 'cap'
    },
    {
      id: 5,
      name: 'TC Gym Bag',
      description: 'Durable gym bag with multiple compartments.',
      price: '$44.99',
      image: 'bag'
    },
    {
      id: 6,
      name: 'TC Water Bottle',
      description: '32oz stainless steel bottle with TC branding.',
      price: '$19.99',
      image: 'bottle'
    }
  ];

  return (
    <div className="pt-28 pb-20 px-4" data-testid="shop-page">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white torture-text mb-4">SHOP</h1>
          <div className="gradient-border mx-auto w-24 mb-6"></div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Official TC Pro Dojo merchandise and event tickets. Represent the brand, support the dojo.
          </p>
        </div>

        {/* Shop Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* TC Merch */}
          <a
            href={MERCH_CATEGORY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-br from-blue-900/40 to-blue-950/60 border-2 border-blue-500 rounded-lg p-8 hover-lift text-center group"
            data-testid="shop-merch-link"
          >
            <div className="w-20 h-20 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center">
              <Shirt size={40} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white torture-text mb-3">TC PRO DOJO MERCH</h2>
            <p className="text-gray-300 mb-4">Shop official apparel, gear, and accessories</p>
            <div className="flex items-center justify-center space-x-2 text-blue-400 group-hover:text-blue-300">
              <span className="font-semibold">SHOP NOW</span>
              <ExternalLink size={20} />
            </div>
          </a>

          {/* Event Tickets */}
          <a
            href={TICKETS_CATEGORY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-br from-blue-900/40 to-blue-950/60 border-2 border-blue-500 rounded-lg p-8 hover-lift text-center group"
            data-testid="shop-tickets-link"
          >
            <div className="w-20 h-20 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center">
              <Ticket size={40} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white torture-text mb-3">EVENT TICKETS</h2>
            <p className="text-gray-300 mb-4">Get tickets to upcoming shows and events</p>
            <div className="flex items-center justify-center space-x-2 text-blue-400 group-hover:text-blue-300">
              <span className="font-semibold">BUY TICKETS</span>
              <ExternalLink size={20} />
            </div>
          </a>
        </div>

        {/* Merch Preview Section */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-white torture-text text-center mb-8">FEATURED MERCH</h2>
          <p className="text-gray-400 text-center mb-8">Click any item to shop on our official store</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {merchItems.map((item) => (
              <a
                key={item.id}
                href={MERCH_CATEGORY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black border border-blue-500/20 rounded-lg overflow-hidden hover-lift group"
                data-testid={`merch-item-${item.id}`}
              >
                {/* Product Image Placeholder */}
                <div className="aspect-square bg-gradient-to-br from-blue-900 to-black flex items-center justify-center">
                  <div className="text-center p-6">
                    <ShoppingCart size={48} className="text-blue-500 mx-auto mb-2" />
                    <div className="text-gray-400 text-sm">{item.image}</div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="text-white font-bold mb-2 group-hover:text-blue-400 transition-colors">{item.name}</h3>
                  <p className="text-gray-400 text-sm mb-3 whitespace-pre-line">{item.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-blue-400">{item.price}</span>
                    <span className="text-blue-400 text-sm font-semibold group-hover:underline">Shop Now →</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="max-w-4xl mx-auto bg-black border border-blue-500/20 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Secure Checkout with Square</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-blue-400 text-3xl mb-2">🔒</div>
              <h4 className="text-white font-bold mb-2">Secure Payment</h4>
              <p className="text-gray-400 text-sm">Industry-leading encryption</p>
            </div>
            <div>
              <div className="text-blue-400 text-3xl mb-2">💳</div>
              <h4 className="text-white font-bold mb-2">All Cards Accepted</h4>
              <p className="text-gray-400 text-sm">Visa, Mastercard, Amex & more</p>
            </div>
            <div>
              <div className="text-blue-400 text-3xl mb-2">🚚</div>
              <h4 className="text-white font-bold mb-2">Fast Shipping</h4>
              <p className="text-gray-400 text-sm">Quick delivery on all merch</p>
            </div>
          </div>
        </div>

        {/* Setup Notice (Remove after Square setup) */}
        <div className="max-w-4xl mx-auto mt-8 bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-6">
          <div className="text-yellow-400 font-bold mb-2">⚠️ ADMIN NOTICE - Setup Required:</div>
          <p className="text-yellow-200 text-sm">
            Update the SQUARE_STORE_URL in /frontend/src/pages/Shop.js with your actual Square Online store link after setup.
            See setup instructions in the backend for creating your free Square Online store.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Shop;