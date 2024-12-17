import React, { useState, useEffect } from 'react';
import './../styles/Booking.css';

function Booking() {
  const [bookedEvents, setBookedEvents] = useState([]);
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Fetch current user
    const getCurrentUser = async () => {
      try {
        const response = await fetch('http://localhost:3001/currentUser', {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();
        setUsername(data.username);
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (username) {
      // Fetch booked events
      const fetchBookedEvents = async () => {
        try {
          const response = await fetch(
            `http://localhost:3001/bookings/${username}`,
            {
              method: 'GET',
            }
          );
          const data = await response.json();
          setBookedEvents(data.bookedEvents);
        } catch (error) {
          console.error('Error fetching booked events:', error);
        }
      };
      fetchBookedEvents();
    }
  }, [username]); // Re-run when username changes

  return (
    <div className="Booking">
      <h2>{username}'s Booked Events</h2>
      {bookedEvents.length > 0 ? (
        <ul>
          {bookedEvents.map((event) => (
            <li key={event.eventId}>
              <strong>{event.title}</strong> (Event ID: {event.eventId})
            </li>
          ))}
        </ul>
      ) : (
        <p>No events booked.</p>
      )}
    </div>
  );
}

export default Booking;