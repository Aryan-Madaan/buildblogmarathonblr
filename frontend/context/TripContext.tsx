
import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { Trip, User, Message, LocationSuggestion } from '../types';
import { LOCAL_STORAGE_KEY_TRIPS } from '../constants';
import { useAuth } from './AuthContext';
import * as db from '../services/firestore';
import * as analytics from '../services/bigquery';

interface TripContextType {
  trips: Trip[];
  activeTrip: Trip | null;
  createTrip: (tripType: 'domestic' | 'international', title?: string) => void;
  selectTrip: (tripId: string | null) => void;
  addMessageToActiveTrip: (message: Message) => void;
  addLocationToActiveTrip: (location: LocationSuggestion) => void;
  addParticipantToTrip: (tripId: string, user: User) => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTripId, setActiveTripId] = useState<string | null>(null);

  useEffect(() => {
    const loadTrips = async () => {
      const { exists, data } = await db.getDoc(LOCAL_STORAGE_KEY_TRIPS);
      if (exists && Array.isArray(data)) {
        setTrips(data);
      }
    };
    if (user) {
        loadTrips();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
        db.setDoc(LOCAL_STORAGE_KEY_TRIPS, trips);
    }
  }, [trips, user]);

  const createTrip = useCallback((tripType: 'domestic' | 'international', title?: string) => {
    if (!user) return;
    const newTrip: Trip = {
      id: `trip_${Date.now()}`,
      title: title || `New ${tripType} trip`,
      tripType,
      participants: [user],
      messages: [],
      locations: [],
      createdAt: new Date().toISOString(),
    };
    setTrips(prev => [newTrip, ...prev]);
    setActiveTripId(newTrip.id);
    // Log analytics event
    analytics.logTripCreationEvent(newTrip, user);
  }, [user]);

  const selectTrip = useCallback((tripId: string | null) => {
    setActiveTripId(tripId);
  }, []);

  const activeTrip = useMemo(() => {
    return trips.find(trip => trip.id === activeTripId) || null;
  }, [trips, activeTripId]);

  const updateTrip = useCallback((tripId: string, updatedData: Partial<Trip>) => {
    setTrips(prev => prev.map(trip => 
      trip.id === tripId ? { ...trip, ...updatedData } : trip
    ));
  }, []);

  const addMessageToActiveTrip = useCallback((message: Message) => {
    if (!activeTripId) return;
    const currentTrip = trips.find(t => t.id === activeTripId);
    if (!currentTrip) return;

    const existingIndex = currentTrip.messages.findIndex(m => m.id === message.id);
    let newMessages;
    if (existingIndex > -1) {
        newMessages = [...currentTrip.messages];
        newMessages[existingIndex] = message;
    } else {
        newMessages = [...currentTrip.messages, message];
    }
    updateTrip(activeTripId, { messages: newMessages });
  }, [activeTripId, trips, updateTrip]);

  const addLocationToActiveTrip = useCallback((location: LocationSuggestion) => {
    if (!activeTripId) return;
    const currentTrip = trips.find(t => t.id === activeTripId);
    if (!currentTrip) return;

    if (!currentTrip.locations.some(l => l.name === location.name)) {
      updateTrip(activeTripId, { locations: [...currentTrip.locations, location] });
    }
  }, [activeTripId, trips, updateTrip]);

  const addParticipantToTrip = useCallback((tripId: string, participant: User) => {
    const tripToUpdate = trips.find(t => t.id === tripId);
    if (tripToUpdate && !tripToUpdate.participants.some(p => p.name === participant.name)) {
      updateTrip(tripId, { participants: [...tripToUpdate.participants, participant] });
    }
  }, [trips, updateTrip]);

  const value = {
    trips,
    activeTrip,
    createTrip,
    selectTrip,
    addMessageToActiveTrip,
    addLocationToActiveTrip,
    addParticipantToTrip,
    updateActiveTrip: (data: Partial<Trip>) => activeTripId && updateTrip(activeTripId, data),
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
};

export const useTripContext = () => {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error('useTripContext must be used within a TripProvider');
  }
  return context;
};
