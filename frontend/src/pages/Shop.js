import { useEffect, useState, useCallback } from 'react';
import { ShoppingCart, Plus, Minus, X, Truck, CreditCard, Package, ChevronRight, Check } from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

const SHIPPING_LABELS = {
  quebec: 'Montreal / Quebec — $10.00',
  canada: 'Rest of Canada — $15.00',
  international: 'International — $25.00'
};
const SHIPPING_COSTS = { quebec: 10.00, canada: 15.00, international: 25.00 };

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('tcprodojo_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [pollingStatus, setPollingStatus] = useState(null);

  const [checkoutForm, setCheckoutForm] = useState({
    name: '', email: '', phone: '',
    street: '', city: '', province: '', country: 'Canada', postal_code: '',
    notes: ''
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('tcprodojo_cart', JSON.stringify(cart));
      // Dispatch event so Navigation can update its count
      window.dispatchEvent(new Event('cart-updated'));
    } catch {}
  }, [cart]);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadProducts();
    checkReturnFromStripe();

    // Auto-open cart if navigated here with ?cart=open
    const params = new URLSearchParams(window.location.search);
    if (params.get('cart') === 'open') {
      setShowCart(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const loadProducts = async () => {
    try {
      const res = await axios.get(`${API}/api/products`);
      setProducts(res.data);
    } catch (e) {
      console.error('Error loading products:', e);
    } finally {
      setLoading(false);
    }
  };

  const checkReturnFromStripe = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (sessionId) {
      setPollingStatus('checking');
      pollPaymentStatus(sessionId, 0);
    }
  }, []);

  const pollPaymentStatus = async (sessionId, attempt) => {
    if (attempt >= 8) {
      setPollingStatus('timeout');
      return;
    }
    try {
      const res = await axios.get(`${API}/api/shop/order-status/${sessionId}`);
      if (res.data.payment_status === 'paid') {
        setOrderSuccess(true);
        setPollingStatus('paid');
        setCart([]);
        window.history.replaceState({}, '', window.location.pathname);
        return;
      } else if (res.data.status === 'expired') {
        setPollingStatus('expired');
        return;
      }
      setTimeout(() => pollPaymentStatus(sessionId, attempt + 1), 2500);
    } catch (e) {
      console.error('Error polling:', e);
      setTimeout(() => pollPaymentStatus(sessionId, attempt + 1), 3000);
    }
  };

  const addToCart = (product, size) => {
    setCart(prev => {
      const existing = prev.find(i => i.product_id === product.id && i.size === size);
      if (existing) {
        return prev.map(i =>
          i.product_id === product.id && i.size === size
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product_id: product.id, name: product.name, price: product.price, size, quantity: 1, imageUrl: product.imageUrl }];
    });
  };

  const updateQuantity = (idx, delta) => {
    setCart(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const newQty = item.quantity + delta;
      return newQty > 0 ? { ...item, quantity: newQty } : item;
    }));
  };

  const removeFromCart = (idx) => {
    setCart(prev => prev.filter((_, i) => i !== idx));
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const getShippingZone = () => {
    const country = checkoutForm.country.trim().toLowerCase();
    if (['canada', 'ca', 'can'].includes(country)) {
      const prov = checkoutForm.province.trim().toUpperCase();
      if (['QC', 'QUEBEC', 'QUÉBEC', 'MONTREAL', 'MONTRÉAL'].includes(prov)) return 'quebec';
      return 'canada';
    }
    return 'international';
  };

  const shippingZone = getShippingZone();
  const shippingCost = SHIPPING_COSTS[shippingZone];
  const orderTotal = cartTotal + shippingCost;

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setCheckingOut(true);

    try {
      const res = await axios.post(`${API}/api/shop/checkout`, {
        customer_name: checkoutForm.name,
        customer_email: checkoutForm.email,
        customer_phone: checkoutForm.phone,
        items: cart.map(i => ({
          product_id: i.product_id,
          name: i.name,
          price: i.price,
          size: i.size,
          quantity: i.quantity
        })),
        shipping_address: {
          street: checkoutForm.street,
          city: checkoutForm.city,
          province: checkoutForm.province,
          country: checkoutForm.country,
          postal_code: checkoutForm.postal_code
        },
        order_notes: checkoutForm.notes,
        origin_url: window.location.origin
      });

      if (res.data.checkout_url) {
        window.location.href = res.data.checkout_url;
      }
    } catch (e) {
      console.error('Checkout error:', e);
      alert('There was an error processing your order. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="pt-28 pb-20 px-4" data-testid="order-success">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="bg-black border border-green-500/30 rounded-lg p-12">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={40} className="text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Order Confirmed!</h1>
            <p className="text-gray-300 mb-2">Thank you for your purchase from TC Pro Dojo.</p>
            <p className="text-gray-400 mb-6">A confirmation email has been sent to your inbox.</p>
            <p className="text-yellow-400 font-semibold text-sm mb-8">Please allow 4 weeks for delivery.</p>
            <button
              onClick={() => { setOrderSuccess(false); window.location.href = '/shop'; }}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition-colors"
              data-testid="continue-shopping-btn"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (pollingStatus === 'checking') {
    return (
      <div className="pt-28 pb-20 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="bg-black border border-blue-500/20 rounded-lg p-12">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-white mb-2">Processing Payment...</h2>
            <p className="text-gray-400">Please wait while we confirm your payment.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 px-4" data-testid="shop-page">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white torture-text mb-4">SHOP</h1>
          <div className="gradient-border mx-auto w-24 mb-4"></div>
          <p className="text-gray-400 text-base max-w-xl mx-auto">
            Official TC Pro Dojo merchandise. Represent the brand, support the dojo.
          </p>
        </div>

        {/* Floating Cart Button */}
        {cartCount > 0 && !showCheckout && (
          <button
            onClick={() => setShowCart(true)}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-xl transition-all"
            data-testid="cart-fab"
          >
            <ShoppingCart size={20} />
            <span>{cartCount} item{cartCount !== 1 ? 's' : ''}</span>
            <span className="text-blue-200">${cartTotal.toFixed(2)}</span>
          </button>
        )}

        {/* Checkout View */}
        {showCheckout ? (
          <div data-testid="checkout-section">
            <button onClick={() => setShowCheckout(false)} className="text-blue-400 hover:text-blue-300 mb-6 text-sm font-semibold">&larr; Back to Shop</button>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3">
                <div className="bg-black border border-blue-500/20 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Truck size={20} className="text-blue-400" /> Shipping & Payment
                  </h2>
                  <form onSubmit={handleCheckout} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Full Name *</label>
                        <input type="text" required value={checkoutForm.name}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:border-blue-500 focus:outline-none"
                          data-testid="checkout-name" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Email *</label>
                        <input type="email" required value={checkoutForm.email}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:border-blue-500 focus:outline-none"
                          data-testid="checkout-email" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Phone</label>
                        <input type="tel" value={checkoutForm.phone}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:border-blue-500 focus:outline-none"
                          data-testid="checkout-phone" />
                      </div>
                    </div>

                    <h3 className="text-white font-semibold text-sm mt-6 mb-2">Shipping Address</h3>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Street Address *</label>
                      <input type="text" required value={checkoutForm.street}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, street: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:border-blue-500 focus:outline-none"
                        data-testid="checkout-street" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">City *</label>
                        <input type="text" required value={checkoutForm.city}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, city: e.target.value })}
                          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:border-blue-500 focus:outline-none"
                          data-testid="checkout-city" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Province/State</label>
                        <input type="text" value={checkoutForm.province}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, province: e.target.value })}
                          placeholder="QC"
                          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:border-blue-500 focus:outline-none"
                          data-testid="checkout-province" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Country *</label>
                        <input type="text" required value={checkoutForm.country}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, country: e.target.value })}
                          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:border-blue-500 focus:outline-none"
                          data-testid="checkout-country" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Postal Code *</label>
                        <input type="text" required value={checkoutForm.postal_code}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, postal_code: e.target.value })}
                          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:border-blue-500 focus:outline-none"
                          data-testid="checkout-postal" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Order Notes (optional)</label>
                      <textarea value={checkoutForm.notes}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, notes: e.target.value })}
                        rows="2" className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:border-blue-500 focus:outline-none"
                        data-testid="checkout-notes" />
                    </div>

                    <p className="text-yellow-400 text-sm font-semibold mt-2">Please allow 4 weeks for delivery.</p>

                    <button type="submit" disabled={checkingOut || cart.length === 0}
                      className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-bold rounded flex items-center justify-center gap-2 transition-colors"
                      data-testid="pay-now-btn"
                    >
                      <CreditCard size={20} />
                      {checkingOut ? 'Processing...' : `Pay $${orderTotal.toFixed(2)} CAD`}
                    </button>
                  </form>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="bg-black border border-blue-500/20 rounded-lg p-6 sticky top-28">
                  <h3 className="text-lg font-bold text-white mb-4">Order Summary</h3>
                  <div className="space-y-3 mb-4">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start text-sm">
                        <div>
                          <p className="text-white">{item.name} {item.size && <span className="text-gray-500">({item.size})</span>}</p>
                          <p className="text-gray-500">x{item.quantity}</p>
                        </div>
                        <p className="text-gray-300">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-700 pt-3 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span className="text-white">${cartTotal.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Shipping ({shippingZone === 'quebec' ? 'QC' : shippingZone === 'canada' ? 'Canada' : 'Intl.'})</span><span className="text-white">${shippingCost.toFixed(2)}</span></div>
                    <div className="flex justify-between text-base font-bold border-t border-gray-700 pt-2">
                      <span className="text-blue-400">Total</span><span className="text-blue-400">${orderTotal.toFixed(2)} CAD</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {loading ? (
              <div className="text-center text-gray-400 py-16">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="text-center text-gray-400 py-16">
                <Package size={48} className="mx-auto mb-4 text-gray-600" />
                <p className="text-lg">Products coming soon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="product-grid">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                ))}
              </div>
            )}

            <div className="max-w-3xl mx-auto mt-12 bg-black border border-blue-500/20 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Truck size={20} className="text-blue-400" /> Shipping Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-blue-400 font-bold mb-1">Montreal / Quebec</p>
                  <p className="text-white text-lg font-bold">$10.00 CAD</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-blue-400 font-bold mb-1">Rest of Canada</p>
                  <p className="text-white text-lg font-bold">$15.00 CAD</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-blue-400 font-bold mb-1">International</p>
                  <p className="text-white text-lg font-bold">$25.00 CAD</p>
                </div>
              </div>
              <p className="text-yellow-400 text-sm font-semibold mt-4 text-center">Please allow 4 weeks for delivery.</p>
            </div>
          </>
        )}

        {/* Cart Slide-out */}
        {showCart && (
          <div className="fixed inset-0 z-50" data-testid="cart-drawer">
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowCart(false)} />
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-gray-900 border-l border-blue-500/20 p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><ShoppingCart size={20} /> Cart ({cartCount})</h2>
                <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
              </div>

              {cart.length === 0 ? (
                <p className="text-gray-400 text-center py-12">Your cart is empty.</p>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex gap-3 bg-black/50 rounded-lg p-3" data-testid={`cart-item-${idx}`}>
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded" />
                        ) : (
                          <div className="w-16 h-16 bg-gray-800 rounded flex items-center justify-center"><Package size={24} className="text-gray-600" /></div>
                        )}
                        <div className="flex-1">
                          <p className="text-white text-sm font-semibold">{item.name}</p>
                          {item.size && <p className="text-gray-500 text-xs">Size: {item.size}</p>}
                          <p className="text-blue-400 text-sm font-bold">${item.price.toFixed(2)}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <button onClick={() => updateQuantity(idx, -1)} className="w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded text-white flex items-center justify-center text-xs"><Minus size={12} /></button>
                            <span className="text-white text-sm w-6 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(idx, 1)} className="w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded text-white flex items-center justify-center text-xs"><Plus size={12} /></button>
                            <button onClick={() => removeFromCart(idx)} className="ml-auto text-red-400 hover:text-red-300"><X size={16} /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex justify-between text-sm mb-1"><span className="text-gray-400">Subtotal</span><span className="text-white">${cartTotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm mb-3"><span className="text-gray-400">Shipping</span><span className="text-gray-400">Calculated at checkout</span></div>
                    <button
                      onClick={() => { setShowCart(false); setShowCheckout(true); }}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded flex items-center justify-center gap-2 transition-colors"
                      data-testid="proceed-checkout-btn"
                    >
                      Checkout <ChevronRight size={18} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


const ProductCard = ({ product, onAddToCart }) => {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const hasSizes = product.sizes && product.sizes.length > 0;

  return (
    <div className="bg-black border border-blue-500/20 rounded-lg overflow-hidden group" data-testid={`product-${product.id}`}>
      {product.imageUrl ? (
        <div className="aspect-square overflow-hidden">
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
      ) : (
        <div className="aspect-square bg-gradient-to-br from-blue-900/30 to-black flex items-center justify-center">
          <Package size={64} className="text-gray-700" />
        </div>
      )}
      <div className="p-4">
        <h3 className="text-white font-bold mb-1">{product.name}</h3>
        {product.description && <p className="text-gray-400 text-sm mb-3 whitespace-pre-line line-clamp-2">{product.description}</p>}
        <div className="flex items-end justify-between">
          <span className="text-xl font-bold text-blue-400">${product.price?.toFixed(2)}</span>
          <div className="flex items-center gap-2">
            {hasSizes && (
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                data-testid={`size-select-${product.id}`}
              >
                {product.sizes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            )}
            <button
              onClick={() => onAddToCart(product, selectedSize)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded transition-colors flex items-center gap-1"
              data-testid={`add-to-cart-${product.id}`}
            >
              <Plus size={16} /> Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
