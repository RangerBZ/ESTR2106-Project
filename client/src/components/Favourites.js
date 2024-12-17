// src/components/Favourites.js
import React from 'react';
import './../styles/Favourite.css';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Table, Button, Alert } from 'react-bootstrap';

class Favourites extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            favourites: [],
            isLoading: true,
            error: null,
            showSuccess: false, // 显示成功消息
            showError: false,   // 显示错误消息
            message: '',        // 消息内容
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
            if (!response.ok) {
                throw new Error('Failed to fetch current user');
            }
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
                    showSuccess: true,
                    message: 'Removed from favourites!',
                }));
            } else {
                const errorData = await response.json();
                this.setState({
                    showError: true,
                    message: errorData.message || 'Favourites action failed.',
                });
            }
        } catch (error) {
            console.error('Error updating favourites:', error);
            this.setState({
                showError: true,
                message: 'Error updating favourites.',
            });
        }
    };

    render() {
        const { favourites, isLoading, error, showSuccess, showError, message } = this.state;

        if (isLoading) {
            return (
                <Container className='Favourites py-5'>
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
                <Container className='Favourites py-5'>
                    <Row className='justify-content-center'>
                        <Col xs={12} className='text-center'>
                            <p>Error: {error}</p>
                        </Col>
                    </Row>
                </Container>
            );
        }

        return (
            <Container fluid className='Favourites py-4'>
                {/* 用户反馈消息 */}
                {showSuccess && (
                    <Alert
                        variant="success"
                        onClose={() => this.setState({ showSuccess: false })}
                        dismissible
                        className={`fade-in ${showSuccess ? 'show' : ''}`}
                    >
                        <Alert.Heading>Success!</Alert.Heading>
                        <p>{message}</p>
                    </Alert>
                )}
                {showError && (
                    <Alert
                        variant="danger"
                        onClose={() => this.setState({ showError: false })}
                        dismissible
                        className={`fade-in ${showError ? 'show' : ''}`}
                    >
                        <Alert.Heading>Error!</Alert.Heading>
                        <p>{message}</p>
                    </Alert>
                )}

                {/* 标题部分 */}
                <Row className='mb-4'>
                    <Col>
                        <h2 className="favourites-title text-center animated-title">My Favourite Locations</h2>
                    </Col>
                </Row>

                {/* 表格部分 */}
                <Row>
                    <Col>
                        {favourites.length > 0 ? (
                            <div className='table-container'>
                                <Table responsive hover className='favourite-table'>
                                    <thead className="table-primary">
                                        <tr>
                                            <th>ID</th>
                                            <th>Location</th>
                                            <th>Num of Events</th>
                                            <th>Remove from Favourites</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {favourites.map(favourite => (
                                            <tr key={favourite.locId} className="favourite-row">
                                                <td>{favourite.locId}</td>
                                                <td>
                                                    <Link to={`/locations/${favourite.locId}`} className='location-link'>{favourite.name}</Link>
                                                </td>
                                                <td>{favourite.numEvents}</td>
                                                <td>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => this.handleRemoveFavourite(favourite.locId)}
                                                        className='remove-button'
                                                        aria-label={`Remove ${favourite.name} from favourites`}
                                                    >
                                                        <i className="bi bi-trash"></i>
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
                                    <p>No favourites added yet.</p>
                                </Col>
                            </Row>
                        )}
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default Favourites;