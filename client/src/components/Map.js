import React, {useState, useEffect} from 'react';
import { useJsApiLoader, GoogleMap, MarkerF } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '50vh',
    padding: '4vh',
    border: '2px solid black'
  };
  
  const center = {
    lat: 22.416,
    lng: 114.204
  };
const MAP_ID = process.env.REACT_APP_MAP_ID;

  const MapComponent = () => {
    const [locations, setLocations] = useState([]);
    const [map, setMap] = useState(null); // Store the map instance
  
    const { isLoaded, loadError } = useJsApiLoader({
      id: 'google-map-script',
      googleMapsApiKey: process.env.REACT_APP_MAP_KEY,
      libraries: ['marker'],
      mapIds: [MAP_ID] // Ensure the marker library is included
    });
  
    useEffect(() => {
      if (isLoaded) {
        fetchLocations();
        console.log(locations);
      }
    }, [isLoaded]);
  
    const fetchLocations = async () => {
      try {
        const response = await fetch('http://localhost:3001/locations/show', {
          method: 'GET',
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const locList = await response.json();
        console.log(locList);
        const afterList = locList.slice(0, 10);
        const newLocations = afterList.map(item => ({
          lat: Number(item.latitude),
          lng: Number(item.longitude),
          title: item.name,
        }));
  
        setLocations(newLocations);
      } catch (error) {
        console.error('Error fetching location data:', error);
      }
    };
  
    useEffect(() => {
        if (map && locations.length > 0) {
            console.log('Creating markers...');
            locations.forEach(location => {
              try {
                if (typeof location.lat !== 'number' || typeof location.lng !== 'number') {
                  console.warn('Invalid coordinates:', location);
                  return;
                }
        
                const markerContent = document.createElement('div');
                markerContent.innerHTML = `
                <a href="https://maps.google.com/?q=${location.lat},${location.lng}" target="_blank">
                <img src="https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2.png" alt="Marker" />
                <span>${location.title}</span>
                </a>
                `;
                markerContent.style.display = 'flex';
                markerContent.style.alignItems = 'center';

            const advancedMarker = new google.maps.marker.AdvancedMarkerElement({
                map,
                position: { lat: location.lat, lng: location.lng },
                content: markerContent,
            });
                console.log('Created marker:', advancedMarker);
              } catch (error) {
                console.error('Error creating marker:', error);
              }
            });
          }
    }, [map, locations]);
  
    if (loadError) return <div>Map cannot be loaded right now, sorry.</div>;
    if (!isLoaded) return <div>Loading...</div>;
  
    return (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        options={{ mapId: MAP_ID }}
        onLoad={(mapInstance) => setMap(mapInstance)} // Capture the map instance
      >
        {/* No need to render markers here; they are created manually */}
      </GoogleMap>
    );
  };
  
  export default MapComponent;