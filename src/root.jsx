import React, { useState, useEffect, useContext, createContext } from 'react';

// --- MOCK DATA ---
const mockProducts = [
  {
    id: 1,
    name: 'Opulent Silk Blouse',
    category: 'Tops',
    price: 18500,
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Crafted from the finest mulberry silk, this blouse features a fluid drape and a subtle, elegant sheen. A timeless piece for any wardrobe.',
    details: ['100% Mulberry Silk', 'Mother of Pearl Buttons', 'Dry Clean Only', 'Made in Italy'],
    image: 'https://placehold.co/800x1200/1a1a1a/ffffff?text=Luxe+Blouse'
  },
  {
    id: 2,
    name: 'Prestige Wool Trousers',
    category: 'Bottoms',
    price: 27000,
    sizes: ['28', '30', '32', '34', '36'],
    description: 'Tailored from premium Italian wool, these trousers offer a flawless fit and exceptional comfort. The sharp crease and modern silhouette exude sophistication.',
    details: ['100% Italian Wool', 'Slim Fit', 'Horn Buttons', 'Unfinished Hem'],
    image: 'https://placehold.co/800x1200/f0f0f0/000000?text=Luxe+Trousers'
  },
  {
    id: 3,
    name: 'Elysian Cashmere Coat',
    category: 'Outerwear',
    price: 85000,
    sizes: ['S', 'M', 'L'],
    description: 'An exquisitely soft coat made from pure Mongolian cashmere. Its minimalist design and luxurious feel make it the ultimate statement of understated elegance.',
    details: ['100% Mongolian Cashmere', 'Hand-stitched Detailing', 'Satin Lining', 'Oversized Fit'],
    image: 'https://placehold.co/800x1200/333333/ffffff?text=Luxe+Coat'
  },
  {
    id: 4,
    name: 'Artisan Leather Loafers',
    category: 'Footwear',
    price: 35000,
    sizes: ['8', '9', '10', '11', '12'],
    description: 'Handcrafted by master artisans from supple calfskin leather. These loafers feature a classic silhouette with a modern twist, ensuring both comfort and style.',
    details: ['100% Calfskin Leather', 'Blake Stitch Construction', 'Leather Sole', 'Hand-burnished Finish'],
    image: 'https://placehold.co/800x1200/f5f5f5/000000?text=Luxe+Loafers'
  },
  {
    id: 5,
    name: 'Ascot Linen Shirt',
    category: 'Tops',
    price: 15000,
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'A breathable and effortlessly chic shirt woven from fine European linen. Perfect for warm climates and sophisticated layering.',
    details: ['100% European Linen', 'Regular Fit', 'Trochus Shell Buttons', 'Garment Washed for Softness'],
    image: 'https://placehold.co/800x1200/e0e0e0/000000?text=Luxe+Shirt'
  },
  {
    id: 6,
    name: 'Riviera Denim Jeans',
    category: 'Bottoms',
    price: 22000,
    sizes: ['28', '30', '32', '34', '36'],
    description: 'Elevated denim crafted from premium Japanese selvedge. The tailored cut and deep indigo wash offer a refined take on a classic staple.',
    details: ['100% Japanese Selvedge Denim', 'Slim Tapered Fit', 'Copper Rivets', 'Chain-stitched Hem'],
    image: 'https://placehold.co/800x1200/2a2a2a/ffffff?text=Luxe+Denim'
  },
];

// --- ICONS ---
const SunIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const CartIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const UserIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const MenuIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
  </svg>
);

const CloseIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// --- CONTEXTS for Global State Management ---
const ThemeContext = createContext();
const CartContext = createContext();
const AuthContext = createContext();
const PageContext = createContext();

// --- PROVIDERS ---
const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>{children}</ThemeContext.Provider>;
};

