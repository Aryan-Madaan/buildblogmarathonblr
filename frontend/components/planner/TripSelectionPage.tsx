
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTripContext } from '../../context/TripContext';
import { TripCard } from './TripCard';
import { useTheme } from '../../context/ThemeContext';
import { SunIcon, MoonIcon, PlusIcon } from '../ui/Icons';
import { SuggestedDestinations } from './SuggestedDestinations';
import { Logo } from '../ui/Logo';

export const TripSelectionPage = () => {
  const { user, logout } = useAuth();
  const { trips, createTrip } = useTripContext();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop')" }}
      ></div>
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10"></div>

      <div className="relative z-20 p-4 sm:p-6 lg:p-8">
        <header className="flex justify-between items-center mb-8 max-w-7xl mx-auto">
          <Logo />
          <div className="flex items-center gap-4">
              <button 
                  onClick={toggleTheme}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                  aria-label="Toggle theme"
              >
                  {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
              </button>
              <button onClick={logout} className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Sign Out
              </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto">
          <div className="text-center my-12 md:my-16">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">Welcome, {user?.name}!</h1>
              <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">Ready for your next adventure?</p>
          </div>

          <div className="mb-16 text-center">
              <button 
                  onClick={() => createTrip('domestic', 'Custom Trip Plan')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-semibold rounded-full shadow-lg hover:bg-teal-700 transition-transform transform hover:scale-105"
              >
                  <PlusIcon className="w-5 h-5" />
                  Plan a Custom Trip
              </button>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">Have a specific idea? Start chatting with Safar right away.</p>
          </div>

          <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Get Inspired</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Start with one of these popular destinations.</p>
              <div className="space-y-12">
                  <div>
                      <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Domestic Trip Ideas</h3>
                      <SuggestedDestinations type="domestic" userLocation={user?.location || 'the United States'} />
                  </div>
                  <div>
                      <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">International Hotspots</h3>
                      <SuggestedDestinations type="international" userLocation={user?.location || 'the United States'} />
                  </div>
              </div>
          </div>

          <div>
              <h2 className="text-3xl font-semibold mb-6 text-gray-900 dark:text-white">Your Past Trips</h2>
              {trips.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {trips.map(trip => (
                    <TripCard key={trip.id} trip={trip} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white/50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                  <p className="text-gray-500 dark:text-gray-400">You haven't planned any trips yet.</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Start a new trip by picking an idea above!</p>
                </div>
              )}
          </div>
        </main>
      </div>
    </div>
  );
};
