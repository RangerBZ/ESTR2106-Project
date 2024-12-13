import ReactDOM from 'react-dom/client';
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate} from 'react-router-dom';

import Events from './components/Events';
import Locations from './components/Locations';
import Map from './components/Map';
import Favourites from './components/Favourites';
import Others from './components/Others';
import SingleLoc from './components/SingleLoc';
import Manage from './components/Manage';
import { AuthContext, AuthProvider } from './services/AuthContext';
import Login from './components/Login';

import './styles/all.css';

class App extends React.Component {
    static contextType = AuthContext;

    constructor(props) {
        super(props);
        this.state = {
          filters: {
            selectedCategory: 'All',
            searchText: '',
            distance: 25,
            sortOrder: null,
          },
          allLocations: [],
          filteredLocations: [],
          allEvents: [],
        };
      }
    
    componentDidMount() {
        // Load filters from localStorage
        const storedFilters = JSON.parse(localStorage.getItem('filters'));
        if (storedFilters) {
          this.setState({ filters: storedFilters });
        }
    
        // Fetch locations and events
        this.fetchData();
    }
    
    componentDidUpdate(prevProps, prevState) {
        // Check if filters or data have changed
        if (
          prevState.filters !== this.state.filters ||
          prevState.allLocations !== this.state.allLocations ||
          prevState.allEvents !== this.state.allEvents
        ) {
          this.applyFilters();
          // Save filters to localStorage
          localStorage.setItem('filters', JSON.stringify(this.state.filters));
        }
    }
    
    fetchData = async () => {
        try {
          const locationsResponse = await fetch('http://localhost:3001/locations/show');
          if (!locationsResponse.ok) throw new Error('Failed to fetch locations');
          const locations = await locationsResponse.json();
    
          const eventsResponse = await fetch('http://localhost:3001/events/all');
          if (!eventsResponse.ok) throw new Error('Failed to fetch events');
          const events = await eventsResponse.json();
    
          this.setState({ allLocations: locations, allEvents: events });
    
        } catch (error) {
          console.error('Error fetching data:', error);
        }
    };
    
    applyFilters = () => {
        const { allLocations, allEvents, filters } = this.state;
        let filtered = allLocations;
    
        // Filter by category
        if (filters.selectedCategory && filters.selectedCategory !== 'All') {
          filtered = filtered.filter(location => {
            const categoryMatch = location.name.match(/\(([^)]+)\)$/);
            return categoryMatch && categoryMatch[1].trim() === filters.selectedCategory;
          });
        }
    
        // Filter by search text
        if (filters.searchText.trim() !== '') {
          const content = filters.searchText.trim().toLowerCase();
          filtered = filtered.filter(location => 
            location.name.toLowerCase().includes(content)
          );
        }
    
        // Filter by distance
        if (filters.distance > 0) {
          const center = { lat: 22.416, lng: 114.204 };
          const calculateDistance = (lat1, lon1, lat2, lon2) => {
            const toRad = (value) => (value * Math.PI) / 180;
            const R = 6371; // Earth's radius in km
            const dLat = toRad(lat2 - lat1);
            const dLon = toRad(lon2 - lon1);
            const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c;
            return distance;
          };
    
          filtered = filtered.filter(location => {
            const locLat = location.latitude;
            const locLng = location.longitude;
            if (locLat == null || locLng == null) return false;
            const distance = calculateDistance(center.lat, center.lng, locLat, locLng);
            return distance <= filters.distance;
          });
        }
    
        // Sort by number of events
        if (filters.sortOrder && allEvents.length > 0) {
          const getNum = (events, id) => {
            return events.filter(event => event.locId === id).length;
          };
    
          filtered.sort((a, b) => {
            const countA = getNum(allEvents, a.locId);
            const countB = getNum(allEvents, b.locId);
            if (filters.sortOrder === 'asc') {
              return countA - countB;
            } else {
              return countB - countA;
            }
          });
        }
    
        this.setState({ filteredLocations: filtered });
    };
    
    setFilters = (newFilters) => {
        this.setState({ filters: newFilters });
    };

    render(){
        const {userRole} = this.context;

        const routerStyle = {
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            justifyContent: 'flex-start',
            gap: '20px' 
        };

        const linkStyle = {
            textDecoration: 'none',
            color: 'black'
        };

        const { filters, filteredLocations, allLocations, allEvents } = this.state;

        return(
            <BrowserRouter>
                <div>
                <ul style={routerStyle}>
                        <li>{' '}
                        <Link to="/" style={linkStyle}>Home</Link>{' '}
                        </li>
                        <li>{' '}
                        <Link to="/events" style={linkStyle}>List of Events</Link>{' '}
                        </li>
                        <li>{' '}
                        <Link to="/locations" style={linkStyle}>List of Locations</Link>{' '}
                        </li>
                        <li>{' '}
                        <Link to="/map" style={linkStyle}>Map</Link>{' '}
                        </li>
                        <li>{' '}
                        <Link to="/favourites" style={linkStyle}>Favourites</Link>{' '}
                        </li>
                        <li>{' '}
                        <Link to="/others" style={linkStyle}>No idea?</Link>{' '}
                        </li>
                        <li>{' '}
                        <Link to="/admin" style={linkStyle}>Manage database</Link>
                        </li>
                    </ul>
                    
                </div>

                <Routes>
                    <Route path="/" element={<Home />}/>
                    <Route path="/events" element={<Events />}/>                   
                    <Route path="/locations" element={<Locations
                                                        filters={filters}
                                                        setFilters={this.setFilters}
                                                        allLocations={filteredLocations}
                                                        allLocationsOriginal={allLocations}
                                                        allEvents={allEvents}
                                                        />}/>
                    <Route path="/map" element={<Map locations={filteredLocations}/>}/>
                    <Route path="/favourites" element={<Favourites />}/>
                    <Route path="/others" element={<Others />}/>
                    <Route path="/locations/:locId" element={<SingleLoc />}/>
                    {userRole && (
                    <Route path="/admin" element={<Manage/>}/>)}
                </Routes>
            </BrowserRouter>
        );
    }
}

class Home extends React.Component{
    render(){
        return(
            <div>
                <p>????</p>
            </div>
        )
    }
}

class Layer extends React.Component {
    static contextType = AuthContext;

    render(){
        console.log(this.context);
        const { isAuthenticated } = this.context;

        return (isAuthenticated ? <App /> : <Login />);
    }
}

const root = ReactDOM.createRoot(document.querySelector('#app'));
root.render(<AuthProvider>
    <Layer />
  </AuthProvider>);