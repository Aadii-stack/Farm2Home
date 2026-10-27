import React, { useState, lazy, Suspense } from 'react';
import { ReactLenis } from 'lenis/react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/layout/Navbar';
import { CartDrawer } from './components/cart/CartDrawer';
import { ProductDetailModal } from './components/marketplace/ProductDetailModal';
import { HomePage } from './pages/HomePage';
import { Product } from './types';

// Route-based and modal-based code splitting for peak performance
const MarketplacePage = lazy(() =>
  import('./pages/MarketplacePage').then((m) => ({ default: m.MarketplacePage }))
);
const FarmersPage = lazy(() =>
  import('./pages/FarmersPage').then((m) => ({ default: m.FarmersPage }))
);
const HowItWorksPage = lazy(() =>
  import('./pages/HowItWorksPage').then((m) => ({ default: m.HowItWorksPage }))
);
const FarmerDashboard = lazy(() =>
  import('./pages/FarmerDashboard').then((m) => ({ default: m.FarmerDashboard }))
);
const ConsumerDashboard = lazy(() =>
  import('./pages/ConsumerDashboard').then((m) => ({ default: m.ConsumerDashboard }))
);
const AdminDashboard = lazy(() =>
  import('./pages/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);
const AuthPage = lazy(() =>
  import('./pages/AuthPage').then((m) => ({ default: m.AuthPage }))
);
const CheckoutModal = lazy(() =>
  import('./components/checkout/CheckoutModal').then((m) => ({ default: m.CheckoutModal }))
);
const SetupGuideModal = lazy(() =>
  import('./components/common/SetupGuideModal').then((m) => ({ default: m.SetupGuideModal }))
);

// Lightweight farm-themed suspense loader
const PageFallback: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center space-y-3 min-h-[50vh]">
    <div className="w-10 h-10 rounded-full border-3 border-farm-200 border-t-farm-800 animate-spin" />
    <p className="text-xs font-semibold text-farm-800 animate-pulse">Loading Mira Bhayandar harvest data...</p>
  </div>
);

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [marketplaceFilter, setMarketplaceFilter] = useState<{
    search?: string;
    farmerId?: string;
  }>({});

  // Modals state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);

  const handleNavigate = (tab: string, filterParams?: any) => {
    if (filterParams) {
      setMarketplaceFilter(filterParams);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleOrderSuccess = (orderId: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('farm2home:order_placed', { detail: { orderId } })
      );
    }
    setActiveTab('consumer-dashboard');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 flex flex-col font-sans">
      {/* Sticky Header with Context Bar and Nav */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavigate}
        onOpenSetupModal={() => setIsSetupModalOpen(true)}
      />

      {/* Main Content Area with Suspense boundary */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onOpenProductDetail={setSelectedProductDetail}
          />
        )}

        <Suspense fallback={<PageFallback />}>
          {activeTab === 'marketplace' && (
            <MarketplacePage
              initialSearch={marketplaceFilter.search || ''}
              initialFarmerId={marketplaceFilter.farmerId || ''}
              onOpenProductDetail={setSelectedProductDetail}
            />
          )}

          {activeTab === 'farmers' && (
            <FarmersPage
              onNavigateToFarmerProducts={(farmerId) =>
                handleNavigate('marketplace', { farmerId })
              }
            />
          )}

          {activeTab === 'how-it-works' && <HowItWorksPage onNavigate={handleNavigate} />}

          {activeTab === 'farmer-dashboard' && <FarmerDashboard />}

          {activeTab === 'consumer-dashboard' && <ConsumerDashboard />}

          {activeTab === 'admin-dashboard' && <AdminDashboard />}

          {activeTab === 'auth' && <AuthPage onSuccess={handleNavigate} />}

          {/* Checkout Modal (Dynamic on demand) */}
          {isCheckoutOpen && (
            <CheckoutModal
              isOpen={isCheckoutOpen}
              onClose={() => setIsCheckoutOpen(false)}
              onOrderSuccess={handleOrderSuccess}
            />
          )}

          {/* Supabase PostgreSQL Configuration Guide Modal (Dynamic on demand) */}
          {isSetupModalOpen && (
            <SetupGuideModal
              isOpen={isSetupModalOpen}
              onClose={() => setIsSetupModalOpen(false)}
            />
          )}
        </Suspense>
      </main>

      {/* Global Slide-over Cart Drawer */}
      <CartDrawer onProceedToCheckout={() => setIsCheckoutOpen(true)} />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProductDetail}
        onClose={() => setSelectedProductDetail(null)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.2, smoothWheel: true, syncTouch: false }}>
      <AuthProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </AuthProvider>
    </ReactLenis>
  );
}
