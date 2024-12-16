import React from 'react';
import './../styles/Events.css';

class Events extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      maxPrice: '',
      bookedEvents: [], // State to track booked events
      username: '', // State to track current username
    };
  }

  componentDidMount() {
    // Fetch all events and the current user when the component mounts
    this.fetchEvents();
    this.getCurrentUser();
  }

  getCurrentUser = async () => {
    try {
      // Assuming you have an API to get current user info
      const response = await fetch('http://localhost:3001/currentUser', {
        method: 'GET',
        credentials: 'include', // Include cookies if you are using them for authentication
      });
      const data = await response.json();
      this.setState({ username: data.username }, () => {
        // After setting username, fetch booked events for this user
        this.fetchBookedEvents();
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
      const eventsWithLiked = data.map((event) => ({
        ...event,
        liked: false,
      }));
      this.setState({ events: eventsWithLiked });
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

      // Update the events list to reflect booked events
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

  handleLike = (eventId) => {
    this.setState(prevState => ({
        events: prevState.events.map(event =>
            event.eventId === eventId
                ? { ...event, liked: !event.liked }
                : event
        )
    }));
};

  handleBook = async (event) => {
    const { eventId, title } = event;
    const { username } = this.state;

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
        // Booking successful
        this.setState((prevState) => ({
          bookedEvents: [...prevState.bookedEvents, event],
          events: prevState.events.map((e) =>
            e.eventId === eventId ? { ...e, booked: true } : e
          ),
        }));
      } else {
        console.error('Booking failed');
      }
    } catch (error) {
      console.error('Error booking event:', error);
    }
  };

  handlePriceChange = (e) => {
    const value = e.target.value;
    // Ensure that only numeric values are accepted
    if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
      this.setState({ maxPrice: value });
    }
  };

  render() {
    const { events, maxPrice } = this.state;

    // Convert maxPrice to a number for comparison
    const parsedMaxPrice = parseFloat(maxPrice);

    // Filter events based on maxPrice
    const filteredEvents = maxPrice
      ? events.filter((event) => event.price <= parsedMaxPrice)
      : events;

    return (
      <div className="Events">
        <div className="events-header">
          <h2 className="title">Event List:</h2>
          <div className="price-filter">
            <label htmlFor="maxPrice">Max Price: </label>
            <input
              type="text"
              id="maxPrice"
              name="maxPrice"
              value={maxPrice}
              onChange={this.handlePriceChange}
              placeholder="e.g., 50"
            />
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th style={{ width: '5%' }}>ID</th>
              <th style={{ width: '15%' }}>Title</th>
              <th style={{ width: '5%' }}>Venue</th>
              <th style={{ width: '5%' }}>Date/Time</th>
              <th style={{ width: '25%' }}>Description</th>
              <th style={{ width: '10%' }}>Presenter</th>
              <th style={{ width: '5%' }}>Price</th>
              <th style={{ width: '5%' }}>Like</th>
              <th style={{ width: '5%' }}>Book</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((event) => (
              <tr key={event.eventId}>
                <td>{event.eventId}</td>
                <td>{event.title}</td>
                <td>{event.locId}</td>
                <td className="date-cell">{event.date}</td>
                <td
                  className="description-cell"
                  title={event.description}
                >
                  {event.description.length > 100
                    ? `${event.description.substring(0, 100)}...`
                    : event.description}
                </td>
                <td>{event.presenter}</td>
                <td>{event.price}</td>
                <td className="like-cell">
                  {/* Like functionality remains the same */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill={event.liked ? 'red' : 'currentColor'}
                    className="bi bi-star-fill"
                    viewBox="0 0 16 16"
                    onClick={() => this.handleLike(event.eventId)}
                    style={{ cursor: 'pointer' }}
                  >
                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                  </svg>
                </td>
                <td className="book-cell">
                  <i
                    className="bi bi-check-circle"
                    style={{
                      color: event.booked ? 'green' : 'black',
                      cursor: 'pointer',
                    }}
                    onClick={() => this.handleBook(event)}
                  ></i>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default Events;