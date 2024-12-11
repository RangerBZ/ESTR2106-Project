import React, {useState, useEffect} from 'react';
import { LoadScript, GoogleMap, Marker } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '400px'
  };
  
  const center = {
    lat: 22.416,
    lng: 114.204
  };

function Map(){
    const [map, setMap] = useState(null);
    const locations = [];

    useEffect(async () => {
        if(map){
            console.log('Map isntance', map);
        }

        const response = await fetch('http://localhost:3001/locations/show', 
            {
                method: 'GET',
                credentials: 'include', // Include credentials (cookies)
            }
        );
        const locList = await response.json();
        const afterList = locList.slice(0, 10);
        for(const item of afterList){
            const add = { lat: Number(item.latitude), lng: Number(item.longitude), title: item.name };
            locations.push(add);
        }
    }, [map]);

    return(
        <LoadScript googleMapsApiKey={process.env.MAP_KEY}>
            <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={10}
            onLoad={map => setMap(map)}>
                {locations.map((location, index) => (
          <Marker
            key={index}
            position={location}
            title={location.title}
          />
        ))}
            </GoogleMap>
        </LoadScript>
    )
}

export default Map;