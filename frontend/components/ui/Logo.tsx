
import React from 'react';

export const Logo = ({ className }: { className?: string }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <svg width="48" height="48" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#fbbf24', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#f97316', stopOpacity: 1 }} />
        </linearGradient>
        <clipPath id="pinClip">
          <path d="M50 0C27.9 0 10 17.9 10 40c0 22.5 40 60 40 60s40-37.5 40-60C90 17.9 72.1 0 50 0Z" />
        </clipPath>
      </defs>
      
      <path d="M50 0C27.9 0 10 17.9 10 40c0 22.5 40 60 40 60s40-37.5 40-60C90 17.9 72.1 0 50 0Z" fill="url(#skyGradient)" />
      
      <g clipPath="url(#pinClip)">
        <path d="M15 60 l15 -15 l20 10 l25 -15 l0 30 H15 Z" fill="#0c4a6e" />
        <circle cx="68" cy="25" r="8" fill="#fcd34d" />
        
        <path d="M20 80 C 40 60, 60 60, 80 80 L 85 90 C 60 75, 40 75, 15 90 Z" fill="#60a5fa" opacity="0.7" />
        
        <path d="M35 65 l-10 5 l15 10 l20 -5 l15 5 l5 -15 l-15 -5 l-20 5 l-15 -5 Z" fill="#075985" />
        <path d="M38 63 l15 10 l20 -5 l-3 -10 l-17 5 Z" fill="#e0f2fe" />
        
        <path d="M25 75 C 40 65, 60 65, 75 75" stroke="#93c5fd" strokeWidth="3" fill="none" />
        <path d="M20 80 C 35 70, 65 70, 80 80" stroke="#93c5fd" strokeWidth="3" fill="none" />
        
        <path d="M30 25 l15 10 l5 -5 l-15 -10 Z" fill="#0c4a6e" />
        <path d="M32 27 l-5 2 l15 10 l5 -2 Z" fill="#0c4a6e" />
      </g>
    </svg>
    <div className="flex flex-col">
        <span className="font-display font-bold text-2xl tracking-wider text-orange-500">SAFAR SAR</span>
        <span className="text-xs text-gray-500 dark:text-gray-400 tracking-widest">FROM PLANS TO MEMORIES</span>
    </div>
  </div>
);
