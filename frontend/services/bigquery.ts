
// --- MOCK BIGQUERY SERVICE ---
// This service simulates sending analytics events to BigQuery.
// In a real app, this would call a secure backend endpoint that forwards data to BigQuery.

import { Trip, User } from "../types";

interface TripCreationEvent {
    tripId: string;
    tripType: 'domestic' | 'international';
    creatorId: string; // In a real app, this would be a unique user ID
    creatorLocation: string;
    participantCount: number;
    timestamp: string;
}

export const logTripCreationEvent = (trip: Trip, user: User): void => {
    const event: TripCreationEvent = {
        tripId: trip.id,
        tripType: trip.tripType,
        creatorId: user.name, // Using name as a mock ID
        creatorLocation: user.location,
        participantCount: trip.participants.length,
        timestamp: new Date().toISOString(),
    };

    // In a real app, you would send this event to your backend.
    // For this simulation, we'll just log it to the console.
    console.log("🚀 [BigQuery Event Simulated] Trip Creation:", event);
};
