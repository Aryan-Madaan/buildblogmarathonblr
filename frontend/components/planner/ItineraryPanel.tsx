
import React, { useMemo } from 'react';
import { useTripContext } from '../../context/TripContext';
import { MapView } from '../map/MapView';
import { ItineraryAction } from '../../types';
import { MapPinIcon, TicketIcon, BuildingOfficeIcon } from '../ui/Icons';

const parseActions = (messages: any[]): ItineraryAction[] => {
    const actions: ItineraryAction[] = [];
    const flightRegex = /\[BOOK_FLIGHT:"(.*?)"\]/g;
    const hotelRegex = /\[BOOK_HOTEL:"(.*?)"\]/g;

    messages.forEach(msg => {
        let match;
        while ((match = flightRegex.exec(msg.content)) !== null) {
            const label = match[1];
            actions.push({ type: 'FLIGHT', label, link: `https://www.google.com/search?q=flights+${encodeURIComponent(label)}` });
        }
        while ((match = hotelRegex.exec(msg.content)) !== null) {
            const label = match[1];
            actions.push({ type: 'HOTEL', label, link: `https://www.google.com/search?q=hotels+${encodeURIComponent(label)}` });
        }
    });
    // Deduplicate
    return actions.filter((action, index, self) =>
        index === self.findIndex((a) => (
            a.label === action.label && a.type === action.type
        ))
    );
};

export const ItineraryPanel = () => {
    const { activeTrip } = useTripContext();
    const actions = useMemo(() => parseActions(activeTrip?.messages || []), [activeTrip?.messages]);

    if (!activeTrip) return null;

    return (
        <div className="h-full bg-gray-100 dark:bg-gray-800 p-4 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Trip Dashboard</h2>
            
            <div className="h-64 mb-6">
                <MapView locations={activeTrip.locations} />
            </div>

            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><MapPinIcon className="w-5 h-5 text-teal-500" /> Suggested Locations</h3>
                    {activeTrip.locations.length > 0 ? (
                        <ul className="space-y-1 list-disc list-inside text-gray-700 dark:text-gray-300">
                            {activeTrip.locations.map(loc => <li key={loc.name}>{loc.name}</li>)}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No locations suggested yet.</p>
                    )}
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-3">Booking Actions</h3>
                    {actions.length > 0 ? (
                        <div className="space-y-2">
                            {actions.map((action, index) => (
                                <a 
                                    key={index} 
                                    href={action.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-sm"
                                >
                                    {action.type === 'FLIGHT' ? <TicketIcon className="w-5 h-5 text-teal-500 flex-shrink-0" /> : <BuildingOfficeIcon className="w-5 h-5 text-teal-500 flex-shrink-0" />}
                                    <span className="text-sm font-medium truncate" title={action.label}>Book {action.type.toLowerCase()}: {action.label}</span>
                                </a>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Ask Safar for flight or hotel ideas to see booking options here.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
