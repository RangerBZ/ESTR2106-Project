import React, { useState, useEffect } from 'react';
import { useJsApiLoader, GoogleMap } from '@react-google-maps/api';
import { Link } from 'react-router-dom';
  
  const containerStyle = {
    width: '100%',
    height: '75vh',
    padding: '4vh',
    border: '2px solid black'
  };
  
  const center = {
    lat: 22.416,
    lng: 114.150
  };
  
  const MAP_ID = process.env.REACT_APP_MAP_ID;
  
  const MapComponent = ({ locations }) => {
    const [placesService, setPlacesService] = useState(null); 
    const [map, setMap] = useState(null); // Store the map instance
    const [markers, setMarkers] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
  
    const { isLoaded, loadError } = useJsApiLoader({
      id: 'google-map-script',
      googleMapsApiKey: process.env.REACT_APP_MAP_KEY,
      libraries: ['marker', 'places'],
      mapIds: [MAP_ID] // Ensure the marker library is included
    });
  
    useEffect(() => {
      if (map && !placesService) {
        setPlacesService(new window.google.maps.places.PlacesService(map));
      }
    }, [map, placesService]);
  
    useEffect(() => {
      if (isLoaded && map && placesService && locations.length > 0) {
        // Clear existing markers
        markers.forEach(marker => marker.setMap(null));
        setMarkers([]);
  
        // Create new markers
        locations.forEach(location => {
          try {
            if (typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
              console.warn('Invalid coordinates:', location);
              return;
            }
  
            const request = {
              query: cleanTitle(location.name),
              fields: ['geometry', 'name', 'formatted_address']
            };
  
            placesService.findPlaceFromQuery(request, (results, status) => {
              if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                const place = results[0];
                createMarker(location, place, location.name);
              } else {
                console.warn(`No place found for "${location.name}":`, status);
              }
            });
          } catch (error) {
            console.error('Error creating marker:', error);
          }
        });
      } else if (markers.length > 0) {
        // Clear markers if no locations
        markers.forEach(marker => marker.setMap(null));
        setMarkers([]);
      }
    }, [isLoaded, map, placesService, locations]);
  
    const cleanTitle = (title) => {
      return title.replace(/\s*$[^)]*$\s*/g, '').trim();
    };
  
    const createMarker = (location, place, originalTitle) => {
      const markerContent = document.createElement('div');
      markerContent.innerHTML = 
        `<div style="display: flex; align-items: center;">
              <img src="https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2.png" alt="Marker" />
              <span style="margin-left: 8px;">${originalTitle}</span>
            </div>`;
      markerContent.style.display = 'flex';
      markerContent.style.alignItems = 'center';
  
      const advancedMarker = new window.google.maps.marker.AdvancedMarkerElement({
        map,
        position: place.geometry.location,
        content: markerContent,
      });
  
      const infowindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px;">
            <strong>${originalTitle}</strong><br>
            Location: ${place.formatted_address}<br><br>
            <a href="https://maps.google.com/?q=${place.geometry.location.lat()},${place.geometry.location.lng()}" 
               target="_blank" 
               rel="noopener noreferrer"
               onclick="event.stopPropagation();">
              View on Google Maps
            </a>
          </div>
        `,
      });
  
      // Add click event listener to the marker
      advancedMarker.addListener('click', () => {
        infowindow.open({
          anchor: advancedMarker,
          map,
          shouldFocus: false,
        });
        setSelectedLocation({ location, place, originalTitle });
      });
  
      setMarkers(prevMarkers => [...prevMarkers, advancedMarker]);
    };
  
    if (loadError) return <div>Map cannot be loaded right now, sorry.</div>;
    if (!isLoaded) return <div>Loading...</div>;
  
    return (
     <div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        options={{ mapId: MAP_ID }}
        onLoad={(mapInstance) => setMap(mapInstance)} // Capture the map instance
      >
        {/* No need to render markers here; they are created manually */}
      </GoogleMap>
      {selectedLocation && (
        <div style={{ padding: '10px', marginTop: '10px', border: '1px solid #ccc' }}>
          <strong>{selectedLocation.originalTitle}</strong><br />
          Location: {selectedLocation.place.formatted_address}<br /><br />
          <Link to={`/locations/${selectedLocation.location.locId}`}>
            Go to Location Page
          </Link>
        </div>
      )}</div>
    );
  };
  
  export default MapComponent;