import React, { useEffect, useState }  from 'react';
import './../styles/SingleLoc.css';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useJsApiLoader, GoogleMap, MarkerF } from '@react-google-maps/api';

const MAP_ID = process.env.REACT_APP_MAP_ID;
const containerStyle = {
    width: '50vw',
    height: '50vh',
    padding: '4vh',
    border: '2px solid black'
};

function SingleLoc(){
    const [locations,setLocations]=useState([]);
    const [events,setEvents]=useState([]);
    const [areaVal, setTextVal] = useState('');
    const [count,setCount]=useState(1);
    const [placesService, setPlacesService] = useState(null); 
    const [map, setMap] = useState(null); // Store the map instance

    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.REACT_APP_MAP_KEY,
        libraries: ['marker', 'places'],
        mapIds: [MAP_ID] // Ensure the marker library is included
    });

    const id=useParams().locId;

    const fetchData=async ()=>{
        try{
            const response1=await fetch('http://localhost:3001/locations/show');
            const response2=await fetch('http://localhost:3001/events/all');
            const location=await response1.json();
            const event=await response2.json();
              
            setLocations(location);
            setEvents(event);
        }catch(error){
            console.error('Error fetching data:', error.message);    
        }
    }

    useEffect(()=>{
        fetchData();
    },[]);

    useEffect(() => {
        if (map && !placesService) {
          setPlacesService(new google.maps.places.PlacesService(map));
        }
    }, [map, placesService]);

    useEffect(() => {
        if (map && locations.length > 0) {
            console.log('Creating markers...');
            locations.forEach(location => {
                if(location.locId==id){
                try {
                    if (typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
                    console.warn('Invalid coordinates:', location);
                    return;
                    }

                    const request = {
                        query: cleanTitle(location.name), // Clean the title
                        fields: ['geometry', 'name', 'formatted_address']
                    };
                    //console.log(request);
            
                    placesService.findPlaceFromQuery(request, (results, status) => {
                        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                        const place = results[0];
                        console.log(place);
                        createMarker(place, location.name);
                        } else {
                        console.warn(`No place found for "${location.name}":`, status);
                        }
                    });
                } catch (error) {
                    console.error('Error creating marker:', error);
                }
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

    const getName=()=>{
        for(let i=0;i<locations.length;i++){
            if(locations[i].locId==id)
                return locations[i].name;
        }
    }

    const getLatitude=()=>{
        for(let i=0;i<locations.length;i++){
            if(locations[i].locId==id)
                return locations[i].latitude;
        }
    }

    const getLongitude=()=>{
        for(let i=0;i<locations.length;i++){
            if(locations[i].locId==id)
                return locations[i].longitude;
        }
    }
    
    const addComments=()=>{
        let colors=["red","orange","yellow","blue","green","pink"];
        let index=Math.floor((Math.random()*6));

        let newComment = document.createElement("div");
        let element = '<div><svg height="100" width="100"><circle cx="50" cy="50"r="40"></svg></div> &nbsp &nbsp &nbsp <div><br><h5></h5><p></p></div>';
        newComment.innerHTML = element;
        newComment.querySelector("circle").setAttribute("fill", colors[index]);

        newComment.className = "d-flex";
        newComment.querySelectorAll("div")[0].className = "flex-shrink-0"; 
        newComment.querySelectorAll("div")[1].className = "flex-grow-1"; 

        newComment.querySelector("h5").innerHTML ="User "+count+" said:";
        newComment.querySelector("h5").style.fontSize="large";
        newComment.querySelector("p").innerHTML = areaVal;
        newComment.querySelector("p").style.fontSize="medium";

        setCount(count+1);

        let c=document.getElementById("comment");
        c.appendChild(newComment);
    }

    return(
        <div className='SingleLoc'>
        <div className='row'>
            <div className='col-7'>
                <h3 style={{color:"brown",textAlign:"center"}}>{getName()}</h3>
                <h5 style={{color:"blueviolet",textAlign:"center"}}>latitude:{getLatitude()}</h5>
                <h5 style={{color:"blueviolet",textAlign:"center"}}>longitude:{getLongitude()}</h5>
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={{lat:Number(getLatitude()),lng:Number(getLongitude())}}
                    zoom={15}
                    options={{ mapId: MAP_ID }}
                    onLoad={(mapInstance) => setMap(mapInstance)} // Capture the map instance
                >
                </GoogleMap>
            </div>

            <div className='col-5'>
                <h3 id="comment">Comments for <span style={{color:"purple"}}>{getName()}</span></h3>
                <h4>Add your own comments!</h4>
                <textarea style={{width:"40vw", height: "20vh"}} id="new-comment" value={areaVal} onChange={e => setTextVal(e.target.value)}></textarea>
                <br/>
                <button type="button" className="btn btn-success" onClick={addComments}>Add Comment</button>{' '}

                <button className='btn btn-info'><Link to="../locations" style={{color:"black"}}>back to list</Link></button>
            </div>
        </div>
        </div>
    );

}

export default SingleLoc;