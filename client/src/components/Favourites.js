// Favourites.js
import React from 'react';
import './../styles/Events.css';
import { Link } from 'react-router-dom';

class Favourites extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            favourites: [], // 存储收藏位置的详细信息
            allLocations: [], // 存储所有位置的数据
            allEvents: [], // 存储所有事件的数据
            isLoading: true, // 加载状态
            error: null, // 错误信息
        };
    }

    async componentDidMount() {
        try {
            // 获取收藏的 locIds
            let favourites = JSON.parse(localStorage.getItem('favourites') || '[]');
            // 确保 locId 的类型一致（假设 locId 是数字）
            favourites = favourites.map(id => Number(id));

            if (favourites.length === 0) {
                this.setState({ favourites: [], isLoading: false });
                return;
            }

            // 并行获取所有位置和所有事件
            const [locationsResponse, eventsResponse] = await Promise.all([
                fetch('http://localhost:3001/locations/show'),
                fetch('http://localhost:3001/events/all'),
            ]);

            if (!locationsResponse.ok) {
                throw new Error('Failed to fetch locations');
            }

            if (!eventsResponse.ok) {
                throw new Error('Failed to fetch events');
            }

            const allLocations = await locationsResponse.json();
            const allEvents = await eventsResponse.json();

            // 计算每个 locId 的事件数量
            const eventCountMap = this.getEventCountMap(allEvents);

            // 过滤出收藏的位置信息
            const favouritesWithDetails = favourites.map(locId => {
                const location = allLocations.find(loc => loc.locId === locId);
                if (location) {
                    const numEvents = eventCountMap[locId] || 0;
                    return { locId, name: location.name, numEvents };
                } else {
                    console.warn(`Location with ID ${locId} not found.`);
                    return { locId, name: 'Unknown', numEvents: 0 };
                }
            });

            this.setState({
                favourites: favouritesWithDetails,
                allLocations,
                allEvents,
                isLoading: false,
            });
        } catch (error) {
            console.error('Error loading favourites:', error);
            this.setState({ error: error.message, isLoading: false });
        }
    }

    getEventCountMap(events) {
        const countMap = {};
        events.forEach(event => {
            const id = Number(event.locId);
            if (countMap[id]) {
                countMap[id]++;
            } else {
                countMap[id] = 1;
            }
        });
        return countMap;
    }

    handleRemoveFavourite = locId => {
        // 获取当前收藏列表
        let favourites = JSON.parse(localStorage.getItem('favourites') || '[]');
        favourites = favourites.map(id => Number(id));
        // 移除指定的 locId
        favourites = favourites.filter(id => id !== locId);
        // 更新 localStorage
        localStorage.setItem('favourites', JSON.stringify(favourites));
        // 更新组件状态
        this.setState(prevState => ({
            favourites: prevState.favourites.filter(fav => fav.locId !== locId),
        }));
    }

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
                    <table style={{ width: "100%" }}>
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
                                            checked={false}
                                            onChange={() => this.handleRemoveFavourite(favourite.locId)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No favourites added yet.</p>
                )}
            </div>
        );
    }
}

export default Favourites;