
import React, { createContext, useState, useContext, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { googleLogout, useGoogleLogin, CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { User } from '../types';
import { LOCAL_STORAGE_KEY_USER, LOCAL_STORAGE_KEY_TRIPS } from '../constants';
import * as db from '../services/firestore';
import * as analytics from '../services/bigquery';
import { Spinner } from '../components/ui/Icons';

interface GoogleProfile {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isOnboardingComplete: boolean;
  login: () => void;
  logout: () => void;
  completeOnboarding: (details: Omit<User, 'name' | 'avatar'>) => void;
  authStatus: 'loading' | 'authenticated' | 'unauthenticated';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  useEffect(() => {
    const checkUser = async () => {
      const { exists, data } = await db.getDoc(LOCAL_STORAGE_KEY_USER);
      if (exists && data) {
        setUser(data);
        setAuthStatus('authenticated');
      } else {
        setAuthStatus('unauthenticated');
      }
    };
    checkUser();
  }, []);

  const handleLoginSuccess = useCallback(async (tokenResponse: Omit<CredentialResponse, 'clientId'>) => {
    try {
        const decoded: GoogleProfile = jwtDecode(tokenResponse.credential);
        
        // Check if user exists in our DB
        const { exists, data } = await db.getDoc(`${LOCAL_STORAGE_KEY_USER}_${decoded.sub}`);
        
        if (exists && data) {
            setUser(data);
        } else {
            // New user, needs onboarding
            const partialUser: User = {
                name: decoded.name,
                avatar: decoded.picture,
                age: 0, // To be filled in onboarding
                location: '', // To be filled in onboarding
                hasPassport: false, // Default
            };
            setUser(partialUser);
        }
        setAuthStatus('authenticated');
    } catch (error) {
        console.error("Login failed:", error);
        setAuthStatus('unauthenticated');
    }
  }, []);

  const login = useGoogleLogin({
    onSuccess: handleLoginSuccess,
    onError: (error) => console.error('Login Failed:', error)
  });

  const isOnboardingComplete = useMemo(() => !!user && !!user.location && user.age > 0, [user]);
  const isAuthenticated = authStatus === 'authenticated';

  const logout = useCallback(() => {
    googleLogout();
    setAuthStatus('unauthenticated');
    setUser(null);
    db.setDoc(LOCAL_STORAGE_KEY_USER, null); // Clear the generic user key
    // In a real app, you'd have a user-specific key to clear
    db.setDoc(LOCAL_STORAGE_KEY_TRIPS, null);
    window.location.reload();
  }, []);

  const completeOnboarding = useCallback(async (details: Omit<User, 'name' | 'avatar'>) => {
    if (!user) return;
    const fullUser: User = {
      ...user,
      ...details,
    };
    
    // In a real app, the key would be based on a unique user ID from the token (e.g., `sub`)
    await db.setDoc(LOCAL_STORAGE_KEY_USER, fullUser);
    setUser(fullUser);
    analytics.logUserProfile(fullUser);
  }, [user]);

  if (authStatus === 'loading') {
    return <div className="h-screen w-screen flex items-center justify-center bg-gray-900"><Spinner className="w-8 h-8 text-white" /></div>
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isOnboardingComplete, login, logout, completeOnboarding, authStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
