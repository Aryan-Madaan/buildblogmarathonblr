
import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Spinner } from '../ui/Icons';
import { useTripContext } from '../../context/TripContext';
import { GEMINI_API_KEY } from '../../constants';

interface SuggestedDestinationsProps {
  type: 'domestic' | 'international';
  userLocation: string;
}

interface Destination {
  name: string;
  description: string;
  imageKeyword: string;
}

const API_KEY = GEMINI_API_KEY;

const DestinationImage = ({ keyword, alt }: { keyword: string; alt: string }) => {
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
    const imageUrl = `https://source.unsplash.com/400x300/?${encodeURIComponent(keyword)}`;

    return (
        <div className="relative w-full h-40 bg-gray-200 dark:bg-gray-700 group-hover:scale-105 transition-transform duration-300 rounded-t-lg overflow-hidden">
            {status === 'loading' && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                    <Spinner className="w-6 h-6 text-gray-400" />
                </div>
            )}
            {status === 'error' && (
                 <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-fuchsia-500 flex items-center justify-center p-2">
                    <span className="text-white font-bold text-center text-sm">{alt}</span>
                 </div>
            )}
            <img 
                src={imageUrl} 
                alt={alt}
                className={`w-full h-full object-cover transition-opacity duration-300 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setStatus('loaded')}
                onError={() => setStatus('error')}
                loading="lazy"
            />
        </div>
    );
};

export const SuggestedDestinations = ({ type, userLocation }: SuggestedDestinationsProps) => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { createTrip } = useTripContext();

  const ai = useMemo(() => {
    if (!API_KEY) {
      console.error("API_KEY is not set. Please check your constants.ts file or build environment variables.");
      return null;
    }
    return new GoogleGenAI({ apiKey: API_KEY, vertexai: true });
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!ai) {
        setError("AI service not available. Check API Key.");
        setIsLoading(false);
        return;
      }

      const prompt = type === 'domestic'
        ? `Based on a user from ${userLocation}, suggest 3 diverse domestic travel destinations within their country. For each, provide a name, a short exciting one-sentence description, and a single, simple, URL-friendly keyword for a stock photo (e.g., 'yellowstone-geyser', 'miami-beach', 'chicago-skyline').`
        : `Suggest 3 popular and diverse international travel destinations. For each, provide a name, a short exciting one-sentence description, and a single, simple, URL-friendly keyword for a stock photo (e.g., 'eiffel-tower', 'kyoto-temple', 'egyptian-pyramids').`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: { role: 'user', parts: [{ text: prompt }] },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                destinations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING, description: "City and country/state of the destination." },
                      description: { type: Type.STRING, description: "A short, exciting description of the destination." },
                      imageKeyword: { type: Type.STRING, description: "A single, URL-friendly keyword for a stock photo." }
                    },
                    required: ["name", "description", "imageKeyword"]
                  }
                }
              },
              required: ["destinations"]
            }
          }
        });

        const jsonResponse = JSON.parse(response.text);
        if (jsonResponse.destinations) {
          setDestinations(jsonResponse.destinations);
        } else {
          throw new Error("Invalid response format from AI.");
        }
      } catch (e) {
        console.error("Error fetching suggestions:", e);
        setError("Couldn't fetch suggestions right now. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [ai, type, userLocation]);

  const handleStartTrip = (destinationName: string) => {
    createTrip(type, `Trip to ${destinationName}`);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white/80 dark:bg-gray-800/80 p-4 rounded-lg animate-pulse shadow-md">
            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-md mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-1"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 p-4 rounded-lg">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {destinations.map((dest, index) => (
        <div key={index} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg flex flex-col overflow-hidden group shadow-lg border border-white/20 dark:border-gray-700/50">
          <DestinationImage keyword={dest.imageKeyword} alt={dest.name} />
          <div className="p-4 flex flex-col flex-grow">
            <div>
              <h4 className="font-bold text-lg text-gray-900 dark:text-white">{dest.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 flex-grow">{dest.description}</p>
            </div>
            <button
              onClick={() => handleStartTrip(dest.name)}
              className="mt-4 w-full text-sm font-semibold text-center text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
            >
              Plan this trip &rarr;
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
