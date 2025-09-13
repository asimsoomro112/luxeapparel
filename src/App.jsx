import React, { useState, useEffect, useContext, createContext } from 'react';
import { db, auth, googleProvider } from './firebase';
import { collection, getDocs, getDoc, addDoc, setDoc, doc, query, orderBy, limit, where, onSnapshot } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- Spinner CSS ---
const spinnerStyles = `
  .loader {
    transform: rotateZ(45deg);
    perspective: 1000px;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    color: #fff;
  }
  .loader:before,
  .loader:after {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: inherit;
    height: inherit;
    border-radius: 50%;
    transform: rotateX(70deg);
    animation: 1s spin linear infinite;
  }
  .loader:after {
    color: #FF3D00;
    transform: rotateY(70deg);
    animation-delay: .4s;
  }
  @keyframes rotate {
    0% {
      transform: translate(-50%, -50%) rotateZ(0deg);
    }
    100% {
      transform: translate(-50%, -50%) rotateZ(360deg);
    }
  }
  @keyframes rotateccw {
    0% {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    100% {
      transform: translate(-50%, -50%) rotate(-360deg);
    }
  }
  @keyframes spin {
    0%,
    100% {
      box-shadow: .2em 0px 0 0px currentcolor;
    }
    12% {
      box-shadow: .2em .2em 0 0 currentcolor;
    }
    25% {
      box-shadow: 0 .2em 0 0px currentcolor;
    }
    37% {
      box-shadow: -.2em .2em 0 0 currentcolor;
    }
    50% {
      box-shadow: -.2em 0 0 0 currentcolor;
    }
    62% {
      box-shadow: -.2em -.2em 0 0 currentcolor;
    }
    75% {
      box-shadow: 0px -.2em 0 0 currentcolor;
    }
    87% {
      box-shadow: .2em -.2em 0 0 currentcolor;
    }
  }
`;

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
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item
        );
      }
      return [...prevItems, { ...product, size, quantity: Math.min(quantity, product.stock) }];
    });
    toast.success(`${product.name} (Size: ${size}) added to cart!`);
  };

  const removeFromCart = (productId, size) => {
    setCartItems(prevItems => prevItems.filter(item => !(item.id === productId && item.size === size)));
    toast.success('Item removed from cart!');
  };

  const updateQuantity = (productId, size, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, size);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId && item.size === size
            ? { ...item, quantity: Math.min(newQuantity, item.stock || Infinity) }
            : item
        )
      );
      toast.success('Quantity updated!');
    }
  };

  const clearCart = () => {
    setCartItems([]);
    toast.success('Cart cleared!');
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
      console.log('onAuthStateChanged triggered:', { currentUser: currentUser ? { email: currentUser.email, uid: currentUser.uid } : null });
      try {
        if (currentUser) {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          const userData = userDoc.exists() ? userDoc.data() : {};
          const ordersSnapshot = await getDocs(collection(db, `users/${currentUser.uid}/orders`));
          const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setUser({
            uid: currentUser.uid,
            name: currentUser.displayName || currentUser.email.split('@')[0],
            email: currentUser.email,
            address: userData.address || 'Not set',
            image: userData.image || '',
            joined: userData.joined || new Date().toISOString().split('T')[0],
            orders
          });
          console.log('User set:', { uid: currentUser.uid, email: currentUser.email });
        } else {
          setUser(null);
          console.log('No user authenticated');
        }
      } catch (error) {
        console.error('Auth state change error:', error.code, error.message);
        toast.error('Error loading user data.');
        setUser(null);
      } finally {
        setLoading(false);
        console.log('Auth loading complete:', { loading: false, user: user ? { email: user.email } : null });
      }
    }, (error) => {
      console.error('onAuthStateChanged error:', error.code, error.message);
      toast.error('Authentication error occurred.');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signup = async (name, email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        id: userCredential.user.uid,
        name,
        email,
        address: 'Not set',
        image: '',
        joined: new Date().toISOString().split('T')[0]
      });
      console.log('User created in Firestore:', { id: userCredential.user.uid, email, name });
      toast.success('Account created successfully!');
      return true;
    } catch (error) {
      console.error('Signup error:', error.code, error.message);
      toast.error(`Signup failed: ${error.message}`);
      return false;
    }
  };

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful:', email);
      toast.success('Logged in successfully!');
      return true;
    } catch (error) {
      console.error('Login error:', error.code, error.message);
      toast.error(`Login failed: ${error.message}`);
      return false;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        id: userCredential.user.uid,
        name: userCredential.user.displayName || userCredential.user.email.split('@')[0],
        email: userCredential.user.email,
        address: 'Not set',
        image: userCredential.user.photoURL || '',
        joined: new Date().toISOString().split('T')[0]
      }, { merge: true });
      console.log('Google login successful:', userCredential.user.email);
      toast.success('Logged in with Google!');
      return true;
    } catch (error) {
      console.error('Google login error:', error.code, error.message);
      toast.error(`Google login failed: ${error.message}`);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      console.log('User logged out');
      toast.success('Logged out successfully!');
    } catch (error) {
      console.error('Logout error:', error.code, error.message);
      toast.error('Logout failed.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, loginWithGoogle, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- PROTECTED ROUTE ---
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-gray-100 dark:bg-gray-900">
        <div className="loader"></div>
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute: Redirecting to /login from', location.pathname);
    return <Navigate to="/login" state={{ redirect: location.pathname }} replace />;
  }

  return children;
};

