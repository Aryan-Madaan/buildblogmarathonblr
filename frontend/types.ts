
export interface User {
  name: string;
  age: number;
  location: string;
  hasPassport: boolean;
  avatar: string; // URL to avatar image
}

export type MessageAuthor = 'user' | 'ai' | 'system';

export interface Message {
  id: string;
  author: MessageAuthor;
  content: string;
  authorName: string;
  authorAvatar: string;
}

export interface LocationSuggestion {
  name: string;
  lat: number;
  lng: number;
}

export interface Trip {
  id: string;
  title: string;
  tripType: 'domestic' | 'international';
  participants: User[];
  messages: Message[];
  locations: LocationSuggestion[];
  createdAt: string;
}

export interface ItineraryAction {
    type: 'FLIGHT' | 'HOTEL';
    label: string;
    link: string;
}

export type Theme = 'light' | 'dark';
