
import React, { useEffect, useRef, useState } from 'react';
import { LocationSuggestion } from '../../types';
import { MapPinIcon } from '../ui/Icons';
import { useTheme } from '../../context/ThemeContext';

const lightMapStyles = [
    { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
    { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
    { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
    { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
    { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
    { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
];

const darkMapStyles = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
    { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
    { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
    { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
    { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
];

export const MapView = ({ locations }: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const { theme } = useTheme();

  const initMap = () => {
    if (mapRef.current && window.google) {
      const newMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: 20, lng: 0 },
        zoom: 2,
        styles: theme === 'dark' ? darkMapStyles : lightMapStyles,
        disableDefaultUI: true,
        zoomControl: true,
      });
      setMap(newMap);
    }
  };

  useEffect(() => {
    if (window.googleMapReady) {
      initMap();
    } else {
      window.addEventListener('google-map-ready', initMap);
    }
    return () => {
      window.removeEventListener('google-map-ready', initMap);
    };
  }, [theme]); // Re-initialize map if theme changes

  useEffect(() => {
    if (map) {
      markers.forEach(marker => marker.setMap(null));
      
      const newMarkers = locations.map(loc => {
        return new google.maps.Marker({
          position: { lat: loc.lat, lng: loc.lng },
          map: map,
          title: loc.name,
          animation: google.maps.Animation.DROP,
        });
      });
      setMarkers(newMarkers);

      if (newMarkers.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        newMarkers.forEach(marker => bounds.extend(marker.getPosition()!));
        map.fitBounds(bounds);
        if (newMarkers.length === 1) {
            map.setZoom(8);
        }
      }
    }
  }, [locations, map]);

  return (
    <div className="h-full w-full bg-gray-200 dark:bg-gray-800 relative rounded-lg overflow-hidden">
      <div ref={mapRef} className="h-full w-full" />
      {!window.google && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 flex flex-col items-center justify-center text-center p-4">
            <MapPinIcon className="w-12 h-12 text-teal-500 mb-4" />
            <h3 className="text-lg font-semibold">Map Loading...</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
                If the map doesn't appear, please ensure your Google Maps API key is correctly configured in <code>index.html</code>.
            </p>
        </div>
      )}
    </div>
  );
};
