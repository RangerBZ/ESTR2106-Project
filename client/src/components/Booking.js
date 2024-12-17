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

  const handleCancelBooking = async (event) => {
    // Show confirmation dialog
    if (
      window.confirm(`Do you want to cancel the booking for "${event.title}"?`)
    ) {
      try {
        const response = await fetch('http://localhost:3001/cancelBooking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username,
            eventId: event.eventId,
          }),
        });

        if (response.ok) {
          // Remove the event from bookedEvents state
          setBookedEvents((prevBookedEvents) =>
            prevBookedEvents.filter((e) => e.eventId !== event.eventId)
          );
        } else {
          console.error('Cancel booking failed');
        }
      } catch (error) {
        console.error('Error canceling booking:', error);
      }
    }
  };

  return (
    <div className="Booking">
      <h2>{username}'s Booked Events</h2>
      {bookedEvents.length > 0 ? (
        <table className="booking-table">
          <thead>
            <tr>
              <th style={{ width: '5%' }}>ID</th>
              <th style={{ width: '15%' }}>Title</th>
              <th style={{ width: '5%' }}>Venue</th>
              <th style={{ width: '5%' }}>Date/Time</th>
              <th style={{ width: '25%' }}>Description</th>
              <th style={{ width: '10%' }}>Presenter</th>
              <th style={{ width: '5%' }}>Price</th>
              <th style={{ width: '5%' }}>Cancel</th>
            </tr>
          </thead>
          <tbody>
            {bookedEvents.map((event) => (
              <tr key={event.eventId}>
                <td>{event.eventId}</td>
                <td>{event.title}</td>
                <td>{event.locId}</td>
                <td>{event.date}</td>
                <td
                  className="description-cell"
                  title={event.description}
                >
                  {event.description && event.description.length > 100
                    ? `${event.description.substring(0, 100)}...`
                    : event.description}
                </td>
                <td>{event.presenter}</td>
                <td>{event.price}</td>
                <td className="cancel-cell">
                  <i
                    className="bi bi-x-circle"
                    style={{ color: 'red', cursor: 'pointer' }}
                    onClick={() => handleCancelBooking(event)}
                  ></i>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No events booked.</p>
      )}
    </div>
  );
}

export default Booking;