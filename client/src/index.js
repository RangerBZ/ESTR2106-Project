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
import Darkmode from 'darkmode-js';

import './styles/all.css';
import './styles/index.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

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

        const options = {
          bottom: '675px', // default: '32px'
          right: '10px', // default: '32px'
          left: 'unset', // default: 'unset'
          time: '0.5s', // default: '0.3s'
          mixColor: '#fff', // default: '#fff'
          backgroundColor: '#fff',  // default: '#fff'
          buttonColorDark: '#100f2c',  // default: '#100f2c'
          buttonColorLight: '#fff', // default: '#fff'
          saveInCookies: false, // default: true,
          label: '🌓', // default: ''
          autoMatchOsTheme: true // default: true
        }
        
        const darkmode = new Darkmode(options);
        darkmode.showWidget();
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

    handleUserRoleClick = () => {
      const { isAuthenticated } = this.context;
      if (isAuthenticated) {
        const confirmLogout = window.confirm("Do you want to log out?");
        if (confirmLogout) {
          this.context.logout();
        }
      }
    };

    render(){
      const {userRole,userName} = this.context;

      const routerStyle = {
        border:"1px solid",
        backgroundColor:"rgb(245,245,245)",
        listStyle: 'none',
        paddingLeft:"1vw",
        marginTop: "-1vh",
        marginBottom: 0,
        display: 'flex',
        justifyContent: 'flex-start',
        gap: '20px' 
      };

      const linkStyle = {
        fontSize:"large",
        textDecoration: 'none',
        color: 'black'
      };

      const headStyle = {
        backgroundColor: "azure",   // Light blue background
        color: "black",
        fontFamily: "sans-serif",
        padding: "20px",                // Increased padding for inner spacing
        }                  // Adjust width to make it look like a floating module

      const userRoleStyle = {
        backgroundColor: "lightgrey",
        borderRadius: "5px",
        padding: "5px 5px",
        fontSize:"medium",
        fontWeight: "bold",
        display:"inline-block",
        marginLeft:"auto"
      };

      const { filters, filteredLocations, allLocations, allEvents } = this.state;

      return(
            <BrowserRouter>
                <div>
                <div style={headStyle}>
      <h2 className="display-4 mb-0">HONG KONG</h2>
      <p className="fs-3 fw-bold text-uppercase">Cultural diving</p>
    </div>
    <div className="navigation-container">
        {/* 导航栏 */}
        <ul className="nav nav-pills mb-3" style={{ width: '90%', marginLeft: 'auto', marginRight: 'auto' }}>
          <li className="nav-item">
            <Link to="/" className="nav-link d-flex align-items-center">
              <i className="bi bi-house me-2"></i> Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/events" className="nav-link d-flex align-items-center">
              <i className="bi bi-list-columns-reverse me-2"></i> List of Events
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/locations" className="nav-link d-flex align-items-center">
              <i className="bi bi-list-columns-reverse me-2"></i> List of Locations
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/map" className="nav-link d-flex align-items-center">
              <i className="bi bi-map me-2"></i> Map
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/favourites" className="nav-link d-flex align-items-center">
              <i className="bi bi-star me-2"></i> Favourites
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/others" className="nav-link">No idea?</Link>
          </li>
          {userRole && (
            <li className="nav-item">
              <Link to="/admin" className="nav-link">Manage database</Link>
            </li>
          )}
          <li className="nav-item"
          onClick={this.handleUserRoleClick}
          style={{ cursor: "pointer" }}
        ><div className="nav-link d-flex align-items-center" style={{color: 'black'}}>
          {userRole ? `Admin: ${userName}` : `User: ${userName}`}</div>
        </li>
        </ul>

        {/* User Role Display */}
      </div>
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
                    <Route path="/locations/:locId" element={<SingleLoc username={userName}/>}/>
                    {userRole && (
                    <Route path="/admin" element={<Manage/>}/>)}
                </Routes>
            </BrowserRouter>
        );
    }
}

class Home extends React.Component{
   constructor(props) {
    super(props);
    this.state = {
        updateTime: null,
        slideIndex: 0,
        images:[
            { url: 'images/performing_1.jpg', color: 'initial'},
            { url: 'images/performing_2.jpg', color: 'transparent'},
            { url: 'images/performing_3.jpg', color: 'transparent'},
            { url: 'images/performing_4.jpg', color: 'transparent'}
        ]
    };
   }


   showSlides = (n) => {
    let { slideIndex } = this.state;
    slideIndex = (slideIndex + n + 4) % 4; // Wrap around logic

    this.setState({ slideIndex });
  };

   componentDidMount(){
     const startTime = String(new Date());
     this.setState({updateTime: startTime});
   }

    render(){
        const { slideIndex, images } = this.state;

        return(
            <div className="d-flex flex-column justify-content-center align-items-center">
        {/* Backup element with dynamic styles */}
        <div id="backup" style={{
          backgroundImage: `url(${images[slideIndex].url})`,
          color: images[slideIndex].color,
          width: '80%', // Adjust as necessary
          height: '60vh', // Adjust as necessary
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
        }} />

        {/* Controls for the slideshow */}
        <div className="mt-3 d-flex gap-2">
          <button onClick={() => this.showSlides(-1)} className="btn btn-secondary">Previous</button>
          <button onClick={() => this.showSlides(1)} className="btn btn-secondary">Next</button>
        </div>
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