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
    const [placesService, setPlacesService] = useState(null); 
    const [map, setMap] = useState(null); // Store the map instance
  
    const { isLoaded, loadError } = useJsApiLoader({
      id: 'google-map-script',
      googleMapsApiKey: process.env.REACT_APP_MAP_KEY,
      libraries: ['marker', 'places'],
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
        if (map && !placesService) {
          setPlacesService(new google.maps.places.PlacesService(map));
        }
      }, [map, placesService]);

    useEffect(() => {
        if (map && locations.length > 0) {
            console.log('Creating markers...');
            locations.forEach(location => {
              try {
                if (typeof location.lat !== 'number' || typeof location.lng !== 'number') {
                  console.warn('Invalid coordinates:', location);
                  return;
                }

                const request = {
                    query: cleanTitle(location.title), // Clean the title
                    fields: ['geometry', 'name', 'formatted_address']
                  };
                //console.log(request);
        
                placesService.findPlaceFromQuery(request, (results, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                      const place = results[0];
                      console.log(place);
                      createMarker(place, location.title);
                    } else {
                      console.warn(`No place found for "${location.title}":`, status);
                    }
                  });
              } catch (error) {
                console.error('Error creating marker:', error);
              }
            });
          }
    }, [placesService, locations]);

    const cleanTitle = (title) => {
        return title.replace(/\s*$[^)]*$\s*/g, '').trim();
      };
    
      const createMarker = (place, originalTitle) => {
        const markerContent = document.createElement('div');
        markerContent.innerHTML = 
          `<div style="display: flex; align-items: center;">
                <img src="https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2.png" alt="Marker" />
                <span style="margin-left: 8px;">${originalTitle}</span>
              </div>`;
        markerContent.style.display = 'flex';
        markerContent.style.alignItems = 'center';
    
        const advancedMarker = new google.maps.marker.AdvancedMarkerElement({
          map,
          position: place.geometry.location,
          content: markerContent,
        });

        const infowindow = new google.maps.InfoWindow({
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
          });
    
        console.log('Created marker:', advancedMarker);
      };
  
    if (loadError) return <div>Map cannot be loaded right now, sorry.</div>;
    if (!isLoaded) return <div>Loading...</div>;
  
    return (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        options={{ mapId: MAP_ID }}
        onLoad={(mapInstance) => setMap(mapInstance)} // Capture the map instance
      >
        {/* No need to render markers here; they are created manually */}
      </GoogleMap>
    );
  };
  
  export default MapComponent;