const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product, size, quantity) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id && item.size === size);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, { ...product, size, quantity }];
    });
  };

  const removeFromCart = (productId, size) => {
    setCartItems(prevItems => prevItems.filter(item => !(item.id === productId && item.size === size)));
  };

  const updateQuantity = (productId, size, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, size);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId && item.size === size
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // null if logged out, user object if logged in

  // Mock user object
  const mockUser = {
    name: 'Alex Mercer',
    email: 'alex.mercer@example.com',
    address: '123 Elysian Fields, Capital City',
    orders: [
      { id: 'ORD123', date: '2024-08-15', total: 45500, status: 'Shipped' },
      { id: 'ORD124', date: '2024-08-20', total: 85000, status: 'Delivered' },
    ]
  };

  const login = (email, password) => {
    console.log(`Logging in with ${email} and ${password}`);
    setUser(mockUser);
  };

  const logout = () => {
    setUser(null);
  };

  const signup = (name, email, password) => {
    console.log(`Signing up with ${name}, ${email}, ${password}`);
    setUser(mockUser); // auto-login after signup
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

const PageProvider = ({ children }) => {
  const [page, setPage] = useState({ name: 'home', data: null });

  const navigate = (name, data = null) => {
    setPage({ name, data });
    window.scrollTo(0, 0);
  };

  return <PageContext.Provider value={{ page, navigate }}>{children}</PageContext.Provider>;
};

// --- REUSABLE UI COMPONENTS ---
const ProductCard = ({ product }) => {
  const { navigate } = useContext(PageContext);
  return (
    <div onClick={() => navigate('product', { id: product.id })} className="group cursor-pointer">
      <div className="overflow-hidden bg-gray-100 dark:bg-gray-800/50 rounded-lg">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-auto object-cover aspect-[2/3] group-hover:scale-105 transition-transform duration-500 ease-in-out"
        />
      </div>
      <div className="mt-4 text-center">
        <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-amber-800 dark:group-hover:text-amber-600 transition-colors duration-300">
          {product.name}
        </h3>
        <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
          PKR {product.price.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

// --- LAYOUT COMPONENTS ---
const Navbar = () => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const { navigate } = useContext(PageContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', page: 'home' },
    { name: 'New Arrivals', page: 'home' },
    { name: 'Collections', page: 'home' },
    { name: 'About', page: 'home' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-sm shadow-sm">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(true)} className="text-gray-800 dark:text-gray-200">
              <MenuIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0">
            <a onClick={() => navigate('home')} className="text-2xl font-serif font-bold tracking-widest text-gray-900 dark:text-white cursor-pointer">
              LUXE
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navLinks.map(link => (
              <a key={link.name} onClick={() => navigate(link.page)} className="text-sm font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300 hover:text-amber-800 dark:hover:text-amber-600 transition-colors duration-300 cursor-pointer">
                {link.name}
              </a>
            ))}
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            <button onClick={toggleTheme} className="text-gray-600 dark:text-gray-300 hover:text-amber-800 dark:hover:text-amber-600 transition-colors duration-300">
              {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
            <button onClick={() => navigate(user ? 'profile' : 'login')} className="text-gray-600 dark:text-gray-300 hover:text-amber-800 dark:hover:text-amber-600 transition-colors duration-300">
              <UserIcon className="h-6 w-6" />
            </button>
            <button onClick={() => navigate('cart')} className="relative text-gray-600 dark:text-gray-300 hover:text-amber-800 dark:hover:text-amber-600 transition-colors duration-300">
              <CartIcon className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center h-5 w-5 bg-amber-700 text-white text-xs rounded-full">{cartCount}</span>
              )}
            </button>
          </div>
        </div>
      </nav>
      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-50 transform ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out md:hidden`}>
        <div className="fixed inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)}></div>
        <div className="relative w-4/5 max-w-xs h-full bg-white dark:bg-black p-6">
          <button onClick={() => setIsMenuOpen(false)} className="absolute top-5 right-5 text-gray-600 dark:text-gray-300">
            <CloseIcon className="h-6 w-6" />
          </button>
          <div className="mt-16 flex flex-col space-y-6">
            {navLinks.map(link => (
              <a key={link.name} onClick={() => { navigate(link.page); setIsMenuOpen(false); }} className="text-lg font-medium uppercase tracking-wider text-gray-800 dark:text-gray-200 cursor-pointer">
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

const Footer = () => (
  <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-lg font-serif font-semibold text-gray-900 dark:text-white tracking-wider">LUXE</h3>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Timeless elegance, modern luxury. Crafted for the discerning individual.</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-800 dark:text-gray-200">Shop</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-amber-800 dark:hover:text-amber-600">New Arrivals</a></li>
            <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-amber-800 dark:hover:text-amber-600">Collections</a></li>
            <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-amber-800 dark:hover:text-amber-600">Outerwear</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-800 dark:text-gray-200">Support</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-amber-800 dark:hover:text-amber-600">Contact Us</a></li>
            <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-amber-800 dark:hover:text-amber-600">FAQ</a></li>
            <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-amber-800 dark:hover:text-amber-600">Shipping & Returns</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-800 dark:text-gray-200">Newsletter</h4>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Subscribe for exclusive updates.</p>
          <form className="mt-4 flex">
            <input type="email" placeholder="Your email" className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-l-md focus:outline-none focus:ring-2 focus:ring-amber-700 text-sm" />
            <button type="submit" className="px-4 py-2 bg-amber-800 text-white rounded-r-md hover:bg-amber-900 transition-colors">
              &rarr;
            </button>
          </form>
        </div>
      </div>
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} LUXE Apparel. All Rights Reserved.</p>
      </div>
    </div>
  </footer>
);

// --- PAGE COMPONENTS ---
const HomePage = () => (
  <>
    {/* Hero Section */}
    <section className="relative h-[70vh] md:h-[90vh] bg-cover bg-center flex items-center" style={{ backgroundImage: "url('https://placehold.co/1920x1080/0a0a0a/ffffff?text=The+Art+of+Style')" }}>
      <div className="absolute inset-0 bg-black opacity-40"></div>
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-wider leading-tight">The Autumn Collection</h1>
        <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto">Discover pieces that blend timeless design with contemporary sensibilities.</p>
        <button className="mt-8 px-8 py-3 bg-white/20 backdrop-blur-sm border border-white text-white uppercase tracking-widest text-sm font-semibold hover:bg-white hover:text-black transition-colors duration-300 rounded-sm">
          Explore Now
        </button>
      </div>
    </section>

    {/* Product Grid */}
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-serif font-bold text-center text-gray-900 dark:text-white mb-12">Featured Pieces</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {mockProducts.slice(0, 3).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
    <section className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-serif font-bold text-center text-gray-900 dark:text-white mb-12">New Arrivals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {mockProducts.slice(3, 6).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  </>
);

const ProductPage = ({ id }) => {
  const { addToCart } = useContext(CartContext);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [notification, setNotification] = useState('');

  const product = mockProducts.find(p => p.id === id);

  if (!product) {
    return <div className="text-center py-20">Product not found.</div>;
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      setNotification('Please select a size.');
      setTimeout(() => setNotification(''), 3000);
      return;
    }
    addToCart(product, selectedSize, quantity);
    setNotification(`${product.name} added to cart!`);
    setTimeout(() => setNotification(''), 3000);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <img src={product.image} alt={product.name} className="w-full h-auto object-cover rounded-lg shadow-lg" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 dark:text-white">{product.name}</h1>
          <p className="mt-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">PKR {product.price.toLocaleString()}</p>
          <p className="mt-6 text-gray-600 dark:text-gray-400 leading-relaxed">{product.description}</p>

          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-200">Size</h3>
            <div className="flex flex-wrap gap-3 mt-4">
              {product.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-5 py-2 border rounded-md text-sm font-medium transition-colors duration-200 ${
                    selectedSize === size
                      ? 'bg-amber-800 text-white border-amber-800'
                      : 'bg-transparent border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center space-x-4">
            <button onClick={handleAddToCart} className="flex-1 px-8 py-4 bg-amber-800 text-white uppercase tracking-widest text-sm font-semibold hover:bg-amber-900 transition-colors duration-300 rounded-md disabled:opacity-50">
              Add to Cart
            </button>
          </div>

          {notification && (
            <div className="mt-4 text-center text-sm font-medium text-green-600 dark:text-green-400 transition-opacity duration-300">
              {notification}
            </div>
          )}

          <div className="mt-10">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-200">Details</h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
              {product.details.map(detail => <li key={detail}>{detail}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useContext(CartContext);
  const { navigate } = useContext(PageContext);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <h1 className="text-3xl font-serif font-bold text-center text-gray-900 dark:text-white mb-12">Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Your cart is empty.</p>
          <button onClick={() => navigate('home')} className="mt-6 px-6 py-3 bg-amber-800 text-white uppercase tracking-widest text-sm font-semibold hover:bg-amber-900 transition-colors duration-300 rounded-md">
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <ul className="divide-y divide-gray-200 dark:divide-gray-800">
              {cartItems.map(item => (
                <li key={`${item.id}-${item.size}`} className="flex py-6">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover object-center" />
                  </div>
                  <div className="ml-4 flex flex-1 flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white">
                        <h3>{item.name}</h3>
                        <p className="ml-4">PKR {item.price.toLocaleString()}</p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Size: {item.size}</p>
                    </div>
                    <div className="flex flex-1 items-end justify-between text-sm">
                      <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-md">
                        <button onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)} className="px-2 py-1">-</button>
                        <span className="px-3">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)} className="px-2 py-1">+</button>
                      </div>
                      <div className="flex">
                        <button onClick={() => removeFromCart(item.id, item.size)} type="button" className="font-medium text-amber-700 hover:text-amber-900 dark:text-amber-600 dark:hover:text-amber-500">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-1">
            <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 sticky top-24">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Order summary</h2>
              <div className="mt-6 flex justify-between text-base font-medium text-gray-900 dark:text-white">
                <p>Subtotal</p>
                <p>PKR {cartTotal.toLocaleString()}</p>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Shipping and taxes calculated at checkout.</p>
              <div className="mt-6">
                <button onClick={() => navigate('checkout')} className="w-full px-6 py-3 bg-amber-800 text-white uppercase tracking-widest text-sm font-semibold hover:bg-amber-900 transition-colors duration-300 rounded-md">
                  Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CheckoutPage = () => {
  const { cartItems, cartTotal, clearCart } = useContext(CartContext);
  const { navigate } = useContext(PageContext);
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null; // or a loading spinner
  }

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    console.log('Placing order...');
    clearCart();
    alert('Thank you for your order! Your purchase was successful.');
    navigate('home');
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <h1 className="text-3xl font-serif font-bold text-center text-gray-900 dark:text-white mb-12">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>
          <form className="space-y-4">
            <input type="text" placeholder="Full Name" className="w-full p-3 border rounded-md bg-transparent dark:border-gray-700 focus:ring-amber-700" />
            <input type="email" placeholder="Email" className="w-full p-3 border rounded-md bg-transparent dark:border-gray-700 focus:ring-amber-700" />
            <input type="text" placeholder="Address" className="w-full p-3 border rounded-md bg-transparent dark:border-gray-700 focus:ring-amber-700" />
            <div className="flex space-x-4">
              <input type="text" placeholder="City" className="w-full p-3 border rounded-md bg-transparent dark:border-gray-700 focus:ring-amber-700" />
              <input type="text" placeholder="Postal Code" className="w-full p-3 border rounded-md bg-transparent dark:border-gray-700 focus:ring-amber-700" />
            </div>
          </form>
          <h2 className="text-xl font-semibold mt-10 mb-6">Payment Details</h2>
          <form className="space-y-4">
            <input type="text" placeholder="Card Number" className="w-full p-3 border rounded-md bg-transparent dark:border-gray-700 focus:ring-amber-700" />
            <div className="flex space-x-4">
              <input type="text" placeholder="MM / YY" className="w-full p-3 border rounded-md bg-transparent dark:border-gray-700 focus:ring-amber-700" />
              <input type="text" placeholder="CVC" className="w-full p-3 border rounded-md bg-transparent dark:border-gray-700 focus:ring-amber-700" />
            </div>
          </form>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-lg">
          <h2 className="text-xl font-semibold mb-6">Your Order</h2>
          <ul className="space-y-4">
            {cartItems.map(item => (
              <li key={`${item.id}-${item.size}`} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.name} <span className="text-sm text-gray-500 dark:text-gray-400">x {item.quantity}</span></p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Size: {item.size}</p>
                </div>
                <p>PKR {(item.price * item.quantity).toLocaleString()}</p>
              </li>
            ))}
          </ul>
          <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>
          <div className="flex justify-between font-semibold text-lg">
            <p>Total</p>
            <p>PKR {cartTotal.toLocaleString()}</p>
          </div>
          <button onClick={handlePlaceOrder} className="mt-8 w-full px-6 py-4 bg-amber-800 text-white uppercase tracking-widest text-sm font-semibold hover:bg-amber-900 transition-colors duration-300 rounded-md">
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

const LoginPage = () => {
  const { login, signup } = useContext(AuthContext);
  const { navigate } = useContext(PageContext);
  const [isLoginView, setIsLoginView] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoginView) {
      login(email, password);
    } else {
      signup(name, email, password);
    }
    navigate('profile');
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] py-12">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-serif font-bold text-center text-gray-900 dark:text-white">{isLoginView ? 'Login' : 'Sign Up'}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLoginView && (
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" required className="w-full p-3 border rounded-md bg-transparent dark:border-gray-700 focus:ring-amber-700" />
          )}
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" required className="w-full p-3 border rounded-md bg-transparent dark:border-gray-700 focus:ring-amber-700" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="w-full p-3 border rounded-md bg-transparent dark:border-gray-700 focus:ring-amber-700" />
          <button type="submit" className="w-full px-6 py-3 bg-amber-800 text-white uppercase tracking-widest text-sm font-semibold hover:bg-amber-900 transition-colors duration-300 rounded-md">
            {isLoginView ? 'Login' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-sm">
          {isLoginView ? "Don't have an account?" : "Already have an account?"}
          <button onClick={() => setIsLoginView(!isLoginView)} className="ml-2 font-medium text-amber-700 hover:text-amber-900 dark:text-amber-600 dark:hover:text-amber-500">
            {isLoginView ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const { navigate } = useContext(PageContext);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !user) {
    return null; // or a loading spinner
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <h1 className="text-3xl font-serif font-bold text-center text-gray-900 dark:text-white mb-12">My Profile</h1>
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Account Details</h2>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Address:</strong> {user.address}</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Order History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {user.orders.map(order => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">PKR {order.total.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            navigate('home');
          }}
          className="mt-8 w-full sm:w-auto px-6 py-3 bg-red-700 text-white uppercase tracking-widest text-sm font-semibold hover:bg-red-800 transition-colors duration-300 rounded-md"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

// --- Main App Component ---
function App() {
  const { page } = useContext(PageContext);

  const renderPage = () => {
    switch (page.name) {
      case 'home':
        return <HomePage />;
      case 'product':
        return <ProductPage id={page.data.id} />;
      case 'cart':
        return <CartPage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'login':
        return <LoginPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="bg-white dark:bg-black text-gray-800 dark:text-gray-200 font-sans transition-colors duration-300">
      <Navbar />
      <main>
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
}

// --- Root Component with Providers ---
export default function Root() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <PageProvider>
            <App />
          </PageProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}