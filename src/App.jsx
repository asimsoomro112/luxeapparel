import React, { useState, useEffect, useContext, createContext, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, getDocs, getDoc, addDoc, setDoc, doc, 
  query, orderBy, limit, where, onSnapshot, updateDoc 
} from 'firebase/firestore';
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, 
  signInWithPopup, signOut, onAuthStateChanged, updateProfile, 
  GoogleAuthProvider, signInWithCustomToken, signInAnonymously 
} from 'firebase/auth';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';

// --- ICONS (Inline SVGs to remove dependency) ---
const IconWrapper = ({ children, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    {children}
  </svg>
);

const Search = ({ className }) => (
  <IconWrapper className={className}>
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </IconWrapper>
);

const ShoppingBag = ({ className }) => (
  <IconWrapper className={className}>
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <path d="M16 10a4 4 0 0 1-8 0"></path>
  </IconWrapper>
);

const Menu = ({ className }) => (
  <IconWrapper className={className}>
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </IconWrapper>
);

const X = ({ className }) => (
  <IconWrapper className={className}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </IconWrapper>
);

const Star = ({ className }) => (
  <IconWrapper className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </IconWrapper>
);

const Shirt = ({ className }) => (
  <IconWrapper className={className}>
    <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path>
  </IconWrapper>
);

const Instagram = ({ className }) => (
  <IconWrapper className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </IconWrapper>
);

const Twitter = ({ className }) => (
  <IconWrapper className={className}>
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
  </IconWrapper>
);

const Youtube = ({ className }) => (
  <IconWrapper className={className}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
  </IconWrapper>
);

const Plus = ({ className }) => (
  <IconWrapper className={className}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </IconWrapper>
);

const Eye = ({ className }) => (
  <IconWrapper className={className}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </IconWrapper>
);

const ArrowRight = ({ className }) => (
  <IconWrapper className={className}>
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </IconWrapper>
);

const User = ({ className }) => (
  <IconWrapper className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </IconWrapper>
);

const LogOut = ({ className }) => (
  <IconWrapper className={className}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </IconWrapper>
);

const Trash2 = ({ className }) => (
  <IconWrapper className={className}>
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </IconWrapper>
);

const CheckCircle = ({ className }) => (
  <IconWrapper className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </IconWrapper>
);

const AlertCircle = ({ className }) => (
  <IconWrapper className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </IconWrapper>
);

const Info = ({ className }) => (
  <IconWrapper className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </IconWrapper>
);

// --- FIREBASE INITIALIZATION ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// --- APP ID SANITIZATION ---
// This fixes the "Invalid document reference" error by removing slashes/special chars from the ID
let rawAppId = typeof __app_id !== 'undefined' ? String(__app_id) : 'default-app-id';
const appId = rawAppId.replace(/[^a-zA-Z0-9_-]/g, '_');

// --- GLOBAL STYLES ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Italiana&family=Manrope:wght@200;300;400;500;600;700;800&display=swap');

    :root {
      --accent: #333333;
      --dark: #050505;
      --off-white: #F2F2F2;
      --concrete: #8c8c8c;
    }

    body {
      font-family: 'Manrope', sans-serif;
      background-color: var(--off-white);
      color: var(--dark);
      overflow-x: hidden;
    }

    h1, h2, h3, .editorial-font {
      font-family: 'Italiana', serif;
    }
    
    .cinzel {
      font-family: 'Cinzel', serif;
    }

    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--off-white); }
    ::-webkit-scrollbar-thumb { background: #333; }

    .marquee-container {
      overflow: hidden;
      white-space: nowrap;
    }
    .marquee-content {
      display: inline-block;
      animation: marquee 20s linear infinite;
    }
    @keyframes marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    @media (min-width: 1024px) {
      .cursor-dot, .cursor-outline {
        position: fixed;
        top: 0; left: 0;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        z-index: 9999;
        pointer-events: none;
      }
      .cursor-dot { width: 8px; height: 8px; background: var(--dark); }
      .cursor-outline { width: 40px; height: 40px; border: 1px solid rgba(0,0,0,0.2); transition: width 0.2s, height 0.2s, background-color 0.2s; }
      
      body:hover .cursor-outline { width: 50px; height: 50px; }
      a:hover ~ .cursor-outline { background-color: rgba(51, 51, 51, 0.1); border-color: var(--accent); }
    }
    
    .glass-panel {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(0,0,0,0.05);
    }

    .loader {
        border-top-color: #333;
        -webkit-animation: spinner 1.5s linear infinite;
        animation: spinner 1.5s linear infinite;
        border-radius: 50%;
        border: 2px solid transparent;
        width: 24px;
        height: 24px;
    }
    @keyframes spinner {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
  `}</style>
);

// --- CUSTOM TOAST SYSTEM ---
const ToastContext = createContext();

const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), 3000);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
                {toasts.map(toast => (
                    <div 
                        key={toast.id} 
                        className={`flex items-center gap-2 px-4 py-3 rounded-md shadow-lg text-white text-sm font-medium animate-in slide-in-from-right fade-in duration-300 ${
                            toast.type === 'success' ? 'bg-green-600' : 
                            toast.type === 'error' ? 'bg-red-600' : 'bg-gray-800'
                        }`}
                    >
                        {toast.type === 'success' && <CheckCircle className="w-4 h-4" />}
                        {toast.type === 'error' && <AlertCircle className="w-4 h-4" />}
                        {toast.type === 'info' && <Info className="w-4 h-4" />}
                        {toast.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

const useToast = () => useContext(ToastContext);

// --- CONTEXTS ---
const CartContext = createContext();
const AuthContext = createContext();

// --- PROVIDERS ---
const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { addToast } = useToast();

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  const addToCart = (product, size, quantity = 1) => {
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
    setIsCartOpen(true);
    addToast(`${product.name} added to cart!`, 'success');
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

  const clearCart = () => setCartItems([]);

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount, isCartOpen, toggleCart }}>
      {children}
    </CartContext.Provider>
  );
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
        try {
            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                await signInWithCustomToken(auth, __initial_auth_token);
            } else {
                if (!auth.currentUser) {
                     await signInAnonymously(auth);
                }
            }
        } catch (error) {
            console.error("Auth init failed", error);
        }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && !currentUser.isAnonymous) {
        try {
            // Using safe document reference
            const userDoc = await getDoc(doc(db, 'artifacts', appId, 'users', currentUser.uid, 'profile', 'data'));
            const userData = userDoc.exists() ? userDoc.data() : {};
            
            setUser({
            uid: currentUser.uid,
            name: currentUser.displayName || userData.name || currentUser.email?.split('@')[0] || 'User',
            email: currentUser.email,
            address: userData.address || '',
            image: userData.image || '',
            ...userData
            });
        } catch (e) {
            console.error("Profile fetch error", e);
            setUser({ uid: currentUser.uid, email: currentUser.email, name: 'User' });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [addToast]);

  const signup = async (name, email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      await setDoc(doc(db, 'artifacts', appId, 'users', userCredential.user.uid, 'profile', 'data'), {
        id: userCredential.user.uid,
        name,
        email,
        address: '',
        joined: new Date().toISOString()
      });
      return true;
    } catch (error) {
      addToast(error.message, 'error');
      return false;
    }
  };

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      addToast(error.message, 'error');
      return false;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data');
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
            id: user.uid,
            name: user.displayName,
            email: user.email,
            image: user.photoURL,
            joined: new Date().toISOString()
        });
      }
      return true;
    } catch (error) {
      addToast(error.message, 'error');
      return false;
    }
  };

  const logout = async () => {
    await signOut(auth);
    addToast("Logged out", 'info');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, loginWithGoogle, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- COMPONENTS ---

const CustomCursor = () => {
  const dotRef = useRef(null);
  const outlineRef = useRef(null);

  useEffect(() => {
    const moveCursor = (e) => {
      if (dotRef.current && outlineRef.current) {
        dotRef.current.style.left = `${e.clientX}px`;
        dotRef.current.style.top = `${e.clientY}px`;
        
        outlineRef.current.animate({
          left: `${e.clientX}px`,
          top: `${e.clientY}px`
        }, { duration: 500, fill: "forwards" });
      }
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot hidden lg:block" />
      <div ref={outlineRef} className="cursor-outline hidden lg:block" />
    </>
  );
};

const Navbar = () => {
  const { toggleCart, cartCount } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <div className="bg-[#050505] text-white text-[10px] md:text-xs py-2 overflow-hidden relative z-50">
        <div className="marquee-container">
          <div className="marquee-content font-mono tracking-widest uppercase">
            Free Shipping on orders over PKR 5000 &nbsp; • &nbsp; 280 GSM Heavyweight Cotton &nbsp; • &nbsp; Oversized Drop-Shoulder Fit &nbsp; • &nbsp; Free Shipping on orders over PKR 5000 &nbsp; • &nbsp;
          </div>
        </div>
      </div>

      <nav className={`fixed w-full z-40 transition-all duration-500 ${scrolled ? 'glass-panel py-3' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          
          <div className="flex items-center gap-6">
            <button onClick={() => setIsMenuOpen(true)} className="group flex flex-col gap-1.5 w-8 cursor-pointer">
              <span className="w-full h-[2px] bg-black group-hover:w-1/2 transition-all duration-300"></span>
              <span className="w-2/3 h-[2px] bg-black transition-all duration-300"></span>
              <span className="w-full h-[2px] bg-black group-hover:w-1/2 group-hover:ml-auto transition-all duration-300"></span>
            </button>
            <span className="hidden md:block text-xs font-bold uppercase tracking-widest text-black">Shop</span>
          </div>

          <a onClick={() => navigate('/')} className="absolute left-1/2 transform -translate-x-1/2 text-center group cursor-pointer">
            <h1 className="font-display text-3xl md:text-4xl font-black tracking-tighter text-black">LUXE<span className="text-[#8c8c8c] text-sm align-top">®</span></h1>
          </a>

          <div className="flex items-center gap-6">
            <button onClick={() => navigate(user ? '/profile' : '/login')} className="hover:text-[#8c8c8c] transition-colors text-black">
              <User className="w-5 h-5" />
            </button>
            <button onClick={toggleCart} className="relative hover:text-[#8c8c8c] transition-colors text-black">
              <span className="text-xs font-bold mr-2 hidden md:inline-block tracking-wider">CART</span>
              <ShoppingBag className="w-5 h-5 inline-block" />
              {cartCount > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-black rounded-full"></span>}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 bg-[#050505] text-white z-50 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-500 ease-in-out flex flex-col`}>
        <div className="p-6 flex justify-between items-center border-b border-gray-800">
          <span className="font-display text-2xl font-bold">LUXE</span>
          <button onClick={() => setIsMenuOpen(false)} className="text-white"><X className="w-6 h-6" /></button>
        </div>
        <div className="flex-1 p-8 flex flex-col gap-6 overflow-y-auto">
          <a onClick={() => {navigate('/shop'); setIsMenuOpen(false)}} className="text-4xl font-sans font-black uppercase tracking-tighter hover:text-gray-400 transition cursor-pointer">Shop All</a>
          <a onClick={() => {navigate('/shop?cat=Plain'); setIsMenuOpen(false)}} className="text-4xl font-sans font-black uppercase tracking-tighter hover:text-gray-400 transition cursor-pointer">Plain</a>
          <a onClick={() => {navigate('/shop?cat=Graphic'); setIsMenuOpen(false)}} className="text-4xl font-sans font-black uppercase tracking-tighter hover:text-gray-400 transition cursor-pointer">Graphic</a>
          <a onClick={() => {navigate('/profile'); setIsMenuOpen(false)}} className="text-4xl font-serif text-gray-500 hover:text-white transition mt-auto cursor-pointer">Account</a>
        </div>
      </div>
    </>
  );
};

const CartDrawer = () => {
  const { isCartOpen, toggleCart, cartItems, removeFromCart, updateQuantity, cartTotal } = useContext(CartContext);
  const navigate = useNavigate();

  return (
    <div className={`fixed inset-y-0 right-0 w-full md:w-[450px] bg-white z-50 shadow-2xl transform ${isCartOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-500 ease-in-out flex flex-col`}>
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-sans font-bold text-xl uppercase tracking-wide text-black">Cart ({cartItems.length})</h3>
        <button onClick={toggleCart} className="hover:rotate-90 transition-transform text-black"><X className="w-6 h-6" /></button>
      </div>
      
      <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
        {cartItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
            <ShoppingBag className="w-12 h-12 mb-4 text-black" />
            <p className="font-sans font-bold text-xl mb-2 text-black">Cart is Empty</p>
            <p className="text-sm text-black">Your fit is incomplete.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map(item => (
              <div key={`${item.id}-${item.size}`} className="flex gap-4 bg-white p-4 shadow-sm border border-gray-100">
                <div className="w-20 h-24 bg-gray-200 flex items-center justify-center overflow-hidden">
                  <img src={item.image || 'https://placehold.co/100x100'} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <h4 className="font-sans font-bold text-sm uppercase tracking-wide text-black">{item.name}</h4>
                    <button onClick={() => removeFromCart(item.id, item.size)} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="text-xs text-gray-500 mb-2 font-mono">
                    Size: {item.size}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="font-mono text-sm font-bold text-black">PKR {item.price.toLocaleString()}</p>
                    <div className="flex items-center border border-gray-200 rounded-sm">
                        <button onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)} className="px-2 py-1 text-xs">-</button>
                        <span className="px-2 text-xs font-mono">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)} className="px-2 py-1 text-xs">+</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-gray-100">
        <div className="flex justify-between items-center mb-4 text-lg font-bold font-mono text-black">
          <span>TOTAL</span>
          <span>PKR {cartTotal.toLocaleString()}</span>
        </div>
        <button 
          onClick={() => { toggleCart(); navigate('/checkout'); }} 
          disabled={cartItems.length === 0}
          className="w-full bg-[#050505] text-white py-4 font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors duration-300 disabled:opacity-50"
        >
          Checkout
        </button>
        <p className="text-center text-[10px] text-gray-400 mt-3 uppercase tracking-wider">Taxes & shipping calculated at checkout</p>
      </div>
    </div>
  );
};

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate(`/product/${product.id}`)} className="group cursor-pointer">
      <div className="relative overflow-hidden aspect-[3/4] mb-6 bg-gray-200">
        {product.isNew && (
            <span className="absolute top-4 left-4 bg-black text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest z-10">New Drop</span>
        )}
        <img 
            src={product.image || 'https://placehold.co/600x800/e2e2e2/333333?text=LUXE'} 
            className="w-full h-full object-cover transition duration-700 group-hover:scale-105 filter contrast-110"
            alt={product.name}
        />
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition duration-500 flex items-center justify-center gap-4">
            <button className="bg-black text-white w-12 h-12 flex items-center justify-center rounded-none hover:bg-white hover:text-black transition border border-black transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75">
                <Eye className="w-5 h-5" />
            </button>
        </div>
      </div>
      <div className="flex justify-between items-start mb-2">
        <div>
            <h3 className="font-sans font-bold text-lg group-hover:text-[#8c8c8c] transition-colors uppercase tracking-tight text-black">{product.name}</h3>
            <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">280 GSM • Heavyweight</p>
        </div>
        <span className="font-mono text-sm font-bold text-black">PKR {product.price?.toLocaleString()}</span>
      </div>
    </div>
  );
};

