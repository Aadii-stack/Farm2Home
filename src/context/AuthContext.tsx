import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, FarmerProfile, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { demoDb, api } from '../services/api';

interface AuthContextType {
  user: Profile | null;
  farmerProfile: FarmerProfile | null;
  role: UserRole;
  isLiveSupabase: boolean;
  loginAsDemoRole: (role: UserRole, specificFarmerId?: string) => void;
  signIn: (phoneOrEmail: string, role?: UserRole) => Promise<void>;
  signUp: (data: {
    fullName: string;
    phone: string;
    role: UserRole;
    farmName?: string;
    locality?: string;
    farmAddress?: string;
  }) => Promise<void>;
  signOut: () => void;
  refreshFarmerProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to consumer profile in demo mode for instant accessibility
  const [user, setUser] = useState<Profile | null>(() => {
    const saved = localStorage.getItem('f2h_active_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return demoDb.profiles[0];
      }
    }
    return demoDb.profiles[0]; // Default consumer
  });

  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile | null>(() => {
    const saved = localStorage.getItem('f2h_active_farmer');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const role: UserRole = user?.role || 'consumer';

  useEffect(() => {
    if (user) {
      localStorage.setItem('f2h_active_user', JSON.stringify(user));
      if (user.role === 'farmer') {
        const fp = demoDb.farmers.find((f) => f.user_id === user.id) || demoDb.farmers[0];
        setFarmerProfile(fp);
        localStorage.setItem('f2h_active_farmer', JSON.stringify(fp));
      } else {
        setFarmerProfile(null);
        localStorage.removeItem('f2h_active_farmer');
      }
    } else {
      localStorage.removeItem('f2h_active_user');
      localStorage.removeItem('f2h_active_farmer');
      setFarmerProfile(null);
    }
  }, [user]);

  const refreshFarmerProfile = async () => {
    if (user?.role === 'farmer') {
      const fp = await api.getFarmerByUserId(user.id);
      if (fp) {
        setFarmerProfile(fp);
        localStorage.setItem('f2h_active_farmer', JSON.stringify(fp));
      }
    }
  };

  const loginAsDemoRole = (targetRole: UserRole, specificFarmerId?: string) => {
    if (targetRole === 'consumer') {
      const consumer = demoDb.profiles.find((p) => p.role === 'consumer') || demoDb.profiles[0];
      setUser(consumer);
      setFarmerProfile(null);
    } else if (targetRole === 'farmer') {
      const targetFarmer = specificFarmerId
        ? demoDb.farmers.find((f) => f.id === specificFarmerId)
        : demoDb.farmers[0];
      if (targetFarmer) {
        const farmerUser = demoDb.profiles.find((p) => p.id === targetFarmer.user_id) || {
          id: targetFarmer.user_id,
          full_name: 'Bhaskar Patil',
          phone: '+91 98202 23456',
          role: 'farmer' as UserRole,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setUser(farmerUser);
        setFarmerProfile(targetFarmer);
      }
    } else if (targetRole === 'admin') {
      const admin = demoDb.profiles.find((p) => p.role === 'admin') || demoDb.profiles[4];
      setUser(admin);
      setFarmerProfile(null);
    }
  };

  const signIn = async (phoneOrEmail: string, targetRole: UserRole = 'consumer') => {
    if (isSupabaseConfigured && supabase) {
      // In live Supabase mode, attempt auth signInWithPassword or signInWithOtp
      const { data, error } = await supabase.auth.signInWithPassword({
        email: phoneOrEmail,
        password: 'Password123!', // Standard demonstration password
      });
      if (!error && data.user) {
        // Query profile
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
        if (prof) {
          setUser(prof as Profile);
          return;
        }
      }
    }

    // Demo Mode fallback lookup by phone or name or role
    const found = demoDb.profiles.find(
      (p) => p.phone === phoneOrEmail || p.full_name.toLowerCase() === phoneOrEmail.toLowerCase()
    );
    if (found) {
      setUser(found);
    } else {
      loginAsDemoRole(targetRole);
    }
  };

  const signUp = async (data: {
    fullName: string;
    phone: string;
    role: UserRole;
    farmName?: string;
    locality?: string;
    farmAddress?: string;
  }) => {
    const newUserId = 'usr-' + Date.now();
    const newProfile: Profile = {
      id: newUserId,
      full_name: data.fullName,
      phone: data.phone,
      role: data.role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    demoDb.profiles.push(newProfile);

    if (data.role === 'farmer') {
      const newFarmer: FarmerProfile = {
        id: 'farmer-' + Date.now(),
        user_id: newUserId,
        farm_name: data.farmName || `${data.fullName}'s Farm`,
        description: 'Authentic local farming collective near Mira Bhayandar.',
        locality: data.locality || 'Uttan',
        address: data.farmAddress || 'Bhayandar Coastal Farmland',
        latitude: 19.28 + (Math.random() - 0.5) * 0.04,
        longitude: 72.80 + (Math.random() - 0.5) * 0.04,
        verification_status: 'verified', // Auto-verify for demo convenience
        created_at: new Date().toISOString(),
      };
      demoDb.farmers.push(newFarmer);
      setFarmerProfile(newFarmer);
    }

    demoDb.persist();
    setUser(newProfile);
  };

  const signOut = () => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut();
    }
    setUser(null);
    setFarmerProfile(null);
    localStorage.removeItem('f2h_active_user');
    localStorage.removeItem('f2h_active_farmer');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        farmerProfile,
        role,
        isLiveSupabase: isSupabaseConfigured,
        loginAsDemoRole,
        signIn,
        signUp,
        signOut,
        refreshFarmerProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
