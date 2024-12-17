// src/components/Booking.js
import React, { useState, useEffect } from 'react';
import './../styles/Booking.css';
import { Container, Row, Col, Table, Button, Alert } from 'react-bootstrap';

function Booking() {
  const [bookedEvents, setBookedEvents] = useState([]);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false); // 显示成功消息
  const [showErrorAlert, setShowErrorAlert] = useState(false); // 显示错误消息
  const [message, setMessage] = useState(''); // 消息内容

  useEffect(() => {
    // Fetch current user
    const getCurrentUser = async () => {
      try {
        const response = await fetch('http://localhost:3001/currentUser', {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch current user');
        }
        const data = await response.json();
        setUsername(data.username);
      } catch (error) {
        console.error('Error fetching current user:', error);
        setError(error.message);
        setIsLoading(false);
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
              credentials: 'include',
            }
          );
          if (!response.ok) {
            throw new Error('Failed to fetch booked events');
          }
          const data = await response.json();
          setBookedEvents(data.bookedEvents);
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching booked events:', error);
          setError(error.message);
          setIsLoading(false);
        }
      };
      fetchBookedEvents();
    }
  }, [username]);

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
          setShowSuccess(true);
          setMessage(`Successfully canceled booking for "${event.title}"`);
        } else {
          const errorData = await response.json();
          setShowErrorAlert(true);
          setMessage(errorData.message || 'Cancel booking failed.');
        }
      } catch (error) {
        console.error('Error canceling booking:', error);
        setShowErrorAlert(true);
        setMessage('Error canceling booking.');
      }
    }
  };

  if (isLoading) {
    return (
      <Container className='Booking py-5'>
        <Row className='justify-content-center'>
          <Col xs={12} className='text-center'>
            <p>Loading...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className='Booking py-5'>
        <Row className='justify-content-center'>
          <Col xs={12} className='text-center'>
            <p>Error: {error}</p>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid className='Booking py-4'>
      {/* 用户反馈消息 */}
      {showSuccess && (
        <Alert
          variant="success"
          onClose={() => setShowSuccess(false)}
          dismissible
          className={`fade-in ${showSuccess ? 'show' : ''}`}
        >
          <Alert.Heading>Success!</Alert.Heading>
          <p>{message}</p>
        </Alert>
      )}
      {showErrorAlert && (
        <Alert
          variant="danger"
          onClose={() => setShowErrorAlert(false)}
          dismissible
          className={`fade-in ${showErrorAlert ? 'show' : ''}`}
        >
          <Alert.Heading>Error!</Alert.Heading>
          <p>{message}</p>
        </Alert>
      )}

      {/* 标题部分 */}
      <Row className='mb-4'>
        <Col>
          <h2 className="booking-title text-center animated-title">My Booked Events</h2>
        </Col>
      </Row>

      {/* 表格部分 */}
      <Row>
        <Col>
          {bookedEvents.length > 0 ? (
            <div className='table-container'>
              <Table responsive hover className='booking-table'>
                <thead className="table-primary">
                  <tr>
                    <th style={{ width: '5%' }}>ID</th>
                    <th style={{ width: '15%' }}>Title</th>
                    <th style={{ width: '5%' }}>Venue</th>
                    <th style={{ width: '5%' }}>Date/Time</th>
                    <th style={{ width: '15%' }}>Description</th>
                    <th style={{ width: '10%' }}>Presenter</th>
                    <th style={{ width: '5%' }}>Price</th>
                    <th style={{ width: '5%' }}>Cancel</th>
                  </tr>
                </thead>
                <tbody>
                  {bookedEvents.map((event) => (
                    <tr key={event.eventId} className="booking-row">
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
                      <td>${event.price}</td>
                      <td className="cancel-cell">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleCancelBooking(event)}
                          className='cancel-button'
                          aria-label={`Cancel booking for ${event.title}`}
                        >
                          <i className="bi bi-x-circle"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <Row className='justify-content-center'>
              <Col xs={12} className='text-center'>
                <p>No events booked.</p>
              </Col>
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default Booking;