// --- REUSABLE UI COMPONENTS ---
const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate(`/product/${product.id}`)} className="group cursor-pointer">
      <div className="overflow-hidden bg-gray-100 dark:bg-gray-800/50 rounded-lg">
        <img
          src={product.image || 'https://placehold.co/400x600/0a0a0a/ffffff?text=Product'}
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

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      const productList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Products fetched:', productList.length);
      setProducts(productList);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching products:', error.code, error.message);
      toast.error('Failed to load products.');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-gray-100 dark:bg-gray-900">
        <div className="loader"></div>
      </div>
    );
  }

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
  const { search } = useLocation();
  const category = new URLSearchParams(search).get('category');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = collection(db, 'products');
    if (category) {
      q = query(collection(db, 'products'), where('category', '==', category));
    }
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Products fetched:', productList.length);
      setProducts(productList);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching products:', error.code, error.message);
      toast.error('Failed to load products.');
      setLoading(false);
    });
    return () => unsubscribe();
  }, [category]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-gray-100 dark:bg-gray-900">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <h1 className="text-3xl font-serif font-bold text-center text-gray-900 dark:text-white mb-12">Shop {category || 'All'}</h1>
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

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(6));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('New arrivals fetched:', productList.length);
      setProducts(productList);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching new arrivals:', error.code, error.message);
      toast.error('Failed to load new arrivals.');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-gray-100 dark:bg-gray-900">
        <div className="loader"></div>
      </div>
    );
  }

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

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const categoryList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Categories fetched:', categoryList);
      setCategories(categoryList.length > 0 ? categoryList : [...new Set(snapshot.docs.map(doc => doc.data().name))]);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching categories:', error.code, error.message);
      toast.error('Failed to load categories.');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-gray-100 dark:bg-gray-900">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <h1 className="text-3xl font-serif font-bold text-center text-gray-900 dark:text-white mb-12">Categories</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
        {categories.map(category => (
          <div
            key={typeof category === 'string' ? category : category.id}
            onClick={() => navigate(`/shop?category=${encodeURIComponent(typeof category === 'string' ? category : category.name)}`)}
            className="group cursor-pointer"
          >
            <div className="overflow-hidden bg-gray-100 dark:bg-gray-800/50 rounded-lg">
              <img
                src={typeof category === 'string' ? `https://placehold.co/400x600/0a0a0a/ffffff?text=${encodeURIComponent(category)}` : category.image || 'https://placehold.co/400x600/0a0a0a/ffffff?text=Category'}
                alt={typeof category === 'string' ? category : category.name}
                className="w-full h-auto object-cover aspect-[2/3] group-hover:scale-105 transition-transform duration-500 ease-in-out"
              />
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-amber-800 dark:group-hover:text-amber-600 transition-colors duration-300">
                {typeof category === 'string' ? category : category.name}
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

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('category'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Collections fetched:', productList.length);
      setProducts(productList);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching collections:', error.code, error.message);
      toast.error('Failed to load collections.');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-gray-100 dark:bg-gray-900">
        <div className="loader"></div>
      </div>
    );
  }

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'products', id), (docSnapshot) => {
      if (docSnapshot.exists()) {
        setProduct({ id: docSnapshot.id, ...docSnapshot.data() });
        console.log('Product fetched:', { id: docSnapshot.id });
      } else {
        toast.error('Product not found.');
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching product:', error.code, error.message);
      toast.error('Failed to load product.');
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-gray-100 dark:bg-gray-900">
        <div className="loader"></div>
      </div>
    );
  }
  if (!product) return <div className="text-center py-20 text-red-600">Product not found.</div>;

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size.');
      return;
    }
    if (quantity > product.stock) {
      toast.error('Requested quantity exceeds available stock.');
      return;
    }
    addToCart(product, selectedSize, quantity);
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
          <img src={product.image || 'https://placehold.co/600x800/0a0a0a/ffffff?text=Product'} alt={product.name} className="w-full h-auto object-cover rounded-lg shadow-lg" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 dark:text-white">{product.name}</h1>
          <p className="mt-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">PKR {product.price.toLocaleString()}</p>
          <p className="mt-6 text-gray-600 dark:text-gray-400 leading-relaxed">{product.description}</p>
          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-200">Size</h3>
            <div className="flex flex-wrap gap-3 mt-4">
              {(product.sizes || []).map(size => (
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
          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-200">Quantity</h3>
            <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-md w-32 mt-4">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2">-</button>
              <span className="px-3 text-gray-800 dark:text-gray-200">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2">+</button>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Stock: {product.stock}</p>
          </div>
          <div className="mt-8 flex items-center space-x-4">
            <button onClick={handleAddToCart} className="flex-1 px-8 py-4 bg-amber-800 text-white uppercase tracking-widest text-sm font-semibold hover:bg-amber-900 transition-colors duration-300 rounded-md">
              Add to Cart
            </button>
          </div>
          <div className="mt-10">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-200">Details</h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
              {(product.details || []).map(detail => <li key={detail}>{detail}</li>)}
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
                    <img src={item.image || 'https://placehold.co/100x100/0a0a0a/ffffff?text=Product'} alt={item.name} className="h-full w-full object-cover object-center" />
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
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    address: user?.address || '',
    city: '',
    postalCode: '',
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    // Validate form fields
    if (!formData.fullName || !formData.email || !formData.address || !formData.city || !formData.postalCode) {
      toast.error('Please fill in all required fields.');
      setSubmitLoading(false);
      return;
    }

    if (!cartItems.length) {
      toast.error('Cart is empty. Please add items before placing an order.');
      setSubmitLoading(false);
      return;
    }

    // Validate stock for each item
    try {
      for (const item of cartItems) {
        const productDoc = await getDoc(doc(db, 'products', item.id));
        if (!productDoc.exists()) {
          toast.error(`Product ${item.name} no longer exists.`);
          setSubmitLoading(false);
          return;
        }
        const productData = productDoc.data();
        if (item.quantity > productData.stock) {
          toast.error(`Requested quantity for ${item.name} exceeds available stock (${productData.stock}).`);
          setSubmitLoading(false);
          return;
        }
      }

      // Place order
      const orderRef = await addDoc(collection(db, `users/${user.uid}/orders`), {
        id: doc(collection(db, 'orders')).id,
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
        shipping: formData,
        paymentMethod: 'Cash on Delivery'
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
        shipping: formData,
        paymentMethod: 'Cash on Delivery'
      });

      console.log('Order created:', { id: orderRef.id, customerEmail: user.email, total: cartTotal });
      clearCart();
      toast.success('Thank you for your order! Your purchase was successful.');
      navigate('/profile');
    } catch (error) {
      console.error('Error placing order:', {
        code: error.code,
        message: error.message,
        details: error.details || 'No additional details'
      });
      let errorMessage = 'Failed to place order. Please try again.';
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Check Firebase rules or authentication status.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Firestore is currently unavailable. Please try again later.';
      }
      toast.error(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <h1 className="text-3xl font-serif font-bold text-center text-gray-900 dark:text-white mb-12">Checkout</h1>
      {submitLoading ? (
        <div className="flex items-center justify-center min-h-[70vh] bg-gray-100 dark:bg-gray-900">
          <div className="loader"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Shipping Information</h2>
            <form className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-gray-200">Full Name *</label>
                <input name="fullName" value={formData.fullName} onChange={handleInputChange} type="text" placeholder="Full Name" required className="w-full p-3 border rounded-md bg-transparent dark:border-gray-700 focus:ring-amber-700 text-gray-800 dark:text-gray-200" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-gray-200">Email *</label>
                <input name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="Email" required className="w-full p-3 border rounded-md bg-transparent dark:border-gray-700 focus:ring-amber-700 text-gray-800 dark:text-gray-200" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-gray-200">Address *</label>
                <input name="address" value={formData.address} onChange={handleInputChange} type="text" placeholder="Address" required className="w-full p-3 border rounded-md bg-transparent dark:border-gray-700 focus:ring-amber-700 text-gray-800 dark:text-gray-200" />
              </div>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-900 dark:text-gray-200">City *</label>
                  <input name="city" value={formData.city} onChange={handleInputChange} type="text" placeholder="City" required className="w-full p-3 border rounded-md bg-transparent dark:border-gray-700 focus:ring-amber-700 text-gray-800 dark:text-gray-200" />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-900 dark:text-gray-200">Postal Code *</label>
                  <input name="postalCode" value={formData.postalCode} onChange={handleInputChange} type="text" placeholder="Postal Code" required className="w-full p-3 border rounded-md bg-transparent dark:border-gray-700 focus:ring-amber-700 text-gray-800 dark:text-gray-200" />
                </div>
              </div>
            </form>
            <h2 className="text-xl font-semibold mt-10 mb-6 text-gray-900 dark:text-white">Payment Method</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-200">Cash on Delivery</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Pay when you receive your order.</p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Online/Card payment options will be added soon.</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Contact us on WhatsApp for order confirmation or support: [WhatsApp number to be added later].</p>
            </div>
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
            <button onClick={handlePlaceOrder} disabled={submitLoading} className={`mt-8 w-full px-6 py-4 bg-amber-800 text-white uppercase tracking-widest text-sm font-semibold hover:bg-amber-900 transition-colors duration-300 rounded-md ${submitLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {submitLoading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      )}
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
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    if (isLoginView) {
      const success = await login(email, password);
      if (success) {
        const redirect = location.state?.redirect || '/';
        console.log('Navigating after login to:', redirect);
        navigate(redirect);
      }
    } else {
      if (password !== confirmPassword) {
        toast.error('Passwords do not match.');
        setSubmitLoading(false);
        return;
      }
      const success = await signup(name, email, password);
      if (success) {
        const redirect = location.state?.redirect || '/';
        console.log('Navigating after signup to:', redirect);
        navigate(redirect);
      }
    }
    setSubmitLoading(false);
  };

  const handleGoogleLogin = async () => {
    setSubmitLoading(true);
    const success = await loginWithGoogle();
    if (success) {
      const redirect = location.state?.redirect || '/';
      console.log('Navigating after Google login to:', redirect);
      navigate(redirect);
    }
    setSubmitLoading(false);
  };

  if (submitLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-gray-100 dark:bg-gray-900">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh] py-12 bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-serif font-bold text-center text-gray-900 dark:text-white">{isLoginView ? 'Login' : 'Sign Up'}</h1>
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
            disabled={submitLoading}
            className={`w-full px-6 py-3 bg-amber-800 text-white uppercase tracking-widest text-sm font-semibold hover:bg-amber-900 transition-colors duration-300 rounded-md ${submitLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoginView ? 'Login' : 'Create Account'}
          </button>
        </form>
        <button
          onClick={handleGoogleLogin}
          disabled={submitLoading}
          className={`w-full px-6 py-3 bg-gray-700 text-white uppercase tracking-widest text-sm font-semibold hover:bg-gray-800 transition-colors duration-300 rounded-md ${submitLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Login with Google
        </button>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
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
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    address: user?.address || '',
    image: user?.image || ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [orders, setOrders] = useState(user?.orders || []);

  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(collection(db, `users/${user.uid}/orders`), (snapshot) => {
        const orderList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Orders fetched:', orderList.length);
        setOrders(orderList);
      }, (error) => {
        console.error('Error fetching orders:', error.code, error.message);
        toast.error('Failed to load orders.');
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setFormData({ ...formData, image: URL.createObjectURL(e.target.files[0]) });
    }
  };

  const uploadImageToImgBB = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      console.log('Uploading profile image to ImgBB...');
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      console.log('ImgBB response:', data);
      if (data.success) {
        return data.data.url;
      } else {
        throw new Error(data.error?.message || 'Image upload failed');
      }
    } catch (error) {
      console.error('Error uploading image to ImgBB:', error.message);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      let imageUrl = formData.image;
      if (imageFile) {
        imageUrl = await uploadImageToImgBB(imageFile);
      }
      await updateProfile(auth.currentUser, { displayName: formData.name });
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        name: formData.name,
        email: user.email,
        address: formData.address,
        image: imageUrl,
        joined: user.joined
      }, { merge: true });
      console.log('Profile updated:', { name: formData.name, address: formData.address, image: imageUrl });
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error.code, error.message);
      toast.error(`Failed to update profile: ${error.message}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (submitLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-gray-100 dark:bg-gray-900">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <h1 className="text-3xl font-serif font-bold text-center text-gray-900 dark:text-white mb-12">My Profile</h1>
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Account Details</h2>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-gray-200">Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Full Name"
                required
                className="w-full p-3 border rounded-md bg-transparent border-gray-300 dark:border-gray-700 focus:ring-amber-700 text-gray-800 dark:text-gray-200"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-gray-200">Email</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full p-3 border rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-gray-200">Address</label>
              <input
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Address"
                className="w-full p-3 border rounded-md bg-transparent border-gray-300 dark:border-gray-700 focus:ring-amber-700 text-gray-800 dark:text-gray-200"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-gray-200">Profile Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-3 border rounded-md bg-transparent border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200"
              />
              {formData.image ? (
                <img src={formData.image} alt="Profile" className="mt-2 h-20 w-20 object-cover rounded-full" />
              ) : (
                <div className="mt-2 h-20 w-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400">No Image</div>
              )}
            </div>
            <button
              type="submit"
              disabled={submitLoading}
              className={`w-full sm:w-auto px-6 py-3 bg-amber-800 text-white uppercase tracking-widest text-sm font-semibold hover:bg-amber-900 transition-colors duration-300 rounded-md ${submitLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {submitLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
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
                {orders.length > 0 ? (
                  orders.map(order => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-gray-200">{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-gray-200">{order.date.split('T')[0]}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-gray-200">PKR {order.total.toLocaleString()}</td>
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-gray-100 dark:bg-gray-900">
        <div className="loader"></div>
      </div>
    );
  }

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
            <button onClick={() => navigate(user ? '/profile' : '/login')} className="text-gray-600 dark:text-gray-300 hover:text-amber-800 dark:hover:text-amber-600 transition-colors duration-300">
              <UserIcon className="h-6 w-6" />
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
            <button type="button" onClick={() => toast.info('Newsletter subscription not implemented.')} className="px-4 py-2 bg-amber-800 text-white rounded-r-md hover:bg-amber-900 transition-colors">
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
      <style>{spinnerStyles}</style>
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
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
      <ToastContainer position="top-right" autoClose={3000} />
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