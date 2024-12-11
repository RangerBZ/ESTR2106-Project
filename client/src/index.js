import ReactDOM from 'react-dom/client';
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Events from './components/Events';
import Locations from './components/Locations';
import Favourites from './components/Favourites';
import Others from './components/Others';
// import ComponentName from './components/...'

class App extends React.Component {
    render(){
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
        return(
            <BrowserRouter>
                <div >
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
                    </ul>
                </div>

                <Routes>
                    <Route path="/" element={<Home />}/>
                    <Route path="/events" element={<Events />}/>
                    <Route path="/locations" element={<Locations />}/>
                    <Route path="/favourites" element={<Favourites />}/>
                    <Route path="/others" element={<Others />}/>
                </Routes>
            </BrowserRouter>
        );
    }
}

class Home extends React.Component{
    render(){
        return(
            <div>
                <p>???</p>
            </div>
        )
    }
}

const root= ReactDOM.createRoot(document.querySelector('#app'));
root.render(<App />)