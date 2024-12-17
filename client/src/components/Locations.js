<<<<<<< HEAD
// src/components/Locations.js
=======
// location.js
>>>>>>> 2fb5d5ba1dc36d2d5fb94e2d6afb871001e1ced3
import React from 'react';
import './../styles/Locations.css';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Form, Table, Button, Alert } from 'react-bootstrap';

class Locations extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
<<<<<<< HEAD
      favourites: [],
      isLoading: true,
      error: null,
      categories: ['All'],
      showSuccess: false, // 显示成功消息
      showError: false,   // 显示错误消息
      message: '',        // 消息内容
=======
      favourites: [], 
      isLoading: true,
      error: null,
      checked: false,
      categories: ['All'],
>>>>>>> 2fb5d5ba1dc36d2d5fb94e2d6afb871001e1ced3
    };
  }

  componentDidMount() {
<<<<<<< HEAD
    this.getCurrentUser();
    this.extractCategories();
  }

  extractCategories = () => {
    try {
=======
    try {
      // Extract unique categories from location names
      this.getCurrentUser();
>>>>>>> 2fb5d5ba1dc36d2d5fb94e2d6afb871001e1ced3
      const categoriesSet = new Set(['All']);
      this.props.allLocationsOriginal.forEach(location => {
        const categoryMatch = location.name.match(/\(([^)]+)\)$/);
        if (categoryMatch && categoryMatch[1]) {
          categoriesSet.add(categoryMatch[1].trim());
        }
      });
      const categories = Array.from(categoriesSet);
<<<<<<< HEAD
=======

>>>>>>> 2fb5d5ba1dc36d2d5fb94e2d6afb871001e1ced3
      this.setState({
        categories,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error processing categories:', error);
      this.setState({ error: error.message, isLoading: false });
    }
<<<<<<< HEAD
  };

=======
  }
>>>>>>> 2fb5d5ba1dc36d2d5fb94e2d6afb871001e1ced3
  getCurrentUser = async () => {
    try {
      const response = await fetch('http://localhost:3001/currentUser', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
<<<<<<< HEAD
=======

>>>>>>> 2fb5d5ba1dc36d2d5fb94e2d6afb871001e1ced3
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
<<<<<<< HEAD
=======

>>>>>>> 2fb5d5ba1dc36d2d5fb94e2d6afb871001e1ced3
    try {
      const response = await fetch(`http://localhost:3001/favourites/${username}`, {
        method: 'GET',
        credentials: 'include',
      });
<<<<<<< HEAD
      const data = await response.json();
      const favouriteLocIds = data.favourites.map(loc => loc.locId);
=======

      const data = await response.json();
      const favouriteLocIds = data.favourites.map(loc => loc.locId);

>>>>>>> 2fb5d5ba1dc36d2d5fb94e2d6afb871001e1ced3
      this.setState({
        favourites: favouriteLocIds,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching favourites:', error);
      this.setState({ error: error.message, isLoading: false });
    }
  };

  getNum = (events, id) => {
    return events.filter(event => event.locId === id).length;
  }

  sortAscending = () => {
    this.props.setFilters({
      ...this.props.filters,
      sortOrder: 'asc'
    });
  }

  sortDescending = () => {
    this.props.setFilters({
      ...this.props.filters,
      sortOrder: 'desc'
    });
  }

  handleFavourite = async locId => {
    const { username } = this.state;
<<<<<<< HEAD
=======

>>>>>>> 2fb5d5ba1dc36d2d5fb94e2d6afb871001e1ced3
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
<<<<<<< HEAD
=======

>>>>>>> 2fb5d5ba1dc36d2d5fb94e2d6afb871001e1ced3
        // 更新状态
        this.setState(prevState => ({
          favourites: prevState.favourites.includes(locId)
            ? prevState.favourites.filter(id => id !== locId)
            : [...prevState.favourites, locId],
<<<<<<< HEAD
          showSuccess: true,
          message: prevState.favourites.includes(locId) ? 'Removed from favourites!' : 'Added to favourites!',
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
=======
        }));
      } else {
        const errorData = await response.json();
        console.error('Favourites action failed', errorData.message);
      }
    } catch (error) {
      console.error('Error updating favourites:', error);
>>>>>>> 2fb5d5ba1dc36d2d5fb94e2d6afb871001e1ced3
    }
  };

  handleSearchChange = (event) => {
    this.props.setFilters({
      ...this.props.filters,
      searchText: event.target.value
    });
  }

  handleCategoryChange = (event) => {
    this.props.setFilters({
      ...this.props.filters,
      selectedCategory: event.target.value
    });
  }

  handleDistanceChange = (event) => {
    this.props.setFilters({
      ...this.props.filters,
      distance: Number(event.target.value)
    });
  }

  render() {
<<<<<<< HEAD
    const { isLoading, error, categories, favourites, showSuccess, showError, message } = this.state;
    const { filters, allLocations, allEvents } = this.props;

=======
    const { isLoading, error, categories, favourites } = this.state;
    const { filters, allLocations, allEvents } = this.props;
    
>>>>>>> 2fb5d5ba1dc36d2d5fb94e2d6afb871001e1ced3
    if (isLoading) {
      return <div className='Favourites'><p>Loading...</p></div>;
    }

    if (error) {
      return <div className='Favourites'><p>Error: {error}</p></div>;
    }

    return (
<<<<<<< HEAD
      <Container fluid className='locations-container py-4'>
        {/* User Feedback Messages */}
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

        {/* Header Section */}
        <Row className='mb-4'>
          <Col>
            <h2 className="location-title text-center animated-title">Location List</h2>
          </Col>
        </Row>

        {/* Filters Section */}
        <Row className='mb-4 justify-content-center'>
          {/* Filter by Distance */}
          <Col xs={12} md={6} lg={3} className='filter-item'>
            <Form.Group controlId="distance-slider">
              <Form.Label className='filter-label'><i className="bi bi-sliders"></i> Filter by Distance</Form.Label>
              <div className='d-flex align-items-center'>
                <Form.Range
                  min="1"
                  max="25"
                  value={filters.distance}
                  onChange={this.handleDistanceChange}
                  className='distance-slider me-2'
                />
                <span className='distance-value'>{filters.distance} km</span>
              </div>
            </Form.Group>
          </Col>

          {/* Filter by Category */}
          <Col xs={12} md={6} lg={3} className='filter-item'>
            <Form.Group controlId="category-filter">
              <Form.Label className='filter-label'><i className="bi bi-funnel"></i> Filter by Category</Form.Label>
              <Form.Select
                value={filters.selectedCategory}
                onChange={this.handleCategoryChange}
                className='category-select'
              >
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          {/* Search Section */}
          <Col xs={12} md={12} lg={3} className='filter-item'>
            <Form.Group controlId="search">
              <Form.Label className='filter-label'><i className="bi bi-search"></i> Search for Locations</Form.Label>
              <Form.Control
                type="text"
=======
      <div className='locations-container'>
        {/* Left Section: Location List Title */}
        <div className='left-section'>
          <h2 className="location-title">Location List</h2>
        </div>

        {/* Right Section: Filters */}
        <div className='right-section'>
          {/* Filter by Distance */}
          <div className='filter-item distance-filter'>
            <label htmlFor="distance-slider" className='filter-label'>Filter by Distance</label>
            <input
              type="range"
              id="distance-slider"
              min="1"
              max="25"
              value={filters.distance}
              onChange={this.handleDistanceChange}
              className='distance-slider'
            />
            <span className='distance-value'>{filters.distance} km</span>
          </div>

          {/* Filter by Category */}
          <div className='filter-item category-filter'>
            <label htmlFor="category-filter" className='filter-label'><i class="bi bi-funnel"></i>Filter by Category</label>
            <select
              id="category-filter"
              value={filters.selectedCategory}
              onChange={this.handleCategoryChange}
              className='category-select'
            >
              {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Search Section */}
          <div className='filter-item search-filter'>
            <label htmlFor="search" className='filter-label'><i class="bi bi-search"></i>Search for Locations</label>
            <div className='search-container'>
              <input
                type="text"
                id="search"
>>>>>>> 2fb5d5ba1dc36d2d5fb94e2d6afb871001e1ced3
                placeholder="Search..."
                value={filters.searchText}
                onChange={this.handleSearchChange}
                className='search-input'
              />
<<<<<<< HEAD
            </Form.Group>
          </Col>
        </Row>

        {/* Table Section */}
        <Row>
          <Col>
            <Table responsive hover className='locations-table'>
              <thead className="table-primary">
                <tr>
                  <th>ID</th>
                  <th>Location</th>
                  <th>
                    Num of Events
                    <div className='sort-icons ms-2'>
                      <i
                        className="bi bi-sort-numeric-down-alt"
                        onClick={this.sortDescending}
                        title="Sort Descending"
                        aria-label="Sort by descending number of events"
                      ></i>
                      <i
                        className="bi bi-sort-numeric-down"
                        onClick={this.sortAscending}
                        title="Sort Ascending"
                        aria-label="Sort by ascending number of events"
                      ></i>
                    </div>
                  </th>
                  <th>Add to Favourites</th>
                </tr>
              </thead>
              <tbody>
                {allLocations.length > 0 ? (
                  allLocations.map(location => (
                    <tr key={location.locId} className="location-row">
                      <td>{location.locId}</td>
                      <td>
                        <Link to={`/locations/${location.locId}`} className='location-link'>{location.name}</Link>
                      </td>
                      <td>{this.getNum(allEvents, location.locId)}</td>
                      <td>
                        <Form.Check
                          type="checkbox"
                          onChange={() => this.handleFavourite(location.locId)}
                          checked={favourites.includes(location.locId)}
                          aria-label={`Add ${location.name} to favourites`}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className='text-center'>No locations match your criteria!</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>
=======
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className='table-container'>
          <table className='locations-table'>
            <thead>
              <tr>
                <th>ID</th>
                <th>Location</th>
                <th>
                  Num of Events  
                  <div className='sort-icons'>
                    
                    <i
                      className="bi bi-sort-numeric-down-alt"
                      onClick={this.sortDescending}
                      title="Sort Ascending"
                      aria-label="Sort by ascending number of events"
                    ></i>
                    <i
                      className="bi bi-sort-numeric-down"
                      onClick={this.sortAscending}
                      title="Sort Descending"
                      aria-label="Sort by descending number of events"
                    ></i>
                  </div>
                </th>
                <th>Add to Favourites</th>
              </tr>
            </thead>
            <tbody>
              {allLocations.length > 0 ? (
                allLocations.map(location => (
                  <tr key={location.locId}>
                    <td>{location.locId}</td>
                    <td>
                      <Link to={`/locations/${location.locId}`}>{location.name}</Link>
                    </td>
                    <td>{this.getNum(allEvents, location.locId)}</td>
                    <td>
                      <input
                        type="checkbox"
                        onChange={() => this.handleFavourite(location.locId)}
                        checked={favourites.includes(location.locId)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>No locations match your criteria!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
>>>>>>> 2fb5d5ba1dc36d2d5fb94e2d6afb871001e1ced3
    );
  }
}

export default Locations;