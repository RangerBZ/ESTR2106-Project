import ReactDom from 'react-dom/client';
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Events from './components/Events';
// import ComponentName from './components/...'

class App extends React.Component {
    render(){
        const routerStyle = {
            
        };
        return(
            <BrowserRouter>
                <div>
                    <ul>
                        <li>{' '}
                        <Link to="/">Home</Link>{' '}
                        </li>
                        <li>{' '}
                        <Link to="/events">List of Events</Link>{' '}
                        </li>
                        <li>{' '}
                        <Link to="/locations">List of Locations</Link>{' '}
                        </li>
                        <li>{' '}
                        <Link to="/map">Map</Link>{' '}
                        </li>
                        <li>{' '}
                        <Link to="/favourites">Favourites</Link>{' '}
                        </li>
                        <li>{' '}
                        <Link to="/others">No idea?</Link>{' '}
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