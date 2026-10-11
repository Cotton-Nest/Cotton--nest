/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BedsheetProduct, BEDSHEETS_CATALOG, COMPANY_DETAILS } from './data/products';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CatalogueView } from './components/CatalogueView';
import { CartDrawer, CartItem } from './components/CartDrawer';
import { StoreLocation } from './components/StoreLocation';
import { StoryAndFeatures } from './components/StoryAndFeatures';
import { Footer } from './components/Footer';
import { MobileBottomBar } from './components/MobileBottomBar';
import { PhotoUploadModal } from './components/PhotoUploadModal';
import { AdminPanel } from './components/AdminPanel';
import { OwnerAuthModal } from './components/OwnerAuthModal';
import { WhatsAppPhotoHelperModal, WhatsAppHelperData } from './components/WhatsAppPhotoHelperModal';
import { LiveOrdersView } from './components/LiveOrdersView';
import { TermsAndConditionsView } from './components/TermsAndConditionsView';
import { AuthModal } from './components/AuthModal';
import { setWhatsAppListener } from './utils/whatsappOrder';
import { Order, INITIAL_ORDERS } from './data/orders';
import { SiteContent, INITIAL_SITE_CONTENT } from './data/siteContent';
import { getProducts, saveAllProducts, getOrders, getSiteContent, saveSiteContentApi, uploadImageApi } from './services/api';
import {
  savePersistentImage,
  getAllPersistentImages,
  removePersistentImage,
  clearAllPersistentImages,
  getPersistentProducts,
  getPersistentContent
} from './utils/persistentStorage';
import { saveImageToFirestore, getAllImagesFromFirestore } from './firebase';
import { resolveBedsheetImage } from './utils/imageUrl';
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, HeartHandshake, Phone, MessageCircle, Lock, Unlock, Cloud } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'catalogue' | 'story' | 'store' | 'orders' | 'tc'>('home');
  const [selectedProduct, setSelectedProduct] = useState<BedsheetProduct | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPhotoManagerOpen, setIsPhotoManagerOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const isAdminOpenRef = React.useRef(isAdminOpen);
  React.useEffect(() => {
    isAdminOpenRef.current = isAdminOpen;
  }, [isAdminOpen]);
  const lastAdminSaveRef = React.useRef<number>(0);

  const [isOwnerAuthOpen, setIsOwnerAuthOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [whatsAppHelperData, setWhatsAppHelperData] = useState<WhatsAppHelperData | null>(null);

  // Store Owner Authentication Mode (default false for viewers)
  const [isOwnerMode, setIsOwnerMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('cotton_nest_owner_mode') === 'true';
    } catch {
      return false;
    }
  });

  // Dynamic products state with local storage persistence
  const [products, setProducts] = useState<BedsheetProduct[]>(() => {
    try {
      const saved = localStorage.getItem('cotton_nest_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return BEDSHEETS_CATALOG;
  });

  // Dynamic Orders state with local storage persistence
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('cotton_nest_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_ORDERS;
  });

  // Dynamic Site Content & Story with local storage persistence
  const [siteContent, setSiteContent] = useState<SiteContent>(() => {
    try {
      const saved = localStorage.getItem('cotton_nest_site_content');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return INITIAL_SITE_CONTENT;
  });

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('cotton_nest_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [addedProductIds, setAddedProductIds] = useState<Set<string>>(new Set());

  // Store user-uploaded custom photos with automatic corrupt-cache purge
  const [customImages, setCustomImages] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('cotton_nest_custom_images');
      if (saved) {
        const parsed = JSON.parse(saved);
        const vals = Object.values(parsed).filter((v) => typeof v === 'string' && v.trim() !== '');
        // If all items share the exact same photo (corrupted mass-override), purge immediately!
        if (vals.length >= 3 && vals.every((v) => v === vals[0])) {
          localStorage.removeItem('cotton_nest_custom_images');
          return {};
        }
        // Discard any dead temporary /uploads/ container paths
        const clean: Record<string, string> = {};
        for (const [k, v] of Object.entries(parsed)) {
          if (typeof v === 'string' && !v.startsWith('/uploads/sheet_') && !v.startsWith('uploads/sheet_')) {
            clean[k] = v;
          }
        }
        return clean;
      }
      return {};
    } catch {
      return {};
    }
  });

  // Load products, orders, content, and persistent images on mount & sync periodically
  useEffect(() => {
    let isMounted = true;

    // Check IndexedDB immediately to ensure custom products and content load even if localStorage was quota-cleared
    getPersistentProducts().then((idb) => {
      if (isMounted && idb && Array.isArray(idb) && idb.length > 0) {
        setProducts((curr) => {
          const currTime = Math.max(...curr.map((p) => p.updatedAt || 0), 0);
          const idbTime = Math.max(...idb.map((p) => p.updatedAt || 0), 0);
          if (idbTime >= currTime || curr === BEDSHEETS_CATALOG) {
            return idb;
          }
          return curr;
        });
      }
    }).catch(() => {});

    getPersistentContent().then((idbContent) => {
      if (isMounted && idbContent && idbContent.company) {
        setSiteContent((curr) => (curr === INITIAL_SITE_CONTENT ? idbContent : curr));
      }
    }).catch(() => {});

    const loadDataFromServer = async () => {
      try {
        const [serverProducts, serverOrders, serverContent, persistentImgs, firestoreImgs] = await Promise.all([
          getProducts(),
          getOrders(),
          getSiteContent(),
          getAllPersistentImages().catch(() => ({})),
          getAllImagesFromFirestore().catch(() => ({})),
        ]);
        if (isMounted) {
          const imgMap: Record<string, string> = { ...persistentImgs, ...firestoreImgs };

          // Discard corrupted duplicate overrides if all products were accidentally given the same photo
          const imgValues = Object.values(imgMap).filter((v) => typeof v === 'string' && v.trim() !== '');
          const isCorruptedDuplicate =
            imgValues.length >= 3 &&
            imgValues.every((val) => val === imgValues[0]);

          if (isCorruptedDuplicate) {
            console.warn('Detected duplicate corrupted photo override, discarding duplicate map...');
            clearAllPersistentImages();
            Object.keys(imgMap).forEach((k) => delete imgMap[k]);
          }

          if (serverProducts && serverProducts.length > 0) {
            // Apply persistent images so uploaded photos NEVER revert
            const mergedProducts = serverProducts.map((p) => {
              const photo = imgMap[p.id] || p.image;
              return { ...p, image: resolveBedsheetImage(photo, p.id) };
            });

            // NEVER overwrite if user has Admin Panel open or recently edited products
            if (!isAdminOpenRef.current && Date.now() - lastAdminSaveRef.current > 20000) {
              setProducts(mergedProducts);
            }
          }
          setCustomImages((prev) => ({ ...imgMap, ...prev }));

          if (serverOrders) {
            setOrders(serverOrders);
          }
          if (serverContent && (!isAdminOpenRef.current && Date.now() - lastAdminSaveRef.current > 20000)) {
            setSiteContent(serverContent);
          }
        }
      } catch (err) {
        console.warn('Initial server sync failed:', err);
      }
    };

    loadDataFromServer();

    // When returning to tab or opening on phone, only refresh live customer orders
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isMounted) {
        getOrders().then((o) => {
          if (o && isMounted) {
            setOrders(o);
          }
        }).catch(() => {});
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);

    // Background interval: ONLY poll orders to catch incoming customer orders without touching products or site content
    const interval = setInterval(() => {
      getOrders().then((o) => {
        if (o && isMounted) {
          setOrders(o);
        }
      }).catch(() => {});
    }, 45000);

    return () => {
      isMounted = false;
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, []);

  // Listen for WhatsApp order events to show photo helper modal
  useEffect(() => {
    setWhatsAppListener((data) => {
      setWhatsAppHelperData(data);
    });
    return () => setWhatsAppListener(null);
  }, []);

  // Secret Owner Access Listeners: ?admin=true in URL & Ctrl+Shift+A shortcut
  useEffect(() => {
    // 1. Check URL parameters: ?admin=true or #admin
    const checkUrl = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true' || window.location.hash === '#admin') {
        // Clean URL quietly
        try {
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        } catch {
          // ignore
        }
        setIsOwnerMode(true);
        setIsAdminOpen(true);
        try {
          localStorage.setItem('cotton_nest_owner_mode', 'true');
        } catch {
          // ignore
        }
      }
    };
    checkUrl();

    // 2. Keyboard shortcut: Ctrl + Shift + A (or Cmd + Shift + A)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setIsOwnerMode(true);
        setIsAdminOpen((prev) => !prev);
        try {
          localStorage.setItem('cotton_nest_owner_mode', 'true');
        } catch {}
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('cotton_nest_cart', JSON.stringify(cartItems));
    } catch {
      // Ignore local storage errors
    }
  }, [cartItems]);

  // Admin: Update all products & persist to backend server
  const handleUpdateProducts = async (updatedProducts: BedsheetProduct[]) => {
    lastAdminSaveRef.current = Date.now();
    setProducts(updatedProducts);
    try {
      localStorage.setItem('cotton_nest_products', JSON.stringify(updatedProducts));
    } catch (err) {
      console.warn('Storage quota exceeded:', err);
    }
    await saveAllProducts(updatedProducts);
  };

  // Admin: Update Orders & persist to backend server
  const handleUpdateOrders = async (updatedOrders: Order[]) => {
    setOrders(updatedOrders);
    try {
      localStorage.setItem('cotton_nest_orders', JSON.stringify(updatedOrders));
    } catch (err) {
      console.warn('Storage quota exceeded:', err);
    }
    try {
      await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedOrders),
      });
    } catch (err) {
      console.error('Failed to sync orders to server:', err);
    }
  };

  // Admin: Update Site Content & persist to backend server
  const handleUpdateSiteContent = async (updatedContent: SiteContent) => {
    lastAdminSaveRef.current = Date.now();
    setSiteContent(updatedContent);
    try {
      localStorage.setItem('cotton_nest_site_content', JSON.stringify(updatedContent));
    } catch (err) {
      console.warn('Storage quota exceeded:', err);
    }
    await saveSiteContentApi(updatedContent);
  };

  // Admin: Reset products back to factory defaults on server & local
  const handleResetProducts = async () => {
    setProducts(BEDSHEETS_CATALOG);
    setCustomImages({});
    try {
      localStorage.removeItem('cotton_nest_products');
      localStorage.removeItem('cotton_nest_custom_images');
    } catch {
      // ignore
    }
    try {
      await fetch('/api/reset', { method: 'POST' });
    } catch (err) {
      console.error('Failed to reset on server:', err);
    }
  };

  // Owner Authentication Handlers
  const handleOwnerAuthenticate = () => {
    setIsOwnerMode(true);
    setIsAdminOpen(true);
    try {
      localStorage.setItem('cotton_nest_owner_mode', 'true');
    } catch {
      // ignore
    }
  };

  const handleLockOwnerMode = () => {
    setIsOwnerMode(false);
    setIsAdminOpen(false);
    setIsPhotoManagerOpen(false);
    try {
      localStorage.removeItem('cotton_nest_owner_mode');
    } catch {
      // ignore
    }
  };

  const handleOpenAdminSafely = () => {
    if (isOwnerMode) {
      setIsAdminOpen(true);
    } else {
      setIsOwnerAuthOpen(true);
    }
  };

  const handleOpenPhotoManagerSafely = () => {
    if (isOwnerMode) {
      setIsPhotoManagerOpen(true);
    } else {
      setIsOwnerAuthOpen(true);
    }
  };

  // Save custom images to Google Cloud Firestore, IndexedDB & local storage so photos NEVER reset!
  const handleUploadImage = async (productId: string, fileOrDataUrl: string | File) => {
    try {
      const finalUrl = await uploadImageApi(fileOrDataUrl, productId);

      // 1. Permanently persist to Google Cloud Firestore (Console Cloud Database, cross-device sync)
      await saveImageToFirestore(productId, finalUrl);

      // 2. Immediately persist to IndexedDB (permanent client database, GBs quota, never resets)
      await savePersistentImage(productId, finalUrl);

      // 3. Update state and attempt localStorage cache
      setCustomImages((prev) => {
        const updated = { ...prev, [productId]: finalUrl };
        try {
          localStorage.setItem('cotton_nest_custom_images', JSON.stringify(updated));
        } catch (err) {
          console.warn('Storage quota exceeded, safely stored in IndexedDB:', err);
        }
        return updated;
      });

      // 4. Update products and sync
      setProducts((prev) => {
        const updated = prev.map((p) => (p.id === productId ? { ...p, image: finalUrl } : p));
        saveAllProducts(updated);
        return updated;
      });
    } catch (err) {
      console.error('Failed to upload image:', err);
    }
  };

  const handleResetImage = async (productId: string) => {
    await removePersistentImage(productId);

    setCustomImages((prev) => {
      const updated = { ...prev };
      delete updated[productId];
      try {
        localStorage.setItem('cotton_nest_custom_images', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    const defaultP = BEDSHEETS_CATALOG.find((p) => p.id === productId);
    if (defaultP) {
      const updated = products.map((p) => (p.id === productId ? { ...p, image: defaultP.image } : p));
      setProducts(updated);
      await saveAllProducts(updated);
    }
  };

  const handleResetAllPhotos = async () => {
    await clearAllPersistentImages();
    setCustomImages({});
    try {
      localStorage.removeItem('cotton_nest_custom_images');
    } catch {
      // ignore
    }
    // Revert custom photos back to default catalog photos without touching prices, names, or inventory!
    setProducts((prev) => {
      const updated = prev.map((p) => {
        const cat = BEDSHEETS_CATALOG.find((c) => c.id === p.id);
        return cat ? { ...p, image: cat.image } : p;
      });
      saveAllProducts(updated);
      return updated;
    });
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleAddToCart = (product: BedsheetProduct, quantity: number = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });

    setAddedProductIds((prev) => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedProductIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 2000);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C2420] flex flex-col font-sans selection:bg-[#F3D7DE] selection:text-[#38262B]">
      
      {/* Store Owner Active Mode Banner - Only visible to authenticated owner */}
      {isOwnerMode && !isAdminOpen && (
        <aside aria-label="Owner Mode active status" className="bg-[#2C2420] text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-[#DEC89B]/40 z-50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-[#EAE2D5]">Store Owner Mode Active</span>
            <span className="text-[#A8988D] hidden sm:inline">· You can edit prices, stock, discounts &amp; sync photos</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAdminOpen(true)}
              className="px-2.5 py-1 bg-[#8C2E46] hover:bg-[#A33452] text-white text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
            >
              ⚙️ Admin Panel
            </button>
            <button
              onClick={() => setIsPhotoManagerOpen(true)}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-[#FAF7F2] text-[11px] font-medium rounded-lg transition-colors cursor-pointer"
            >
              📷 Photo Studio
            </button>
            <button
              onClick={handleLockOwnerMode}
              className="px-2 py-1 text-[#A8988D] hover:text-white text-[11px] transition-colors cursor-pointer underline flex items-center gap-1"
            >
              <Lock className="w-3 h-3" />
              <span>Lock / Exit</span>
            </button>
          </div>
        </aside>
      )}

      {/* If Admin is Open, show full Admin Panel */}
      {isAdminOpen ? (
        <AdminPanel
          products={products}
          onUpdateProducts={handleUpdateProducts}
          onResetDefaults={handleResetProducts}
          onExitAdmin={() => setIsAdminOpen(false)}
          customImages={customImages}
          onUploadImage={handleUploadImage}
          orders={orders}
          onUpdateOrders={handleUpdateOrders}
          siteContent={siteContent}
          onUpdateSiteContent={handleUpdateSiteContent}
          onResetAllImages={handleResetAllPhotos}
        />
      ) : (
        <>
          {/* Top Navbar */}
          <Navbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            cartCount={totalCartCount}
            openCart={() => setIsCartOpen(true)}
            onOpenPhotoManager={handleOpenPhotoManagerSafely}
            onOpenAdmin={handleOpenAdminSafely}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            isOwnerMode={isOwnerMode}
            content={siteContent}
          />

          {/* Main Content Area */}
          <main className="flex-1">
            
            {/* TAB 1: HOME VIEW */}
            {activeTab === 'home' && (
              <>
                {/* Hero Section */}
                <Hero
                  onExploreCatalogue={() => {
                    setActiveTab('catalogue');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onVisitStore={() => {
                    setActiveTab('store');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  content={siteContent}
                />

                {/* Featured Showcase: 3 Spotlight bedsheets from the 9 */}
                <section className="py-12 sm:py-16 bg-[#FAF7F2]">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                      <div>
                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A8823B] uppercase tracking-wider mb-1">
                          <Sparkles className="w-3.5 h-3.5 text-[#C29E57]" />
                          Curated Highlights
                        </div>
                        <h2 className="font-serif-luxury text-3xl sm:text-4xl font-semibold text-[#2C2420]">
                          Popular Bedsheets This Season
                        </h2>
                        <p className="text-xs sm:text-sm text-[#6B5D55] mt-1">
                          Handpicked favorites from our pure cotton collection.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setActiveTab('catalogue');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="inline-flex items-center gap-2 text-xs font-semibold text-[#B83F60] hover:text-[#A33452] transition-colors cursor-pointer group"
                      >
                        <span>Browse All {products.length} Bedsheets in Catalogue</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>

                    {/* 3 Featured Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                      {products.slice(0, 3).map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onQuickView={setSelectedProduct}
                          onAddToCart={(p) => handleAddToCart(p, 1)}
                          isAdded={addedProductIds.has(product.id)}
                          customImage={customImages[product.id]}
                          onUploadImage={handleUploadImage}
                          isOwnerMode={isOwnerMode}
                        />
                      ))}
                    </div>

                    {/* Direct CTA to open Special Catalogue */}
                    <div className="mt-10 text-center">
                      <button
                        onClick={() => {
                          setActiveTab('catalogue');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-8 py-3.5 bg-[#FDEAF0] hover:bg-[#F9D3DE] text-[#8C2E46] border border-[#FAD1DC] rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
                      >
                        <span>Open Full {products.length}-Sheet Catalogue</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                </section>

                {/* Story & Craft Section */}
                <StoryAndFeatures
                  onGoToCatalogue={() => {
                    setActiveTab('catalogue');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  content={siteContent}
                />

                {/* Store Location Section */}
                <StoreLocation />
              </>
            )}

            {/* TAB 2: SPECIAL CATALOGUE VIEW (Strictly contains the bedsheets) */}
            {activeTab === 'catalogue' && (
              <CatalogueView
                products={products}
                onQuickView={setSelectedProduct}
                onAddToCart={(p) => handleAddToCart(p, 1)}
                addedProductIds={addedProductIds}
                customImages={customImages}
                onUploadImage={handleUploadImage}
                onOpenPhotoManager={handleOpenPhotoManagerSafely}
                onOpenAdmin={handleOpenAdminSafely}
                isOwnerMode={isOwnerMode}
              />
            )}

            {/* TAB 3: OUR STORY & CRAFTSMANSHIP */}
            {activeTab === 'story' && (
              <StoryAndFeatures
                onGoToCatalogue={() => {
                  setActiveTab('catalogue');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                content={siteContent}
              />
            )}

            {/* TAB 4: STORE LOCATION & VISIT */}
            {activeTab === 'store' && <StoreLocation />}

            {/* TAB 5: LIVE ORDERS FOR INDIVIDUAL CLIENT */}
            {activeTab === 'orders' && (
              <LiveOrdersView
                onExploreCatalogue={() => {
                  setActiveTab('catalogue');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
              />
            )}

            {/* TAB 6: TERMS & CONDITIONS (T&C) */}
            {activeTab === 'tc' && (
              <TermsAndConditionsView
                siteContent={siteContent}
                onExploreCatalogue={() => {
                  setActiveTab('catalogue');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

          </main>

          {/* Global Product Detail Modal */}
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={handleAddToCart}
            customImage={selectedProduct ? customImages[selectedProduct.id] : undefined}
            onUploadImage={handleUploadImage}
            isOwnerMode={isOwnerMode}
            onViewTermsAndConditions={() => {
              setActiveTab('tc');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />

          {/* Photo Studio / Upload Manager Modal - Only available to Owner */}
          <PhotoUploadModal
            isOpen={isPhotoManagerOpen && isOwnerMode}
            onClose={() => setIsPhotoManagerOpen(false)}
            products={products}
            customImages={customImages}
            onUploadImage={handleUploadImage}
            onResetImage={handleResetImage}
            onResetAll={handleResetAllPhotos}
          />

          {/* Slide-over Cart / Checkout Drawer */}
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveFromCart}
            onClearCart={handleClearCart}
            onOrderPlaced={(order) => setOrders((prev) => [order, ...prev])}
            onViewLiveOrders={() => {
              setIsCartOpen(false);
              setActiveTab('orders');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />

          {/* Mobile Sticky Bottom Bar (Thumb Navigation) */}
          <MobileBottomBar
            activeTab={activeTab as any}
            setActiveTab={setActiveTab as any}
            cartCount={totalCartCount}
            openCart={() => setIsCartOpen(true)}
          />

          {/* Global Footer with discrete owner access */}
          <Footer
            onNavClick={setActiveTab as any}
            onOpenAdmin={handleOpenAdminSafely}
            isOwnerMode={isOwnerMode}
            onOpenOwnerAuth={() => setIsOwnerAuthOpen(true)}
            onLockOwnerMode={handleLockOwnerMode}
          />
        </>
      )}

      {/* Google Sign In & Client Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onTrackOrderDirect={(_orderId) => {
          setActiveTab('orders');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Owner Security PIN Authentication Modal */}
      <OwnerAuthModal
        isOpen={isOwnerAuthOpen}
        onClose={() => setIsOwnerAuthOpen(false)}
        onAuthenticate={handleOwnerAuthenticate}
      />

      {/* WhatsApp Photo Helper & Preview Modal */}
      <WhatsAppPhotoHelperModal
        data={whatsAppHelperData}
        onClose={() => setWhatsAppHelperData(null)}
      />

    </div>
  );
}
