
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { GoogleIcon } from '../ui/Icons';
import { Logo } from '../ui/Logo';

export const LoginPage = () => {
  const { login, authStatus } = useAuth();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white overflow-hidden p-4">
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop')", opacity: 0.3 }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent z-10"></div>
      
      <div className="relative z-20 flex flex-col items-center text-center max-w-md w-full">
        <Logo className="mb-8 justify-center" />
        
        <div className="bg-gray-800/50 backdrop-blur-md p-8 rounded-2xl border border-gray-700 w-full">
            <h2 className="text-2xl font-bold text-white mb-6">Plan your next adventure</h2>
            
            <button
              onClick={() => login()}
              disabled={authStatus === 'loading'}
              className="w-full group relative flex items-center justify-center gap-3 px-6 py-3 bg-white text-gray-800 font-semibold rounded-lg shadow-lg overflow-hidden transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
              aria-label="Sign in with Google"
            >
              <GoogleIcon />
              Sign in with Google
            </button>
        </div>
      </div>
    </div>
  );
};
