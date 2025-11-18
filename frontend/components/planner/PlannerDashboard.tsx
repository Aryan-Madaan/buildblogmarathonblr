
import React, { useEffect } from 'react';
import { ChatWindow } from '../chat/ChatWindow';
import { ItineraryPanel } from './ItineraryPanel';
import { useTripContext } from '../../context/TripContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ArrowLeftIcon, SunIcon, MoonIcon } from '../ui/Icons';

// A mock geocoding function. In a real app, use the Google Geocoding API.
const geocodeLocation = async (locationName: string) => {
    if (!window.google || !window.google.maps.places) {
        console.error("Google Places API not available.");
        return null;
    }
    const geocoder = new window.google.maps.Geocoder();
    return new Promise((resolve) => {
        geocoder.geocode({ address: locationName }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
                const { lat, lng } = results[0].geometry.location;
                resolve({ name: locationName, lat: lat(), lng: lng() });
            } else {
                console.error(`Geocode was not successful for the following reason: ${status}`);
                resolve(null);
            }
        });
    });
};

export const PlannerDashboard = () => {
  const { logout } = useAuth();
  const { activeTrip, selectTrip, addLocationToActiveTrip } = useTripContext();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (!activeTrip) return;
    const lastMessage = activeTrip.messages[activeTrip.messages.length - 1];
    if (lastMessage?.author === 'ai' && lastMessage.content) {
      const locationRegex = /📍\s*\*\*(.*?)\*\*/g;
      let match;
      while ((match = locationRegex.exec(lastMessage.content)) !== null) {
        const locationName = match[1];
        geocodeLocation(locationName).then(location => {
          if (location) {
            addLocationToActiveTrip(location);
          }
        });
      }
    }
  }, [activeTrip?.messages, addLocationToActiveTrip]);

  return (
    <div className="h-screen w-screen flex bg-white dark:bg-gray-900">
        <aside className="flex flex-col items-center bg-gray-100 dark:bg-gray-800 p-2 border-r border-gray-200 dark:border-gray-700">
            <button 
                onClick={() => selectTrip(null)} 
                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white rounded-md transition-colors"
                aria-label="Back to all trips"
                title="Back to all trips"
            >
                <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <div className="flex-grow"></div>
            <button 
                onClick={toggleTheme}
                className="p-2 mb-2 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white rounded-md transition-colors"
                aria-label="Toggle theme"
                title="Toggle theme"
            >
                {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
            </button>
            <button onClick={logout} className="text-xs text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors mb-2">
                Sign Out
            </button>
        </aside>
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 gap-px bg-gray-300 dark:bg-gray-700 overflow-hidden">
            <div className="lg:col-span-2 xl:col-span-2 h-full">
                <ChatWindow />
            </div>
            <div className="hidden lg:block h-full">
                <ItineraryPanel />
            </div>
        </main>
    </div>
  );
};
