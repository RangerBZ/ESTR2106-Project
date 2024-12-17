// Favourites.js
import React from 'react';
import './../styles/Favourite.css';
import { Link } from 'react-router-dom';

class Favourites extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        username: '',
        favourites: [],
        isLoading: true,
        error: null,
      };
    }
  
    componentDidMount() {
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
          this.fetchFavourites();
        });
      } catch (error) {
        console.error('Error fetching current user:', error);
        this.setState({ error: error.message, isLoading: false });
      }
    };

    fetchFavourites = async () => {
        const { username } = this.state;
    
        try {
        // 并行获取收藏位置和所有事件
        const [favouritesResponse, eventsResponse] = await Promise.all([
            fetch(`http://localhost:3001/favourites/${username}`, {
            method: 'GET',
            credentials: 'include',
            }),
            fetch('http://localhost:3001/events/all', {
            method: 'GET',
            credentials: 'include',
            }),
        ]);
    
        if (!favouritesResponse.ok) {
            throw new Error('Failed to fetch favourites');
        }
    
        if (!eventsResponse.ok) {
            throw new Error('Failed to fetch events');
        }
    
        const favouritesData = await favouritesResponse.json();
        const eventsData = await eventsResponse.json();
    
        const allEvents = eventsData; // 所有事件列表
    
        // 计算每个 locId 的事件数量
        const eventCountMap = this.getEventCountMap(allEvents);
    
        // 合并收藏位置和事件数量
        const favouritesWithDetails = favouritesData.favourites.map(location => {
            const locId = location.locId;
            const numEvents = eventCountMap[locId] || 0;
            return { ...location, numEvents };
        });
    
        this.setState({
            favourites: favouritesWithDetails,
            isLoading: false,
        });
        } catch (error) {
        console.error('Error loading favourites:', error);
        this.setState({ error: error.message, isLoading: false });
        }
    };

    getEventCountMap(events) {
        const countMap = {};
        events.forEach(event => {
          const locId = Number(event.locId);
          if (countMap[locId]) {
            countMap[locId]++;
          } else {
            countMap[locId] = 1;
          }
        });
        return countMap;
      }

      handleRemoveFavourite = async locId => {
        const { username } = this.state;
    
        try {
          const response = await fetch('http://localhost:3001/favourites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              username: username,
              locId: locId,
            }),
          });
    
          if (response.ok) {
            const data = await response.json();
            console.log(data.message);
    
            // 更新状态
            this.setState(prevState => ({
              favourites: prevState.favourites.filter(fav => fav.locId !== locId),
            }));
          } else {
            const errorData = await response.json();
            console.error('Favourites action failed', errorData.message);
          }
        } catch (error) {
          console.error('Error updating favourites:', error);
        }
      };

      render() {
        const { favourites, isLoading, error } = this.state;
    
        if (isLoading) {
          return <div className='Favourites'><p>Loading...</p></div>;
        }
    
        if (error) {
          return <div className='Favourites'><p>Error: {error}</p></div>;
        }
    
        return (
          <div className='Favourites'>
            <h2>My Favourite Locations</h2>
            {favourites.length > 0 ? (
              <div className='table-container'>
                <table className='favourite-table' style={{ width: "100%" }}>
                  <thead>
                    <tr style={{ borderBottom: "solid" }}>
                      <th>ID</th>
                      <th>Location</th>
                      <th>Num of Events</th>
                      <th>Remove from Favourites</th>
                    </tr>
                  </thead>
                  <tbody>
                    {favourites.map(favourite => (
                      <tr key={favourite.locId} style={{ borderBottom: "dashed" }}>
                        <td>{favourite.locId}</td>
                        <td>
                          <Link to={`/locations/${favourite.locId}`}>{favourite.name}</Link>
                        </td>
                        <td>{favourite.numEvents}</td>
                        <td>
                          <input
                            type="checkbox"
                            checked={true}
                            onChange={() => this.handleRemoveFavourite(favourite.locId)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No favourites added yet.</p>
            )}
          </div>
        );
      }

    }

export default Favourites;