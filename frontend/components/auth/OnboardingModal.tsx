
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export const OnboardingModal = () => {
  const { completeOnboarding } = useAuth();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [hasPassport, setHasPassport] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && age && location) {
      completeOnboarding({
        name,
        age: parseInt(age, 10),
        location,
        hasPassport,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 dark:bg-gray-900/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md m-4 transform transition-all duration-300 scale-95 animate-fade-in">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome!</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Let's get to know you a little better to personalize your plans.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">What should we call you?</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="e.g., Alex"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Age</label>
              <input
                type="number"
                id="age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="28"
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Home City</label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="New York"
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-gray-700 dark:text-gray-300">Do you have a valid passport?</span>
            <label htmlFor="passport-toggle" className="inline-flex relative items-center cursor-pointer">
              <input type="checkbox" id="passport-toggle" className="sr-only peer" checked={hasPassport} onChange={() => setHasPassport(!hasPassport)} />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>
          <button
            type="submit"
            className="w-full mt-4 bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors duration-300 disabled:bg-gray-400 dark:disabled:bg-gray-500"
            disabled={!name || !age || !location}
          >
            Let's Start Planning!
          </button>
        </form>
      </div>
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};
