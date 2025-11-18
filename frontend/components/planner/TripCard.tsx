
import React from 'react';
import { Trip } from '../../types';
import { useTripContext } from '../../context/TripContext';

interface TripCardProps {
  trip: Trip;
}

export const TripCard = ({ trip }: TripCardProps) => {
  const { selectTrip } = useTripContext();

  return (
    <div 
      onClick={() => selectTrip(trip.id)}
      className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 flex flex-col justify-between border border-gray-200 dark:border-gray-700 hover:border-teal-500 dark:hover:border-teal-500 cursor-pointer transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1"
    >
      <div>
        <h3 className="font-bold text-gray-900 dark:text-white truncate">{trip.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{trip.tripType} Trip</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Created on {new Date(trip.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="flex -space-x-2">
          {trip.participants.map((p, index) => (
            <img
              key={p.name + index}
              src={p.avatar}
              alt={p.name}
              title={p.name}
              className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800"
            />
          ))}
        </div>
        <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">{trip.messages.length} messages</span>
      </div>
    </div>
  );
};
