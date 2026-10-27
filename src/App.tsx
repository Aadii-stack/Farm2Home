import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/layout/Navbar';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { ProductDetailModal } from './components/marketplace/ProductDetailModal';
import { SetupGuideModal } from './components/common/SetupGuideModal';

import { HomePage } from './pages/HomePage';
import { MarketplacePage } from './pages/MarketplacePage';
import { FarmersPage } from './pages/FarmersPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { FarmerDashboard } from './pages/FarmerDashboard';
import { ConsumerDashboard } from './pages/ConsumerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AuthPage } from './pages/AuthPage';

import { Product } from './types';

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (orderId: string) => {
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

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onOpenProductDetail={setSelectedProductDetail}
          />
        )}

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
      </main>

      {/* Global Slide-over Cart Drawer */}
      <CartDrawer onProceedToCheckout={() => setIsCheckoutOpen(true)} />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProductDetail}
        onClose={() => setSelectedProductDetail(null)}
      />

      {/* Supabase PostgreSQL Configuration Guide Modal */}
      <SetupGuideModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}
