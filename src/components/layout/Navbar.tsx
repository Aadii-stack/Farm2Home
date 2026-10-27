import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  User,
  MapPin,
  Menu,
  X,
  Sprout,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { UserRole } from '../../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSetupModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const { user, role, loginAsDemoRole, signOut } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const handleRoleChange = (newRole: UserRole) => {
    loginAsDemoRole(newRole);
    setRoleDropdownOpen(false);
    if (newRole === 'farmer') setActiveTab('farmer-dashboard');
    else if (newRole === 'admin') setActiveTab('admin-dashboard');
    else setActiveTab('consumer-dashboard');
  };

  const dashboardTabId =
    role === 'farmer'
      ? 'farmer-dashboard'
      : role === 'admin'
      ? 'admin-dashboard'
      : 'consumer-dashboard';

  const dashboardLabel =
    role === 'farmer'
      ? 'Farmer Dashboard'
      : role === 'admin'
      ? 'Admin Dashboard'
      : 'Dashboard';

  const navTabs = user
    ? [
        { id: 'marketplace', label: 'Marketplace' },
        { id: dashboardTabId, label: dashboardLabel },
      ]
    : [
        { id: 'home', label: 'Home' },
        { id: 'marketplace', label: 'Marketplace' },
        { id: 'farmers', label: 'Local Farmers' },
        { id: 'how-it-works', label: 'How It Works' },
      ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-farm-100 shadow-xs">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Tagline */}
          <div
            onClick={() => setActiveTab(user ? 'marketplace' : 'home')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-farm-700 to-farm-900 flex items-center justify-center text-white shadow-md shadow-farm-900/10 group-hover:scale-105 transition duration-200">
              <Sprout className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-2xl tracking-tight text-farm-950">
                  Farm<span className="text-farm-600">2</span>Home
                </span>
                <span className="text-[10px] bg-emerald-100 text-farm-800 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  MH-04
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
                Fresh from Local Farms, Delivered to Your Home
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-farm-50/80 p-1.5 rounded-full border border-farm-100 relative">
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-150 motion-reduce:transition-none ${
                    isActive ? 'text-white' : 'text-slate-700 hover:text-farm-950'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      className="absolute inset-0 bg-farm-800 rounded-full shadow-xs"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Actions & Role Switcher */}
          <div className="flex items-center gap-3">
            {/* Locality Badge */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <MapPin className="w-3.5 h-3.5 text-farm-600" />
              <span>Mira Bhayandar</span>
            </div>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-full bg-farm-50 text-farm-800 hover:bg-farm-100 border border-farm-200 transition-all duration-150 active:scale-95 motion-reduce:transform-none focus:outline-hidden focus:ring-2 focus:ring-farm-500"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5 transition-transform duration-150 group-hover:scale-105 motion-reduce:transform-none" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-earth-600 text-white text-[11px] font-bold flex items-center justify-center shadow-xs transition-transform duration-200 ease-out animate-in fade-in zoom-in-75 motion-reduce:animate-none">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Role & Dashboard Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-farm-50 hover:bg-farm-100 border border-farm-200 text-xs font-semibold text-farm-900 transition-colors duration-150"
              >
                <div className="w-6 h-6 rounded-full bg-farm-700 text-white flex items-center justify-center text-xs">
                  {role === 'farmer' ? '🚜' : role === 'admin' ? '⚡' : '🛒'}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-[10px] text-slate-500 font-normal uppercase leading-none">Role</p>
                  <p className="capitalize font-bold text-farm-900 leading-tight">
                    {role === 'consumer' ? 'Consumer' : role === 'farmer' ? 'Farmer' : 'Admin'}
                  </p>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ease-out motion-reduce:transition-none ${
                    roleDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 ease-out motion-reduce:animate-none origin-top-right">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs text-slate-400 font-medium">Logged in as</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.full_name}</p>
                    <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-farm-800 font-semibold uppercase">
                      {role}
                    </span>
                  </div>

                  <div className="py-1">
                    <p className="px-4 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Switch Role Mode
                    </p>
                    <button
                      onClick={() => handleRoleChange('consumer')}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-farm-50 ${
                        role === 'consumer' ? 'bg-farm-50 text-farm-800 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <span>🛒 Consumer (Aaditya)</span>
                      {role === 'consumer' && <span className="text-farm-600">✓</span>}
                    </button>
                    <button
                      onClick={() => handleRoleChange('farmer')}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-farm-50 ${
                        role === 'farmer' ? 'bg-farm-50 text-farm-800 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <span>🚜 Farmer (Bhaskar Patil, Uttan)</span>
                      {role === 'farmer' && <span className="text-farm-600">✓</span>}
                    </button>
                    <button
                      onClick={() => handleRoleChange('admin')}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-farm-50 ${
                        role === 'admin' ? 'bg-farm-50 text-farm-800 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <span>⚡ Platform Admin</span>
                      {role === 'admin' && <span className="text-farm-600">✓</span>}
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    {role === 'consumer' && (
                      <button
                        onClick={() => {
                          setActiveTab('consumer-dashboard');
                          setRoleDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-farm-700 font-semibold hover:bg-farm-50 flex items-center justify-between"
                      >
                        <span>Consumer Dashboard</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {role === 'farmer' && (
                      <button
                        onClick={() => {
                          setActiveTab('farmer-dashboard');
                          setRoleDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-farm-700 font-semibold hover:bg-farm-50 flex items-center justify-between"
                      >
                        <span>Farmer Dashboard</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {role === 'admin' && (
                      <button
                        onClick={() => {
                          setActiveTab('admin-dashboard');
                          setRoleDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-farm-700 font-semibold hover:bg-farm-50 flex items-center justify-between"
                      >
                        <span>Admin Oversight Desk</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setActiveTab('auth');
                        setRoleDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 flex items-center justify-between"
                    >
                      <span>Login / Register New Account</span>
                    </button>
                    {user && (
                      <button
                        onClick={() => {
                          signOut();
                          setActiveTab('marketplace');
                          setRoleDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center justify-between border-t border-slate-100"
                      >
                        <span>Sign Out</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:text-farm-900 transition-colors duration-150 rounded-lg active:scale-95 motion-reduce:transform-none"
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-farm-100 bg-white px-4 pt-3 pb-6 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200 ease-out motion-reduce:animate-none">
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-3 py-2 text-sm font-semibold rounded-lg transition-colors duration-150 ${
                activeTab === tab.id
                  ? 'bg-farm-800 text-white font-bold'
                  : 'hover:bg-farm-50 text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                handleRoleChange('consumer');
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 text-sm font-bold text-slate-800 bg-slate-50 rounded-lg transition-colors duration-150"
            >
              🛒 Switch to Consumer Mode
            </button>
            <button
              onClick={() => {
                handleRoleChange('farmer');
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 text-sm font-bold text-slate-800 bg-slate-50 rounded-lg transition-colors duration-150"
            >
              🚜 Switch to Farmer Mode
            </button>
            <button
              onClick={() => {
                handleRoleChange('admin');
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 text-sm font-bold text-slate-800 bg-slate-50 rounded-lg transition-colors duration-150"
            >
              ⚡ Switch to Admin Mode
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
