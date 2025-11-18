
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { LocationSuggestion, User } from '../../types';
import { MapPinIcon, HomeIcon, Spinner } from '../ui/Icons';
import { useTheme } from '../../context/ThemeContext';

interface MapViewProps {
  locations: LocationSuggestion[];
  user: User | null;
  onRouteCalculated: (route: google.maps.DirectionsRoute | null) => void;
}

const lightMapStyles = [
    { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] }, { elementType: "labels.icon", stylers: [{ visibility: "off" }] }, { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] }, { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] }, { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] }, { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] }, { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] }, { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] }, { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] }, { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] }, { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] }, { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] }, { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] }, { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] }, { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] }, { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#eeeeee" }] }, { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] }, { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
];

const darkMapStyles = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] }, { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] }, { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] }, { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] }, { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] }, { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] }, { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] }, { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] }, { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] }, { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] }, { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] }, { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] }, { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] }, { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] }, { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] }, { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] }, { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] }, { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
];

const geocodeAddress = (geocoder: google.maps.Geocoder, address: string): Promise<google.maps.LatLng | null> => {
    return new Promise((resolve) => {
        geocoder.geocode({ address }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
                resolve(results[0].geometry.location);
            } else {
                console.error(`Geocode was not successful for "${address}": ${status}`);
                resolve(null);
            }
        });
    });
};

export const MapView = ({ locations, user, onRouteCalculated }: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const { theme } = useTheme();

  const initMap = useCallback(() => {
    if (mapRef.current && window.google) {
      const newMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: 20, lng: 0 },
        zoom: 2,
        styles: theme === 'dark' ? darkMapStyles : lightMapStyles,
        disableDefaultUI: true,
        zoomControl: true,
      });
      setMap(newMap);

      const renderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: theme === 'dark' ? '#14b8a6' : '#0d9488',
          strokeWeight: 5,
          strokeOpacity: 0.8,
        },
      });
      renderer.setMap(newMap);
      setDirectionsRenderer(renderer);
    }
  }, [theme]);

  useEffect(() => {
    if (window.googleMapReady) {
      initMap();
    } else {
      window.addEventListener('google-map-ready', initMap, { once: true });
    }
    return () => {
      window.removeEventListener('google-map-ready', initMap);
    };
  }, [initMap]);

  useEffect(() => {
    if (!map || !directionsRenderer || !user?.location) return;

    const processMapUpdate = async () => {
        // Clear previous markers and routes
        markers.forEach(marker => marker.setMap(null));
        directionsRenderer.setDirections({ routes: [] });
        onRouteCalculated(null);

        const geocoder = new google.maps.Geocoder();
        const homeLocation = await geocodeAddress(geocoder, user.location);
        const latestDestination = locations.length > 0 ? locations[locations.length - 1] : null;
        
        const newMarkers: google.maps.Marker[] = [];
        const bounds = new google.maps.LatLngBounds();

        if (homeLocation) {
            newMarkers.push(new google.maps.Marker({
                position: homeLocation,
                map,
                title: 'Home',
                icon: { path: google.maps.SymbolPath.CIRCLE, scale: 7, fillColor: theme === 'dark' ? '#f9a8d4' : '#db2777', fillOpacity: 1, strokeColor: 'white', strokeWeight: 2 }
            }));
            bounds.extend(homeLocation);
        }

        if (latestDestination && homeLocation) {
            const directionsService = new google.maps.DirectionsService();
            directionsService.route({
                origin: homeLocation,
                destination: { lat: latestDestination.lat, lng: latestDestination.lng },
                travelMode: google.maps.TravelMode.DRIVING,
            }, (result, status) => {
                if (status === google.maps.DirectionsStatus.OK && result) {
                    directionsRenderer.setDirections(result);
                    onRouteCalculated(result.routes[0]);
                    if (result.routes[0].bounds) {
                        map.fitBounds(result.routes[0].bounds);
                    }
                } else {
                    console.error(`Directions request failed due to ${status}`);
                    // Fallback to just showing markers if route fails
                    newMarkers.push(new google.maps.Marker({ position: { lat: latestDestination.lat, lng: latestDestination.lng }, map, title: latestDestination.name }));
                    bounds.extend({ lat: latestDestination.lat, lng: latestDestination.lng });
                    map.fitBounds(bounds);
                }
            });
        } else if (locations.length > 0) {
            // No route, just show markers
            locations.forEach(loc => {
                const pos = { lat: loc.lat, lng: loc.lng };
                newMarkers.push(new google.maps.Marker({ position: pos, map, title: loc.name }));
                bounds.extend(pos);
            });
            if (locations.length > 0) map.fitBounds(bounds);
        }
        
        setMarkers(newMarkers);
    };

    processMapUpdate();

  }, [locations, map, directionsRenderer, user, theme, onRouteCalculated]);

  return (
    <div className="h-full w-full bg-gray-200 dark:bg-gray-800 relative rounded-lg overflow-hidden">
      <div ref={mapRef} className="h-full w-full" />
      {!window.google && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 flex flex-col items-center justify-center text-center p-4">
            <MapPinIcon className="w-12 h-12 text-teal-500 mb-4" />
            <h3 className="text-lg font-semibold">Map Loading...</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
                If the map doesn't appear, please ensure your Google Maps API key is correctly configured.
            </p>
        </div>
      )}
    </div>
  );
};
