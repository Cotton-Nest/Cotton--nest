import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Phone,
  MessageCircle,
  Menu,
  X,
  Sparkles,
  MapPin,
  SlidersHorizontal,
  Package,
  User,
  LogOut,
  Star,
  Heart,
  Home as HomeIcon,
  Grid,
  FileText,
  BookOpen,
  Camera,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { COMPANY_DETAILS } from '../data/products';
import { SiteContent } from '../data/siteContent';
import { useAuth } from '../context/AuthContext';
import { getWishlist, onWishlistChange } from '../utils/wishlist';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  activeTab: 'home' | 'catalogue' | 'story' | 'store' | 'orders' | 'tc' | 'reviews';
  setActiveTab: (tab: 'home' | 'catalogue' | 'story' | 'store' | 'orders' | 'tc' | 'reviews') => void;
  cartCount: number;
  openCart: () => void;
  onOpenPhotoManager?: () => void;
  onOpenAdmin?: () => void;
  onOpenAuthModal?: () => void;
  isOwnerMode?: boolean;
  content?: SiteContent;
  wishlistCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  openCart,
  onOpenPhotoManager,
  onOpenAdmin,
  onOpenAuthModal,
  isOwnerMode = false,
  content,
  wishlistCount: propWishlistCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [localWishlistCount, setLocalWishlistCount] = useState<number>(() => getWishlist().length);
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    setLocalWishlistCount(getWishlist().length);
    return onWishlistChange((list) => {
      setLocalWishlistCount(list.length);
    });
  }, []);

  const totalWishlistCount = propWishlistCount !== undefined ? propWishlistCount : localWishlistCount;

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setUserDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const announcementText = content?.announcement?.text || "100% Pure Combed Natural Cotton Bedsheets · Sector 46 Gurgaon Atelier";
  const brandName = content?.company?.name || "Cotton Nest";
  const contactPhone = content?.company?.phone || COMPANY_DETAILS.phone;

  const handleNavClick = (tab: 'home' | 'catalogue' | 'story' | 'store' | 'orders' | 'tc' | 'reviews') => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWishlistClick = () => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    handleNavClick('catalogue');
  };

  return (
    <>
      {/* Subtle announcement bar with single PWA Install button */}
      <aside aria-label="Announcement" className="bg-[#F4EFE6] border-b border-[#EAE2D5] text-[#7A6458] text-xs py-1.5 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 font-medium truncate">
            <Sparkles className="w-3.5 h-3.5 text-[#C29E57] shrink-0" />
            <span className="truncate">{announcementText}</span>
          </span>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <PWAInstallButton variant="navbar" />
            <span className="hidden md:inline text-[#DCD0C0]">|</span>
            <a
              href={`tel:${contactPhone.replace(/\s+/g, '')}`}
              className="hidden md:inline-flex items-center gap-1 text-[#9E7B3B] hover:underline font-semibold shrink-0"
            >
              <Phone className="w-3 h-3" />
              {contactPhone}
            </a>
          </div>
        </div>
      </aside>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EAE2D5] transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2">
          
          {/* Logo / Brand Name */}
          <button
            onClick={() => handleNavClick('home')}
            className="text-left group cursor-pointer focus:outline-hidden shrink-0 flex items-center gap-1.5"
            aria-label={`${brandName} Home`}
          >
            <span className="font-serif-luxury text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-[#2C2420] group-hover:text-[#8C2E46] transition-colors truncate">
              {brandName}
            </span>
            <span className="hidden xs:inline text-xs sm:text-sm text-[#8C2E46]" title="Feel the Softness">🌸</span>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium">
            <button
              onClick={() => handleNavClick('home')}
              className={`transition-colors relative py-1 cursor-pointer ${
                activeTab === 'home'
                  ? 'text-[#2C2420] font-semibold'
                  : 'text-[#6B5D55] hover:text-[#2C2420]'
              }`}
            >
              Home
              {activeTab === 'home' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C29E57] rounded-full" />
              )}
            </button>

            {/* Catalogue Tab */}
            <button
              onClick={() => handleNavClick('catalogue')}
              className={`relative py-1 cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === 'catalogue'
                  ? 'text-[#8C2E46] font-semibold'
                  : 'text-[#6B5D55] hover:text-[#8C2E46]'
              }`}
            >
              <span>Catalogue</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#FDEAF0] text-[#8C2E46] border border-[#F9D3DE]">
                9 Designs
              </span>
              {activeTab === 'catalogue' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8C2E46] rounded-full" />
              )}
            </button>

            {/* T&C Tab */}
            <button
              onClick={() => handleNavClick('tc')}
              className={`relative py-1 cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === 'tc'
                  ? 'text-[#8C2E46] font-semibold'
                  : 'text-[#6B5D55] hover:text-[#8C2E46]'
              }`}
            >
              <span>T&amp;C</span>
              {activeTab === 'tc' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8C2E46] rounded-full" />
              )}
            </button>

            {/* Customer Reviews Tab */}
            <button
              onClick={() => handleNavClick('reviews')}
              className={`relative py-1 cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === 'reviews'
                  ? 'text-[#8C2E46] font-semibold'
                  : 'text-[#6B5D55] hover:text-[#8C2E46]'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>Reviews</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                4.9 ★
              </span>
              {activeTab === 'reviews' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8C2E46] rounded-full" />
              )}
            </button>

            {/* LIVE ORDERS TAB */}
            <button
              onClick={() => handleNavClick('orders')}
              className={`relative py-1 cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === 'orders'
                  ? 'text-[#2C2420] font-semibold'
                  : 'text-[#6B5D55] hover:text-[#2C2420]'
              }`}
            >
              <Package className="w-4 h-4 text-[#C29E57]" />
              <span>Live Orders</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live sync" />
              {activeTab === 'orders' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C29E57] rounded-full" />
              )}
            </button>

            <button
              onClick={() => handleNavClick('story')}
              className={`transition-colors relative py-1 cursor-pointer ${
                activeTab === 'story'
                  ? 'text-[#2C2420] font-semibold'
                  : 'text-[#6B5D55] hover:text-[#2C2420]'
              }`}
            >
              Our Story
              {activeTab === 'story' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C29E57] rounded-full" />
              )}
            </button>

            <button
              onClick={() => handleNavClick('store')}
              className={`transition-colors relative py-1 cursor-pointer flex items-center gap-1 ${
                activeTab === 'store'
                  ? 'text-[#2C2420] font-semibold'
                  : 'text-[#6B5D55] hover:text-[#2C2420]'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-[#C29E57]" />
              Sector 46 Gurgaon
              {activeTab === 'store' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C29E57] rounded-full" />
              )}
            </button>
          </nav>

          {/* Desktop Right Functional Actions */}
          <div className="hidden md:flex items-center gap-2 sm:gap-3">
            {/* Owner Exclusive Controls */}
            {isOwnerMode && (
              <>
                {onOpenAdmin && (
                  <button
                    type="button"
                    onClick={onOpenAdmin}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-[#8C2E46] bg-[#FDEAF0] hover:bg-[#F9D3DE] border border-[#FAD1DC] rounded-lg transition-colors cursor-pointer shadow-2xs"
                    title="Open Store Admin Panel (Owner Mode)"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#8C2E46]" />
                    <span>Admin Panel</span>
                  </button>
                )}

                {onOpenPhotoManager && (
                  <button
                    type="button"
                    onClick={onOpenPhotoManager}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#2C2420] bg-white border border-[#EAE2D5] rounded-lg hover:bg-[#F4EFE6] transition-colors cursor-pointer"
                    title="Upload or change photos (Owner Mode)"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#C29E57]" />
                    <span>Photo Studio</span>
                  </button>
                )}
              </>
            )}

            {/* Desktop Wishlist Button */}
            <button
              type="button"
              onClick={handleWishlistClick}
              aria-label="View Wishlist"
              title="View Wishlist"
              className="relative p-2 text-[#2C2420] hover:text-[#8C2E46] transition-colors rounded-xl hover:bg-[#F4EFE6] cursor-pointer"
            >
              <Heart className="w-5 h-5" />
              {totalWishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#8C2E46] text-white text-[9px] font-bold rounded-full flex items-center justify-center tabular-nums shadow-xs">
                  {totalWishlistCount}
                </span>
              )}
            </button>

            {/* Google Sign In / User Profile Button */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border border-[#DEC89B] bg-white hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover border border-[#DEC89B]"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#2C2420] text-[#DEC89B] flex items-center justify-center text-[10px] font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-medium text-[#2C2420] max-w-[80px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border border-[#DEC89B] shadow-xl p-2 z-50 animate-in fade-in duration-100">
                    <div className="p-2 border-b border-[#EAE2D5]">
                      <p className="text-xs font-bold text-[#2C2420] truncate">{user.name}</p>
                      <p className="text-[10px] text-[#7A6458] truncate">{user.email || user.phone}</p>
                    </div>
                    <button
                      onClick={() => handleNavClick('orders')}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-[#2C2420] hover:bg-[#FAF7F2] rounded-xl flex items-center gap-2 cursor-pointer"
                    >
                      <Package className="w-3.5 h-3.5 text-[#C29E57]" />
                      <span>Live Orders</span>
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#2C2420] bg-white border border-[#EAE2D5] rounded-lg hover:border-[#DEC89B] hover:bg-[#FAF7F2] transition-colors cursor-pointer shadow-2xs"
                title="Sign in with Google"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Sign In</span>
              </button>
            )}

            {/* Shopping Bag CTA */}
            <button
              onClick={openCart}
              aria-label="View Shopping Bag"
              className="relative p-2 text-[#2C2420] hover:text-[#8C2E46] transition-colors rounded-xl hover:bg-[#F4EFE6] cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#8C2E46] text-white text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* MOBILE TOP BAR ACTIONS: Always accessible, touch-friendly, no clipping */}
          <div className="flex md:hidden items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Wishlist Icon with Count Badge */}
            <button
              type="button"
              onClick={handleWishlistClick}
              aria-label="View Wishlist"
              className="relative p-2 text-[#2C2420] hover:text-[#8C2E46] active:scale-95 transition-transform rounded-xl hover:bg-[#F4EFE6] cursor-pointer"
            >
              <Heart className={`w-5 h-5 ${totalWishlistCount > 0 ? 'text-[#8C2E46]' : 'text-[#2C2420]'}`} />
              {totalWishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 bg-[#8C2E46] text-white text-[9px] font-bold rounded-full flex items-center justify-center tabular-nums shadow-xs">
                  {totalWishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Bag Icon with Count Badge */}
            <button
              type="button"
              onClick={openCart}
              aria-label="View Shopping Bag"
              className="relative p-2 text-[#2C2420] hover:text-[#8C2E46] active:scale-95 transition-transform rounded-xl hover:bg-[#F4EFE6] cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5 text-[#2C2420]" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 bg-[#8C2E46] text-white text-[9px] font-bold rounded-full flex items-center justify-center tabular-nums shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Drawer Trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Navigation Drawer"
              className="p-2 ml-0.5 text-[#2C2420] hover:text-[#8C2E46] bg-white border border-[#EAE2D5] hover:border-[#DEC89B] rounded-xl cursor-pointer shadow-2xs active:scale-95 transition-all flex items-center justify-center"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE EXPANDABLE NAVIGATION DRAWER (Slide-Over from Right) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex justify-end">
          {/* Backdrop overlay with blur */}
          <div
            className="fixed inset-0 bg-[#2C2420]/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-out Drawer Panel */}
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
            className="relative w-[85vw] max-w-sm h-full bg-[#FAF7F2] border-l border-[#DEC89B] shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-250 ease-out text-[#2C2420]"
          >
            {/* Drawer Top Branding & Close Button */}
            <div className="p-4 sm:p-5 border-b border-[#EAE2D5] bg-white flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌸</span>
                <div>
                  <h2 className="font-serif-luxury text-xl font-bold text-[#2C2420] tracking-tight leading-tight">
                    {brandName}
                  </h2>
                  <p className="text-[10px] text-[#7A6458] font-medium tracking-wide">
                    Luxury Bed Linens · Gurgaon
                  </p>
                </div>
              </div>

              {/* Close Button with generous touch area */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close Navigation Drawer"
                className="p-2 text-[#7A6458] hover:text-[#2C2420] bg-[#FAF7F2] hover:bg-[#F4EFE6] rounded-full border border-[#EAE2D5] transition-colors cursor-pointer active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Drawer Body */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              
              {/* Account / User Section Card */}
              {isAuthenticated && user ? (
                <div className="p-3.5 bg-white rounded-2xl border border-[#DEC89B] shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover border border-[#DEC89B] shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#2C2420] text-[#DEC89B] flex items-center justify-center text-sm font-bold shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#2C2420] truncate">{user.name}</p>
                        <p className="text-[10px] text-[#7A6458] truncate">{user.email || user.phone}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                      Signed In
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#EAE2D5]">
                    <button
                      type="button"
                      onClick={() => handleNavClick('orders')}
                      className="flex-1 py-1.5 px-2.5 text-xs font-medium text-[#2C2420] bg-[#FAF7F2] hover:bg-[#F4EFE6] rounded-lg border border-[#EAE2D5] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Package className="w-3.5 h-3.5 text-[#C29E57]" />
                      <span>My Orders</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="py-1.5 px-3 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 flex items-center gap-1 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-gradient-to-br from-white to-[#FAF7F2] rounded-2xl border border-[#DEC89B] shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#2C2420]">Customer Account</p>
                      <p className="text-[11px] text-[#7A6458]">Sign in to track orders &amp; redeem Nest Points</p>
                    </div>
                    <ShieldCheck className="w-4 h-4 text-[#C29E57]" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuthModal?.();
                    }}
                    className="w-full py-2.5 px-3 bg-white hover:bg-[#FAF7F2] border border-[#DEC89B] rounded-xl text-xs font-semibold text-[#2C2420] flex items-center justify-center gap-2 shadow-2xs cursor-pointer active:scale-98 transition-all"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Sign In with Google</span>
                  </button>
                </div>
              )}

              {/* Quick Bar: Cart & Wishlist Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openCart();
                  }}
                  className="p-3 bg-white hover:bg-[#FDEAF0] rounded-xl border border-[#EAE2D5] hover:border-[#FAD1DC] transition-colors flex items-center justify-between text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#8C2E46]" />
                    <div>
                      <p className="text-[10px] text-[#7A6458] uppercase tracking-wider font-semibold">Shopping Bag</p>
                      <p className="text-xs font-bold text-[#2C2420]">{cartCount} {cartCount === 1 ? 'item' : 'items'}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#A8988D]" />
                </button>

                <button
                  type="button"
                  onClick={handleWishlistClick}
                  className="p-3 bg-white hover:bg-[#FDEAF0] rounded-xl border border-[#EAE2D5] hover:border-[#FAD1DC] transition-colors flex items-center justify-between text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-[#8C2E46]" />
                    <div>
                      <p className="text-[10px] text-[#7A6458] uppercase tracking-wider font-semibold">Wishlist</p>
                      <p className="text-xs font-bold text-[#2C2420]">{totalWishlistCount} {totalWishlistCount === 1 ? 'saved' : 'saved'}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#A8988D]" />
                </button>
              </div>

              {/* Navigation Options List */}
              <div className="space-y-1 pt-1">
                <p className="px-1 text-[10px] font-bold text-[#8C7A70] uppercase tracking-wider">
                  Store Navigation
                </p>

                {/* 1. Home */}
                <button
                  type="button"
                  onClick={() => handleNavClick('home')}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    activeTab === 'home'
                      ? 'bg-[#2C2420] text-white font-semibold shadow-xs'
                      : 'text-[#2C2420] hover:bg-white bg-[#FAF7F2] border border-[#EAE2D5]/70'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <HomeIcon className={`w-4 h-4 ${activeTab === 'home' ? 'text-[#DEC89B]' : 'text-[#7A6458]'}`} />
                    <span>Home Atelier</span>
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 ${activeTab === 'home' ? 'text-[#DEC89B]' : 'text-[#A8988D]'}`} />
                </button>

                {/* 2. Product Catalogue */}
                <button
                  type="button"
                  onClick={() => handleNavClick('catalogue')}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    activeTab === 'catalogue'
                      ? 'bg-[#8C2E46] text-white font-semibold shadow-xs'
                      : 'text-[#2C2420] hover:bg-white bg-[#FAF7F2] border border-[#EAE2D5]/70'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Grid className={`w-4 h-4 ${activeTab === 'catalogue' ? 'text-white' : 'text-[#8C2E46]'}`} />
                    <span>Product Catalogue</span>
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    activeTab === 'catalogue' ? 'bg-white/20 text-white' : 'bg-[#FDEAF0] text-[#8C2E46] border border-[#FAD1DC]'
                  }`}>
                    9 Bedsheets
                  </span>
                </button>

                {/* 3. Customer Reviews */}
                <button
                  type="button"
                  onClick={() => handleNavClick('reviews')}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    activeTab === 'reviews'
                      ? 'bg-[#8C2E46] text-white font-semibold shadow-xs'
                      : 'text-[#2C2420] hover:bg-white bg-[#FAF7F2] border border-[#EAE2D5]/70'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                    <span>Customer Reviews</span>
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    activeTab === 'reviews' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    4.9 ★ Verified
                  </span>
                </button>

                {/* 4. Live Orders */}
                <button
                  type="button"
                  onClick={() => handleNavClick('orders')}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    activeTab === 'orders'
                      ? 'bg-[#2C2420] text-white font-semibold shadow-xs'
                      : 'text-[#2C2420] hover:bg-white bg-[#FAF7F2] border border-[#EAE2D5]/70'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Package className={`w-4 h-4 ${activeTab === 'orders' ? 'text-[#DEC89B]' : 'text-[#C29E57]'}`} />
                    <span>Live Orders</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Sync
                  </span>
                </button>

                {/* 5. Terms & Conditions (T&C) */}
                <button
                  type="button"
                  onClick={() => handleNavClick('tc')}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    activeTab === 'tc'
                      ? 'bg-[#8C2E46] text-white font-semibold shadow-xs'
                      : 'text-[#2C2420] hover:bg-white bg-[#FAF7F2] border border-[#EAE2D5]/70'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <FileText className={`w-4 h-4 ${activeTab === 'tc' ? 'text-white' : 'text-[#8C2E46]'}`} />
                    <span>Terms &amp; Conditions (T&amp;C)</span>
                  </span>
                  <span className="text-xs">🌸</span>
                </button>

                {/* 6. Our Story */}
                <button
                  type="button"
                  onClick={() => handleNavClick('story')}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    activeTab === 'story'
                      ? 'bg-[#2C2420] text-white font-semibold shadow-xs'
                      : 'text-[#2C2420] hover:bg-white bg-[#FAF7F2] border border-[#EAE2D5]/70'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <BookOpen className={`w-4 h-4 ${activeTab === 'story' ? 'text-[#DEC89B]' : 'text-[#7A6458]'}`} />
                    <span>Our Story &amp; Craft</span>
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 ${activeTab === 'story' ? 'text-[#DEC89B]' : 'text-[#A8988D]'}`} />
                </button>

                {/* 7. Store Studio Location */}
                <button
                  type="button"
                  onClick={() => handleNavClick('store')}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    activeTab === 'store'
                      ? 'bg-[#2C2420] text-white font-semibold shadow-xs'
                      : 'text-[#2C2420] hover:bg-white bg-[#FAF7F2] border border-[#EAE2D5]/70'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <MapPin className={`w-4 h-4 ${activeTab === 'store' ? 'text-[#DEC89B]' : 'text-[#C29E57]'}`} />
                    <span>Sector 46 Gurgaon Studio</span>
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 ${activeTab === 'store' ? 'text-[#DEC89B]' : 'text-[#A8988D]'}`} />
                </button>
              </div>

              {/* Store Owner Controls (if Owner Mode active) */}
              {isOwnerMode && (
                <div className="pt-2 space-y-1.5 border-t border-[#EAE2D5]">
                  <p className="px-1 text-[10px] font-bold text-[#8C2E46] uppercase tracking-wider flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3 h-3" />
                    <span>Store Management (Owner Mode)</span>
                  </p>

                  {onOpenAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenAdmin();
                      }}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#8C2E46] bg-[#FDEAF0] hover:bg-[#F9D3DE] border border-[#FAD1DC] flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-[#8C2E46]" />
                        <span>Admin Panel (Prices &amp; Stock)</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#8C2E46]" />
                    </button>
                  )}

                  {onOpenPhotoManager && (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenPhotoManager();
                      }}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C2420] bg-white hover:bg-[#FAF7F2] border border-[#DEC89B] flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-[#C29E57]" />
                        <span>Photo Studio (Upload Photos)</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#7A6458]" />
                    </button>
                  )}
                </div>
              )}

              {/* Direct Atelier Contact */}
              <div className="pt-3 border-t border-[#EAE2D5] space-y-2">
                <p className="px-1 text-[10px] font-bold text-[#8C7A70] uppercase tracking-wider">
                  Contact Studio
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={COMPANY_DETAILS.callUrl}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-2 text-xs font-semibold text-[#2C2420] bg-white hover:bg-[#F4EFE6] rounded-xl border border-[#EAE2D5] shadow-2xs text-center"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#C29E57]" />
                    <span>Call Studio</span>
                  </a>
                  <a
                    href={COMPANY_DETAILS.whatsappUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2.5 px-2 text-xs font-semibold text-white bg-[#8C2E46] hover:bg-[#732438] rounded-xl shadow-2xs text-center"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
                <p className="text-[10px] text-[#8C7A70] text-center pt-1">
                  Atelier located in Sector 46, Gurgaon · Open 10 AM – 8 PM
                </p>
              </div>

            </div>
          </aside>
        </div>
      )}
    </>
  );
};