// --- PAGES ---

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wrapped in try/catch for safety
    try {
        const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'products'), limit(6));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          setLoading(false);
        }, (error) => {
            console.error("Home products fetch error", error);
            setLoading(false);
        });
        return () => unsubscribe();
    } catch (err) {
        console.error("Query init error", err);
        setLoading(false);
    }
  }, []);

  return (
    <>
      <header className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-gray-200">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1571455786673-9d9d6c194f90?q=80&w=2070&auto=format&fit=crop" 
               className="w-full h-full object-cover grayscale contrast-125" alt="Streetwear Model" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/60 via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-6xl mt-20">
          <p className="text-white text-xs md:text-sm uppercase tracking-[0.5em] mb-6 font-bold bg-black/30 inline-block px-4 py-1 backdrop-blur-sm">Drop 04: Concrete Jungle</p>
          <h1 className="text-6xl md:text-9xl font-sans font-black text-white mb-2 leading-[0.8] tracking-tighter mix-blend-overlay">
            OVER<br/>SIZED
          </h1>
          <p className="text-xl md:text-2xl text-white font-serif italic mb-10 opacity-90">Essentials for the modern void.</p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center mt-8">
            <a href="#shop" className="group relative px-10 py-4 bg-white text-black overflow-hidden transition-all hover:bg-black hover:text-white border border-white">
              <span className="relative z-10 text-xs font-bold tracking-[0.2em] uppercase">Shop Collection</span>
            </a>
          </div>
        </div>
      </header>

      <section className="py-6 border-b border-gray-200 bg-white">
        <div className="container mx-auto px-6 flex justify-between items-center text-xs text-gray-500 font-mono uppercase">
          <span className="hidden md:inline">Designed in Karachi</span>
          <div className="flex items-center gap-4">
            <div className="flex text-black">
              {[...Array(5)].map((_,i) => <Star key={i} className="w-3 h-3 fill-current" />)}
            </div>
            <span className="text-black font-bold">10,000+ Fits Sold</span>
          </div>
          <span className="hidden md:inline">Est. 2023</span>
        </div>
      </section>

      <section id="shop" className="py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl md:text-6xl font-serif mb-4 text-black">The <span className="italic text-gray-400">Rotation</span></h2>
              <p className="text-gray-500 max-w-md font-medium">Boxy cuts, dropped shoulders, and heavyweight fabric. The uniform of the streets.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-8">
            {loading ? <div className="loader"></div> : (products.length > 0 ? products.map(product => (
              <ProductCard key={product.id} product={product} />
            )) : <p>No products loaded (Add some to Firestore at artifacts/{appId}/public/data/products)</p>)}
          </div>
        </div>
      </section>

      <section className="py-32 bg-[#050505] text-white relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-20">
            <div className="md:w-1/2">
                <h2 className="text-5xl md:text-7xl font-serif mb-8 leading-none">Find Your <br/><span className="italic text-[#8c8c8c]">Fit</span></h2>
                <div className="space-y-8">
                    {['The Boxy', 'The Oversized', 'The Vintage'].map((item, idx) => (
                        <div key={idx} className="group cursor-pointer border-b border-white/10 pb-6 hover:border-white transition-colors">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-2xl font-sans font-bold uppercase tracking-tight group-hover:translate-x-2 transition-transform">{item}</h3>
                                <span className="text-xs text-gray-500 font-mono">0{idx + 1}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="md:w-1/2 h-[600px] w-full relative">
                <img src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1887&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover filter grayscale hover:grayscale-0 transition duration-700" />
            </div>
        </div>
      </section>

      <section className="py-24 bg-gray-100">
        <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <div className="order-2 md:order-1 relative">
                    <img src="https://images.unsplash.com/photo-1520006403909-838d6b92c22e?q=80&w=2070&auto=format&fit=crop" className="w-full h-[500px] object-cover grayscale relative z-10 shadow-xl" />
                </div>
                <div className="order-1 md:order-2">
                    <span className="text-[#8c8c8c] uppercase tracking-[0.2em] text-xs font-bold mb-4 block">Fabric Technology</span>
                    <h2 className="text-4xl md:text-5xl font-serif mb-6 text-black">Why <span className="italic">280 GSM</span> Matters.</h2>
                    <p className="text-gray-600 mb-6 font-medium leading-relaxed">
                        Standard t-shirts are 150 GSM. Ours are nearly double that. 
                        <strong>GSM (Grams per Square Meter)</strong> determines the weight and drape of the fabric.
                    </p>
                    <div className="grid grid-cols-2 gap-8 mb-8 border-t border-gray-300 pt-8">
                        <div>
                            <span className="block text-3xl font-bold font-sans text-black">100%</span>
                            <span class="text-xs uppercase tracking-widest text-gray-500">Combed Cotton</span>
                        </div>
                        <div>
                             <span class="block text-3xl font-bold font-sans text-black">0%</span>
                            <span class="text-xs uppercase tracking-widest text-gray-500">Shrinkage</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>
    </>
  );
};

const ShopPage = () => {
  const { search } = useLocation();
  const cat = new URLSearchParams(search).get('cat');
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    try {
        let q = collection(db, 'artifacts', appId, 'public', 'data', 'products');
        const unsubscribe = onSnapshot(q, (snapshot) => {
            let items = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
            if (cat) {
                items = items.filter(i => i.category === cat);
            }
            setProducts(items);
        }, (error) => console.error(error));
        return () => unsubscribe();
    } catch (e) { console.error(e) }
  }, [cat]);

  return (
    <div className="pt-32 pb-24 container mx-auto px-6 min-h-screen">
       <h1 className="text-4xl md:text-6xl font-serif mb-12 text-black text-center">{cat ? cat : 'All Products'}</h1>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-8">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
        </div>
    </div>
  );
};

const ProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useContext(CartContext);
    const [product, setProduct] = useState(null);
    const [selectedSize, setSelectedSize] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'products', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProduct({ id: docSnap.id, ...docSnap.data() });
                }
            } catch(e) { console.error(e) }
            setLoading(false);
        };
        fetchProduct();
    }, [id]);

    if(loading) return <div className="h-screen flex items-center justify-center"><div className="loader"></div></div>;
    if(!product) return <div className="h-screen flex items-center justify-center">Product Not Found</div>;

    return (
        <div className="pt-32 pb-24 container mx-auto px-6">
            <button onClick={() => navigate(-1)} className="mb-8 text-sm uppercase tracking-widest hover:text-[#8c8c8c] transition">&larr; Back</button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="bg-gray-200">
                    <img src={product.image || 'https://placehold.co/600x800'} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col justify-center">
                    <h1 className="text-4xl md:text-6xl font-serif mb-4 text-black">{product.name}</h1>
                    <p className="text-2xl font-mono font-bold mb-8 text-black">PKR {product.price?.toLocaleString()}</p>
                    <p className="text-gray-600 mb-8 leading-relaxed">{product.description || "Designed for the modern streetwear aesthetic. Heavyweight cotton, drop-shoulder fit."}</p>
                    
                    <div className="mb-8">
                        <span className="text-xs font-bold uppercase tracking-widest block mb-4">Select Size</span>
                        <div className="flex gap-4">
                            {(product.sizes || ['S', 'M', 'L', 'XL']).map(size => (
                                <button 
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`w-12 h-12 border border-black flex items-center justify-center text-sm font-bold transition ${selectedSize === size ? 'bg-black text-white' : 'hover:bg-black hover:text-white'}`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={() => {
                            if(!selectedSize) return alert('Select a size');
                            addToCart(product, selectedSize);
                        }}
                        className="w-full bg-black text-white py-4 uppercase tracking-[0.2em] font-bold text-sm hover:bg-gray-800 transition"
                    >
                        Add To Cart
                    </button>
                    
                    <div className="mt-8 border-t border-gray-200 pt-8 space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Material</span>
                            <span className="font-bold">100% Cotton (280 GSM)</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Fit</span>
                            <span className="font-bold">Oversized / Boxy</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CheckoutPage = () => {
    const { cartItems, cartTotal, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        address: user?.address || '',
        city: '',
        phone: ''
    });

    const handleOrder = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const orderData = {
                items: cartItems,
                total: cartTotal,
                status: 'Processing',
                shipping: formData,
                createdAt: new Date().toISOString()
            };
            await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'orders'), orderData);
            clearCart();
            addToast("Order Placed Successfully!", "success");
            navigate('/profile');
        } catch (err) {
            addToast("Failed to place order: " + err.message, "error");
            console.error(err);
        }
        setLoading(false);
    };

    return (
        <div className="pt-32 pb-24 container mx-auto px-6">
            <h1 className="text-4xl font-serif mb-12 text-center">Checkout</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <form onSubmit={handleOrder} className="space-y-6">
                    <h3 className="text-xl font-bold uppercase tracking-wide mb-6">Shipping Details</h3>
                    <input 
                        type="text" placeholder="Full Name" required 
                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full p-4 bg-transparent border border-gray-300 focus:border-black outline-none"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <input 
                            type="email" placeholder="Email" required 
                            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                            className="w-full p-4 bg-transparent border border-gray-300 focus:border-black outline-none"
                        />
                         <input 
                            type="tel" placeholder="Phone" required 
                            value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                            className="w-full p-4 bg-transparent border border-gray-300 focus:border-black outline-none"
                        />
                    </div>
                    <input 
                        type="text" placeholder="Address" required 
                        value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                        className="w-full p-4 bg-transparent border border-gray-300 focus:border-black outline-none"
                    />
                    <input 
                        type="text" placeholder="City" required 
                        value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}
                        className="w-full p-4 bg-transparent border border-gray-300 focus:border-black outline-none"
                    />
                    
                    <button disabled={loading} className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-gray-800 transition mt-8">
                        {loading ? 'Processing...' : `Pay PKR ${cartTotal.toLocaleString()} (COD)`}
                    </button>
                </form>

                <div className="bg-gray-50 p-8 h-fit">
                    <h3 className="text-xl font-bold uppercase tracking-wide mb-6">Order Summary</h3>
                    <div className="space-y-4 mb-6">
                        {cartItems.map(item => (
                            <div key={`${item.id}-${item.size}`} className="flex justify-between text-sm">
                                <span>{item.name} (x{item.quantity})</span>
                                <span className="font-mono">PKR {(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-gray-200 pt-4 flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>PKR {cartTotal.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LoginPage = () => {
    const { login, signup, loginWithGoogle } = useContext(AuthContext);
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [name, setName] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        let success = false;
        if(isLogin) {
            success = await login(email, pass);
        } else {
            success = await signup(name, email, pass);
        }
        if(success) navigate('/');
    };

    const handleGoogle = async () => {
        const success = await loginWithGoogle();
        if(success) navigate('/');
    };

    return (
        <div className="h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="bg-white p-8 md:p-12 w-full max-w-md shadow-xl border border-gray-100">
                <h1 className="font-display text-4xl text-center mb-8 font-bold">{isLogin ? 'LOGIN' : 'JOIN LUXE'}</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                         <input type="text" placeholder="Full Name" className="w-full p-4 bg-gray-50 border-none outline-none focus:ring-1 focus:ring-black" onChange={e => setName(e.target.value)} required />
                    )}
                    <input type="email" placeholder="Email" className="w-full p-4 bg-gray-50 border-none outline-none focus:ring-1 focus:ring-black" onChange={e => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" className="w-full p-4 bg-gray-50 border-none outline-none focus:ring-1 focus:ring-black" onChange={e => setPass(e.target.value)} required />
                    
                    <button className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-gray-800 transition">
                        {isLogin ? 'Sign In' : 'Create Account'}
                    </button>
                </form>
                
                <div className="my-6 flex items-center justify-center text-xs text-gray-400 uppercase tracking-widest">
                    <span>Or</span>
                </div>

                <button onClick={handleGoogle} className="w-full border border-black py-4 font-bold uppercase tracking-widest hover:bg-gray-50 transition">
                    Continue with Google
                </button>

                <p className="text-center mt-6 text-sm text-gray-500 cursor-pointer hover:text-black" onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                </p>
            </div>
        </div>
    );
};

const ProfilePage = () => {
    const { user, logout } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        if(user) {
            try {
                const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'orders'), orderBy('createdAt', 'desc'));
                const unsubscribe = onSnapshot(q, snap => {
                    setOrders(snap.docs.map(d => ({id: d.id, ...d.data()})));
                }, (e) => console.error(e));
                return () => unsubscribe();
            } catch (e) { console.error(e) }
        }
    }, [user]);

    if(!user) return <Navigate to="/login" />;

    return (
        <div className="pt-32 pb-24 container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start mb-12">
                <div>
                    <h1 className="text-4xl font-serif mb-2">My Account</h1>
                    <p className="text-gray-500">{user.email}</p>
                </div>
                <button onClick={logout} className="mt-4 md:mt-0 px-6 py-2 border border-red-200 text-red-500 hover:bg-red-50 text-sm uppercase tracking-widest font-bold">Sign Out</button>
            </div>

            <div className="border-t border-gray-200 pt-8">
                <h2 className="text-xl font-bold uppercase tracking-wide mb-6">Order History</h2>
                {orders.length === 0 ? (
                    <p className="text-gray-400">No orders placed yet.</p>
                ) : (
                    <div className="space-y-4">
                        {orders.map(order => (
                            <div key={order.id} className="bg-white p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between md:items-center">
                                <div>
                                    <p className="font-mono text-xs text-gray-400 mb-1">ID: {order.id}</p>
                                    <p className="font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="my-4 md:my-0">
                                    <span className="px-3 py-1 bg-gray-100 text-xs font-bold uppercase">{order.status}</span>
                                </div>
                                <p className="font-mono font-bold">PKR {order.total.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const Footer = () => (
  <footer className="bg-[#050505] text-white pt-24 pb-8">
    <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between mb-20 gap-12">
            <div className="md:w-1/3">
                <h2 className="font-display text-4xl mb-6">LUXE<span className="text-sm align-top text-gray-500">®</span></h2>
                <p className="text-gray-400 font-medium mb-8 max-w-sm text-sm">Redefining the essentials. High-quality heavyweight apparel designed for the modern street aesthetic.</p>
                <div className="flex gap-4">
                     <div className="w-10 h-10 border border-gray-700 flex items-center justify-center hover:bg-white hover:text-black transition"><Instagram className="w-4 h-4"/></div>
                     <div className="w-10 h-10 border border-gray-700 flex items-center justify-center hover:bg-white hover:text-black transition"><Twitter className="w-4 h-4"/></div>
                     <div className="w-10 h-10 border border-gray-700 flex items-center justify-center hover:bg-white hover:text-black transition"><Youtube className="w-4 h-4"/></div>
                </div>
            </div>
            
            <div className="md:w-2/3 grid grid-cols-2 md:grid-cols-3 gap-8">
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#8c8c8c] mb-6">Shop</h4>
                    <ul className="space-y-4 text-sm text-gray-400">
                        <li><a href="#" className="hover:text-white transition">New Arrivals</a></li>
                        <li><a href="#" className="hover:text-white transition">Graphic Tees</a></li>
                        <li><a href="#" className="hover:text-white transition">Plain Essentials</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#8c8c8c] mb-6">Info</h4>
                    <ul className="space-y-4 text-sm text-gray-400">
                        <li><a href="#" className="hover:text-white transition">Size Guide</a></li>
                        <li><a href="#" className="hover:text-white transition">Shipping & Returns</a></li>
                        <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
                    </ul>
                </div>
            </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 font-mono">
            <p>&copy; {new Date().getFullYear()} LUXE Apparel. Karachi, PK.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
                <span>Privacy</span>
                <span className="text-gray-700">|</span>
                <span>Terms</span>
            </div>
        </div>
    </div>
  </footer>
);

// --- MAIN APP ---
const App = () => {
    return (
        <Router>
            <ToastProvider>
                <AuthProvider>
                    <CartProvider>
                        <GlobalStyles />
                        <CustomCursor />
                        <Navbar />
                        <CartDrawer />
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/shop" element={<ShopPage />} />
                            <Route path="/product/:id" element={<ProductPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/checkout" element={<CheckoutPage />} />
                            <Route path="/profile" element={<ProfilePage />} />
                        </Routes>
                        <Footer />
                    </CartProvider>
                </AuthProvider>
            </ToastProvider>
        </Router>
    );
};

export default App;
