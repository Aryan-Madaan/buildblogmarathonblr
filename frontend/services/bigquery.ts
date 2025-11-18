
// --- MOCK BIGQUERY SERVICE ---
// This service simulates sending analytics events to BigQuery.
// In a real app, this would call a secure backend endpoint that forwards data to BigQuery.

import { Trip, User, Message } from "../types";

// --- TABLE DEFINITIONS ---

/**
 * TABLE: trip_creations
 * DESCRIPTION: Logs each time a new trip planning session is initiated.
 * SCHEMA:
 *   - tripId: STRING (ID of the trip)
 *   - tripType: STRING ('domestic' or 'international')
 *   - creatorId: STRING (Unique ID of the user who created the trip)
 *   - creatorLocation: STRING (Home location of the creator)
 *   - participantCount: INTEGER (Initial number of participants, usually 1)
 *   - timestamp: TIMESTAMP (When the event occurred)
 */
interface TripCreationEvent {
    tripId: string;
    tripType: 'domestic' | 'international';
    creatorId: string;
    creatorLocation: string;
    participantCount: number;
    timestamp: string;
}

/**
 * TABLE: user_profiles
 * DESCRIPTION: Stores user profile information upon onboarding.
 * SCHEMA:
 *   - userId: STRING (Unique ID for the user, using name for mock)
 *   - age: INTEGER
 *   - location: STRING
 *   - hasPassport: BOOLEAN
 *   - signupTimestamp: TIMESTAMP
 */
interface UserProfileEvent {
    userId: string;
    age: number;
    location: string;
    hasPassport: boolean;
    signupTimestamp: string;
}

/**
 * TABLE: chat_messages
 * DESCRIPTION: Logs every message sent in a trip chat for analysis.
 * SCHEMA:
 *   - messageId: STRING
 *   - tripId: STRING
 *   - authorId: STRING
 *   - authorType: STRING ('user', 'ai', 'system')
 *   - messageLength: INTEGER
 *   - timestamp: TIMESTAMP
 */
interface ChatMessageEvent {
    messageId: string;
    tripId: string;
    authorId: string;
    authorType: 'user' | 'ai' | 'system';
    messageLength: number;
    timestamp: string;
}


// --- MOCK LOGGING FUNCTIONS ---

export const logTripCreationEvent = (trip: Trip, user: User): void => {
    const event: TripCreationEvent = {
        tripId: trip.id,
        tripType: trip.tripType,
        creatorId: user.name, // Using name as a mock ID
        creatorLocation: user.location,
        participantCount: trip.participants.length,
        timestamp: new Date().toISOString(),
    };
    console.log("🚀 [BigQuery Event Simulated] Table: trip_creations", event);
};

export const logUserProfile = (user: User): void => {
    const event: UserProfileEvent = {
        userId: user.name, // Using name as a mock ID
        age: user.age,
        location: user.location,
        hasPassport: user.hasPassport,
        signupTimestamp: new Date().toISOString(),
    };
    console.log("🚀 [BigQuery Event Simulated] Table: user_profiles", event);
};

export const logChatMessage = (message: Message, tripId: string): void => {
    const event: ChatMessageEvent = {
        messageId: message.id,
        tripId: tripId,
        authorId: message.authorName,
        authorType: message.author,
        messageLength: message.content.length,
        timestamp: new Date().toISOString(),
    };
    console.log("🚀 [BigQuery Event Simulated] Table: chat_messages", event);
};
