import React from 'react';
import './../styles/Events.css';
import { Table, Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';

class Events extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      maxPrice: '',
      bookedEvents: [],
      likedEvents: [],
      username: '',
      showSuccess: false,
      showError: false,
      message: '',
    };
  }

  componentDidMount() {
    this.fetchEvents();
    this.getCurrentUser();
  }

  getCurrentUser = async () => {
    try {
      const response = await fetch('http://localhost:3001/currentUser', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      this.setState({ username: data.username }, () => {
        this.fetchBookedEvents();
        this.fetchLikedEvents();
      });
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:3001/events/all', {
        method: 'GET',
      });
      const data = await response.json();
      const eventsWithDefaultState = data.map((event) => ({
        ...event,
        liked: false,
        booked: false,
      }));
      this.setState({ events: eventsWithDefaultState });
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  fetchBookedEvents = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/bookings/${this.state.username}`,
        {
          method: 'GET',
        }
      );
      const data = await response.json();
      const bookedEventIds = data.bookedEvents.map((event) => event.eventId);
      this.setState({ bookedEvents: data.bookedEvents });

      this.setState((prevState) => ({
        events: prevState.events.map((event) => ({
          ...event,
          booked: bookedEventIds.includes(event.eventId),
        })),
      }));
    } catch (error) {
      console.error('Error fetching booked events:', error);
    }
  };

  fetchLikedEvents = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/likes/${this.state.username}`,
        {
          method: 'GET',
        }
      );
      const data = await response.json();
      const likedEventIds = data.likedEvents.map((event) => event.eventId);
      this.setState({ likedEvents: likedEventIds });
      this.setState((prevState) => ({
        events: prevState.events.map((event) => ({
          ...event,
          liked: likedEventIds.includes(event.eventId),
        })),
      }));
    } catch (error) {
      console.error('Error fetching liked events:', error);
    }
  };

  handleBook = async (event) => {
    const { eventId, title } = event;
    const { username } = this.state;

    if (window.confirm(`Do you want to book the event "${title}"?`)) {
      try {
        const response = await fetch('http://localhost:3001/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username,
            eventId: eventId,
            title: title,
          }),
        });

        if (response.ok) {
          this.setState((prevState) => ({
            bookedEvents: [...prevState.bookedEvents, event],
            events: prevState.events.map((e) =>
              e.eventId === eventId ? { ...e, booked: true } : e
            ),
            showSuccess: true,
            message: `Successfully booked "${title}"!`,
          }));
        } else {
          const errorData = await response.json();
          this.setState({
            showError: true,
            message: errorData.message || 'Booking failed.',
          });
        }
      } catch (error) {
        this.setState({
          showError: true,
          message: 'Error booking event.',
        });
        console.error('Error booking event:', error);
      }
    }
  };

  handleLike = async (event) => {
    const { eventId, title } = event;
    const { username } = this.state;

    try {
      const response = await fetch('http://localhost:3001/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username,
          eventId: eventId,
          title: title,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setState((prevState) => {
          const isLiked = prevState.likedEvents.includes(eventId);
          const newLikedEvents = isLiked
            ? prevState.likedEvents.filter((id) => id !== eventId)
            : [...prevState.likedEvents, eventId];

          return {
            likedEvents: newLikedEvents,
            events: prevState.events.map((e) =>
              e.eventId === eventId ? { ...e, liked: !isLiked } : e
            ),
            showSuccess: true,
            message: isLiked ? `Unliked "${title}"` : `Liked "${title}"!`,
          };
        });
      } else {
        const errorData = await response.json();
        this.setState({
          showError: true,
          message: errorData.message || 'Like action failed.',
        });
      }
    } catch (error) {
      this.setState({
        showError: true,
        message: 'Error liking/unliking event.',
      });
      console.error('Error liking/unliking event:', error);
    }
  };

  handlePriceChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
      this.setState({ maxPrice: value });
    }
  };

  render() {
    const { events, maxPrice, showSuccess, showError, message } = this.state;

    const parsedMaxPrice = parseFloat(maxPrice);

    const filteredEvents = maxPrice
      ? events.filter((event) => event.price <= parsedMaxPrice)
      : events;

    return (
      <Container className="Events py-5">
        <Row className="mb-4">
          <Col>
            <h2 className="title text-center mb-4 animated-title">Event List</h2>
          </Col>
        </Row>

        <Row className="justify-content-center mb-4">
          <Col xs={12} md={6} lg={4}>
            <Form>
              <Form.Group controlId="maxPrice" className="d-flex">
                <Form.Label className="me-2 my-auto"><strong>Max Price:</strong></Form.Label>
                <Form.Control
                  type="number"
                  placeholder="e.g., 50"
                  value={maxPrice}
                  onChange={this.handlePriceChange}
                />
              </Form.Group>
            </Form>
          </Col>
        </Row>

        {showSuccess && (
          <Alert variant="success" onClose={() => this.setState({ showSuccess: false })} dismissible className={`fade-in ${showSuccess ? 'show' : ''}`}>
            <Alert.Heading>Success!</Alert.Heading>
            <p>{message}</p>
          </Alert>
        )}
        {showError && (
          <Alert variant="danger" onClose={() => this.setState({ showError: false })} dismissible className={`fade-in ${showError ? 'show' : ''}`}>
            <Alert.Heading>Error!</Alert.Heading>
            <p>{message}</p>
          </Alert>
        )}

        <Row>
          <Col>
            <Table responsive hover className="events-table">
              <thead className="table-primary">
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Venue</th>
                  <th>Date/Time</th>
                  <th>Description</th>
                  <th>Presenter</th>
                  <th>Price</th>
                  <th>Like</th>
                  <th>Book</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => (
                  <tr key={event.eventId} className="event-row">
                    <td>{event.eventId}</td>
                    <td className="title-cell">{event.title}</td>
                    <td>{event.locId}</td>
                    <td className="date-cell">{event.date}</td>
                    <td className="description-cell" title={event.description}>
                      {event.description.length > 100
                        ? `${event.description.substring(0, 100)}...`
                        : event.description}
                    </td>
                    <td>{event.presenter}</td>
                    <td>${event.price}</td>
                    <td className="like-cell">
                      <i
                        className={`bi ${event.liked ? 'bi-star-fill text-danger' : 'bi-star'} like-icon`}
                        onClick={() => this.handleLike(event)}
                      ></i>
                    </td>
                    <td className="book-cell">
                      <Button
                        variant={event.booked ? "success" : "primary"}
                        disabled={event.booked}
                        onClick={() => this.handleBook(event)}
                        className="book-button"
                      >
                        {event.booked ? <i className="bi bi-check-circle me-2"></i> : <i className="bi bi-book me-2"></i>}
                        {event.booked ? "Booked" : "Book"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default Events;