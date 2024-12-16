import React from 'react';
import './../styles/Events.css';

class Events extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            events: [],
            maxPrice: ''
        };
    }

    componentDidMount() {
        // Fetch all events when the component mounts
        this.fetchEvents();
    }

    fetchEvents = async () => {
        try {
            const response = await fetch('http://localhost:3001/events/all', {
                method: 'GET',
            }); // Assuming the backend provides an API to get all events
            const data = await response.json();
            const eventsWithLiked = data.map(event => ({
                ...event,
                liked: false
            }));
            this.setState({ events: eventsWithLiked });
        } catch (error) {
            console.error('Error fetching events:', error);
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

    handlePriceChange = (e) => {
        const value = e.target.value;
        // Ensure that only numeric values are accepted
        if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
            this.setState({ maxPrice: value });
        }
    };

    render(){
        const { events, maxPrice } = this.state;

        // Convert maxPrice to a number for comparison
        const parsedMaxPrice = parseFloat(maxPrice);

        // Filter events based on maxPrice
        const filteredEvents = maxPrice
            ? events.filter(event => event.price <= parsedMaxPrice)
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
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEvents.map(event => (
                            <tr key={event.eventId}>
                                <td>{event.eventId}</td>
                                <td>{event.title}</td>
                                <td>{event.locId}</td>
                                <td className="date-cell" >{event.date}</td>
                                <td className="description-cell" title={event.description}>
                                    {event.description.length > 100 
                                        ? `${event.description.substring(0, 100)}...` 
                                        : event.description}
                                </td>
                                <td>{event.presenter}</td>
                                <td>{event.price}</td>
                                <td className="like-cell" >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        fill={event.liked ? "red" : "currentColor"}
                                        className="bi bi-star-fill"
                                        viewBox="0 0 16 16"
                                        onClick={() => this.handleLike(event.eventId)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                                    </svg>
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