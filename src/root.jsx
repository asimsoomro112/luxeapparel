import React, { useState, useEffect, useContext, createContext } from 'react';
import { db, auth, googleProvider } from './firebase';
import { collection, getDocs, addDoc, setDoc, doc, query, orderBy, limit, where } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';

// --- ICONS ---
const SunIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const CartIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const UserIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const MenuIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
  </svg>
);

const CloseIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// --- CONTEXTS ---
const ThemeContext = createContext();
const CartContext = createContext();
const AuthContext = createContext();

// --- PROVIDERS ---
const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          const basicUser = {
            uid: currentUser.uid,
            name: currentUser.displayName || currentUser.email.split('@')[0],
            email: currentUser.email,
            address: 'Not set',
            orders: []
          };
          setUser(basicUser);

          // Async operations that don't block user setting
          setDoc(doc(db, 'users', currentUser.uid), {
            name: currentUser.displayName || currentUser.email.split('@')[0],
            email: currentUser.email,
            address: currentUser.address || 'Not set',
            joined: new Date().toISOString().split('T')[0]
          }, { merge: true }).catch(error => {
            console.error('Error setting user doc:', error);
          });

          getDocs(collection(db, `users/${currentUser.uid}/orders`)).then(ordersSnapshot => {
            const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUser(prev => ({ ...prev, orders }));
          }).catch(error => {
            console.error('Error fetching orders:', error);
            setUser(prev => ({ ...prev, orders: [] }));
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const signup = async (name, email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name,
        email,
        address: 'Not set',
        joined: new Date().toISOString().split('T')[0]
      });
      return true;
    } catch (error) {
      console.error('Signup error:', error.message);
      return false;
    }
  };

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error('Login error:', error.message);
      return false;
    }
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      return true;
    } catch (error) {
      console.error('Google login error:', error.message);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, loginWithGoogle, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- REUSABLE UI COMPONENTS ---
const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate(`/product/${product.id}`)} className="group cursor-pointer">
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

// --- PAGE COMPONENTS ---
const HomePage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again.');
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-800 dark:text-gray-200">Loading...</div>;
  if (error) return <div className="text-center py-20 text-red-600">{error}</div>;

  return (
    <>
      <section className="relative h-[70vh] md:h-[90vh] bg-cover bg-center flex items-center" style={{ backgroundImage: "url('https://placehold.co/1920x1080/0a0a0a/ffffff?text=The+Art+of+Style')" }}>
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-wider leading-tight">The Autumn Collection</h1>
          <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto">Discover pieces that blend timeless design with contemporary sensibilities.</p>
          <button onClick={() => navigate('/shop')} className="mt-8 px-8 py-3 bg-white/20 backdrop-blur-sm border border-white text-white uppercase tracking-widest text-sm font-semibold hover:bg-white hover:text-black transition-colors duration-300 rounded-sm">
            Explore Now
          </button>
        </div>
      </section>
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold text-center text-gray-900 dark:text-white mb-12">Featured Pieces</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {products.slice(0, 3).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

const ShopPage = () => {
  const location = useLocation();
  const category = new URLSearchParams(location.search).get('category');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let q = collection(db, 'products');
        if (category) {
          q = query(collection(db, 'products'), where('category', '==', category));
        }
        const querySnapshot = await getDocs(q);
        const productList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again.');
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category]);

  if (loading) return <div className="text-center py-20 text-gray-800 dark:text-gray-200">Loading...</div>;
  if (error) return <div className="text-center py-20 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <h1 className="text-3xl font-serif font-bold text-center text-gray-900 dark:text-white mb-12">Shop {category ? ` - ${category}` : 'All'}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

const NewArrivalsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(6));
        const querySnapshot = await getDocs(q);
        const productList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching new arrivals:', error);
        setError('Failed to load new arrivals. Please try again.');
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-800 dark:text-gray-200">Loading...</div>;
  if (error) return <div className="text-center py-20 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <h1 className="text-3xl font-serif font-bold text-center text-gray-900 dark:text-white mb-12">New Arrivals</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

const CategoriesPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const uniqueCategories = [...new Set(products.map(product => product.category).filter(Boolean))];
        setCategories(uniqueCategories);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories. Please try again.');
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-800 dark:text-gray-200">Loading...</div>;
  if (error) return <div className="text-center py-20 text-red-600">{error}</div>;
  if (categories.length === 0) return <div className="text-center py-20 text-gray-800 dark:text-gray-200">No categories found.</div>;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <h1 className="text-3xl font-serif font-bold text-center text-gray-900 dark:text-white mb-12">Categories</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
        {categories.map(category => (
          <div
            key={category}
            onClick={() => navigate(`/shop?category=${encodeURIComponent(category)}`)}
            className="group cursor-pointer"
          >
            <div className="overflow-hidden bg-gray-100 dark:bg-gray-800/50 rounded-lg">
              <img
                src={`https://placehold.co/400x600/amber-100/gray-800?text=${encodeURIComponent(category)}`}
                alt={category}
                className="w-full h-auto object-cover aspect-[2/3] group-hover:scale-105 transition-transform duration-500 ease-in-out"
              />
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-amber-800 dark:group-hover:text-amber-600 transition-colors duration-300">
                {category}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CollectionsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), orderBy('category'));
        const querySnapshot = await getDocs(q);
        const productList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching collections:', error);
        setError('Failed to load collections. Please try again.');
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-800 dark:text-gray-200">Loading...</div>;
  if (error) return <div className="text-center py-20 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <h1 className="text-3xl font-serif font-bold text-center text-gray-900 dark:text-white mb-12">Collections</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

const ProductPage = () => {
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [notification, setNotification] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const foundProduct = querySnapshot.docs.find(doc => doc.id === id);
        if (foundProduct) {
          setProduct({ id: foundProduct.id, ...foundProduct.data() });
        } else {
          setError('Product not found.');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Failed to load product. Please try again.');
        setLoading(false);
      }
    };
    if (id) {
      fetchProduct();
    } else {
      setError('Invalid product ID.');
      setLoading(false);
    }
  }, [id]);

  if (loading) return <div className="text-center py-20 text-gray-800 dark:text-gray-200">Loading...</div>;
  if (error || !product) return <div className="text-center py-20 text-red-600">{error || 'Product not found.'}</div>;

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
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-amber-800 dark:hover:text-amber-600"
      >
        &larr; Back
      </button>
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
              {product.sizes?.map(size => (
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
              )) || <p className="text-gray-500">No sizes available</p>}
            </div>
          </div>
          <div className="mt-8 flex items-center space-x-4">
            <button onClick={handleAddToCart} className="flex-1 px-8 py-4 bg-amber-800 text-white uppercase tracking-widest text-sm font-semibold hover:bg-amber-900 transition-colors duration-300 rounded-md">
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
              {product.details?.map(detail => <li key={detail}>{detail}</li>) || <li>No details available</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useContext(CartContext);
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <h1 className="text-3xl font-serif font-bold text-center text-gray-900 dark:text-white mb-12">Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Your cart is empty.</p>
          <button onClick={() => navigate('/shop')} className="mt-6 px-6 py-3 bg-amber-800 text-white uppercase tracking-widest text-sm font-semibold hover:bg-amber-900 transition-colors duration-300 rounded-md">
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
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Order Summary</h2>
              <div className="mt-6 flex justify-between text-base font-medium text-gray-900 dark:text-white">
                <p>Subtotal</p>
                <p>PKR {cartTotal.toLocaleString()}</p>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Shipping and taxes calculated at checkout.</p>
              <div className="mt-6">
                <button onClick={() => navigate('/checkout')} className="w-full px-6 py-3 bg-amber-800 text-white uppercase tracking-widest text-sm font-semibold hover:bg-amber-900 transition-colors duration-300 rounded-md">
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
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    address: user?.address || '',
    city: '',
    postalCode: '',
    cardNumber: '',
    expiry: '',
    cvc: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { state: { redirect: '/checkout' } });
    }
  }, [user, authLoading, navigate]);

  if (authLoading) return <div className="text-center py-20 text-gray-800 dark:text-gray-200">Loading...</div>;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please log in to place an order.');
      return;
    }
    try {
      const orderRef = await addDoc(collection(db, `users/${user.uid}/orders`), {
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          size: item.size,
          quantity: item.quantity,
          price: item.price
        })),
        total: cartTotal,
        status: 'Processing',
        date: new Date().toISOString(),
        customerEmail: user.email,
        shipping: formData
      });
      await addDoc(collection(db, 'orders'), {
        id: orderRef.id,
        customerEmail: user.email,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          size: item.size,
          quantity: item.quantity,
          price: item.price
        })),
        total: cartTotal,
        status: 'Processing',
        date: new Date().toISOString(),
        shipping: formData
      });
      clearCart();
      alert('Thank you for your order! Your purchase was successful.');
      navigate('/');
    } catch (error) {
      console.error('Error placing order:', error);
      setError('Failed to place order. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <h1 className="text-3xl font-serif font-bold text-center text-gray-900 dark:text-white mb-12">Checkout</h1>
      {error && <p className="text-center text-red-600 mb-6">{error}</p>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Shipping Information</h2>
          <form className="space-y-4" onSubmit={handlePlaceOrder}>
            <input name="fullName" value={formData.fullName} onChange={handleInputChange} type="text" placeholder="Full Name" required className="w-full p-3 border rounded-md bg-transparent dark:border-gray-700 focus:ring-amber-700 text-gray-800 dark:text-gray-200" />
            <input name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="Email" required className="w-full p-3 border rounded-md bg-transparent dark:border-gray-700 focus:ring-amber-700 text-gray-800 dark:text-gray-200" />
            <input name="address" value={formData.address} onChange={handleInputChange} type="text" placeholder="Address" required className="w-full p-3 border rounded-md bg-transparent dark:border-gray-700 focus:ring-amber-700 text-gray-800 dark:text-gray-200" />
            <div className="flex space-x-4">
              <input name="city" value={formData.city} onChange={handleInputChange} type="text" placeholder="City" required className="flex-1 p-3 border rounded-md bg-transparent dark:border-gray-700 focus:ring-amber-700 text-gray-800 dark:text-gray-200" />
              <input name="postalCode" value={formData.postalCode} onChange={handleInputChange} type="text" placeholder="Postal Code" required className="flex-1 p-3 border rounded-md bg-transparent dark:border-gray-700 focus:ring-amber-700 text-gray-800 dark:text-gray-200" />
            </div>
          </form>
          <h2 className="text-xl font-semibold mt-10 mb-6 text-gray-900 dark:text-white">Payment Details</h2>
          <form className="space-y-4">
            <input name="cardNumber" value={formData.cardNumber} onChange={handleInputChange} type="text" placeholder="Card Number" required className="w-full p-3 border rounded-md bg-transparent dark:border-gray-700 focus:ring-amber-700 text-gray-800 dark:text-gray-200" />
            <div className="flex space-x-4">
              <input name="expiry" value={formData.expiry} onChange={handleInputChange} type="text" placeholder="MM / YY" required className="flex-1 p-3 border rounded-md bg-transparent dark:border-gray-700 focus:ring-amber-700 text-gray-800 dark:text-gray-200" />
              <input name="cvc" value={formData.cvc} onChange={handleInputChange} type="text" placeholder="CVC" required className="flex-1 p-3 border rounded-md bg-transparent dark:border-gray-700 focus:ring-amber-700 text-gray-800 dark:text-gray-200" />
            </div>
          </form>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-lg">
          <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Your Order</h2>
          <ul className="space-y-4">
            {cartItems.map(item => (
              <li key={`${item.id}-${item.size}`} className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{item.name} <span className="text-sm text-gray-500 dark:text-gray-400">x {item.quantity}</span></p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Size: {item.size}</p>
                </div>
                <p className="text-gray-900 dark:text-white">PKR {(item.price * item.quantity).toLocaleString()}</p>
              </li>
            ))}
          </ul>
          <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>
          <div className="flex justify-between font-semibold text-lg text-gray-900 dark:text-white">
            <p>Total</p>
            <p>PKR {cartTotal.toLocaleString()}</p>
          </div>
          <button onClick={handlePlaceOrder} type="submit" className="mt-8 w-full px-6 py-4 bg-amber-800 text-white uppercase tracking-widest text-sm font-semibold hover:bg-amber-900 transition-colors duration-300 rounded-md">
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

const LoginPage = () => {
  const { login, signup, loginWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoginView, setIsLoginView] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLoginView) {
        const success = await login(email, password);
        if (success) {
          const redirect = location.state?.redirect || '/';
          navigate(redirect);
        } else {
          setError('Invalid email or password.');
        }
      } else {
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          return;
        }
        const success = await signup(name, email, password);
        if (success) {
          const redirect = location.state?.redirect || '/';
          navigate(redirect);
        } else {
          setError('Failed to create account. Try a different email.');
        }
      }
    } catch (error) {
      setError(error.message || 'An error occurred.');
      console.error('Auth error:', error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const success = await loginWithGoogle();
      if (success) {
        const redirect = location.state?.redirect || '/';
        navigate(redirect);
      } else {
        setError('Google login failed.');
      }
    } catch (error) {
      setError(error.message || 'Google login failed.');
      console.error('Google login error:', error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] py-12 bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-serif font-bold text-center text-gray-900 dark:text-white">{isLoginView ? 'Login' : 'Sign Up'}</h1>
        {error && <p className="text-center text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLoginView && (
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Full Name"
              required
              className="w-full p-3 border rounded-md bg-transparent border-gray-300 dark:border-gray-700 focus:ring-amber-700 text-gray-800 dark:text-gray-200"
            />
          )}
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email Address"
            required
            className="w-full p-3 border rounded-md bg-transparent border-gray-300 dark:border-gray-700 focus:ring-amber-700 text-gray-800 dark:text-gray-200"
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full p-3 border rounded-md bg-transparent border-gray-300 dark:border-gray-700 focus:ring-amber-700 text-gray-800 dark:text-gray-200"
          />
          {!isLoginView && (
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              required
              className="w-full p-3 border rounded-md bg-transparent border-gray-300 dark:border-gray-700 focus:ring-amber-700 text-gray-800 dark:text-gray-200"
            />
          )}
          <button
            type="submit"
            className="w-full px-6 py-3 bg-amber-800 text-white uppercase tracking-widest text-sm font-semibold hover:bg-amber-900 transition-colors duration-300 rounded-md"
          >
            {isLoginView ? 'Login' : 'Create Account'}
          </button>
        </form>
        <button
          onClick={handleGoogleLogin}
          className="w-full px-6 py-3 bg-gray-700 text-white uppercase tracking-widest text-sm font-semibold hover:bg-gray-800 transition-colors duration-300 rounded-md"
        >
          Login with Google
        </button>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          {isLoginView ? "Don't have an account?" : "Already have an account?"}
          <button type="button" onClick={() => setIsLoginView(!isLoginView)} className="ml-2 font-medium text-amber-700 hover:text-amber-900 dark:text-amber-600 dark:hover:text-amber-500">
            {isLoginView ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { user, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) return <div className="text-center py-20 text-gray-800 dark:text-gray-200">Loading...</div>;
  if (!user) return <div className="text-center py-20 text-red-600">Please log in to view your profile.</div>;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <h1 className="text-3xl font-serif font-bold text-center text-gray-900 dark:text-white mb-12">My Profile</h1>
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Account Details</h2>
          <p className="text-gray-800 dark:text-gray-200"><strong>Name:</strong> {user.name}</p>
          <p className="text-gray-800 dark:text-gray-200"><strong>Email:</strong> {user.email}</p>
          <p className="text-gray-800 dark:text-gray-200"><strong>Address:</strong> {user.address}</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Order History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {user.orders && user.orders.length > 0 ? (
                  user.orders.map(order => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-gray-200">{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-gray-200">{order.date?.split('T')[0] || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-gray-200">PKR {order.total?.toLocaleString() || '0'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-gray-200">{order.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No orders yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="mt-8 w-full sm:w-auto px-6 py-3 bg-red-700 text-white uppercase tracking-widest text-sm font-semibold hover:bg-red-800 transition-colors duration-300 rounded-md"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

// --- NAVIGATION ---
const Navbar = () => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { user, loading } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'New Arrivals', path: '/new-arrivals' },
    { name: 'Categories', path: '/categories' },
    { name: 'Collections', path: '/collections' },
  ];

  if (loading) return <div className="text-center py-20 text-gray-800 dark:text-gray-200">Loading...</div>;

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-sm shadow-sm">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(true)} className="text-gray-800 dark:text-gray-200 hover:text-amber-800 dark:hover:text-amber-600">
              <MenuIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-shrink-0">
            <a onClick={() => navigate('/')} className="text-2xl font-serif font-bold tracking-widest text-gray-900 dark:text-white cursor-pointer">
              LUXE
            </a>
          </div>
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navLinks.map(link => (
              <a
                key={link.name}
                onClick={() => navigate(link.path)}
                className="text-sm font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300 hover:text-amber-800 dark:hover:text-amber-600 transition-colors duration-300 cursor-pointer"
              >
                {link.name}
              </a>
            ))}
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={toggleTheme} className="text-gray-600 dark:text-gray-300 hover:text-amber-800 dark:hover:text-amber-600 transition-colors duration-300">
              {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
            <button onClick={() => navigate(user ? '/profile' : '/login')} className="text-gray-600 dark:text-gray-300 hover:text-amber-800 dark:hover:text-amber-600 transition-colors duration-300 relative">
              <UserIcon className="h-6 w-6" />
              {user && <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>}
            </button>
            <button onClick={() => navigate('/cart')} className="relative text-gray-600 dark:text-gray-300 hover:text-amber-800 dark:hover:text-amber-600 transition-colors duration-300">
              <CartIcon className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center h-5 w-5 bg-amber-700 text-white text-xs rounded-full">{cartCount}</span>
              )}
            </button>
          </div>
        </div>
      </nav>
      <div className={`fixed inset-0 z-50 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:hidden bg-white dark:bg-black`}>
        <div className="relative w-4/5 max-w-xs h-full p-6">
          <button onClick={() => setIsMenuOpen(false)} className="absolute top-5 right-5 text-gray-800 dark:text-gray-200 hover:text-amber-800 dark:hover:text-amber-600">
            <CloseIcon className="h-6 w-6" />
          </button>
          <div className="mt-16 flex flex-col space-y-6">
            {navLinks.map(link => (
              <a
                key={link.name}
                onClick={() => { navigate(link.path); setIsMenuOpen(false); }}
                className="text-lg font-medium uppercase tracking-wider text-gray-800 dark:text-gray-200 hover:text-amber-800 dark:hover:text-amber-600 cursor-pointer"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              {user ? (
                <button
                  onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}
                  className="text-lg font-medium text-gray-800 dark:text-gray-200 hover:text-amber-800 dark:hover:text-amber-600"
                >
                  Profile
                </button>
              ) : (
                <button
                  onClick={() => { navigate('/login'); setIsMenuOpen(false); }}
                  className="text-lg font-medium text-gray-800 dark:text-gray-200 hover:text-amber-800 dark:hover:text-amber-600"
                >
                  Login
                </button>
              )}
            </div>
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
            <li><a href="/new-arrivals" className="text-gray-600 dark:text-gray-400 hover:text-amber-800 dark:hover:text-amber-600">New Arrivals</a></li>
            <li><a href="/collections" className="text-gray-600 dark:text-gray-400 hover:text-amber-800 dark:hover:text-amber-600">Collections</a></li>
            <li><a href="/categories" className="text-gray-600 dark:text-gray-400 hover:text-amber-800 dark:hover:text-amber-600">Categories</a></li>
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
          <div className="mt-4 flex">
            <input type="email" placeholder="Your email" className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-l-md focus:outline-none focus:ring-2 focus:ring-amber-700 text-sm text-gray-800 dark:text-gray-200" />
            <button type="button" className="px-4 py-2 bg-amber-800 text-white rounded-r-md hover:bg-amber-900 transition-colors">
              &rarr;
            </button>
          </div>
        </div>
      </div>
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} LUXE Apparel. All Rights Reserved.</p>
      </div>
    </div>
  </footer>
);

// --- Main App Component ---
function App() {
  return (
    <div className="bg-white dark:bg-black text-gray-800 dark:text-gray-200 font-sans transition-colors duration-300 min-h-screen">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/new-arrivals" element={<NewArrivalsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

// --- Root Component ---
export default function Root() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}