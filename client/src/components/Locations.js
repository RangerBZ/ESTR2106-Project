// location.js
import React from 'react';
import './../styles/Events.css';
import './../styles/Locations.css';
import { Link } from 'react-router-dom';

class Locations extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      error: null,
      checked: false,
      categories: ['All'],
    };
  }

  componentDidMount() {
    try {
      // Extract unique categories from location names
      const categoriesSet = new Set(['All']);
      this.props.allLocationsOriginal.forEach(location => {
        const categoryMatch = location.name.match(/\(([^)]+)\)$/);
        if (categoryMatch && categoryMatch[1]) {
          categoriesSet.add(categoryMatch[1].trim());
        }
      });
      const categories = Array.from(categoriesSet);

      this.setState({
        categories,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error processing categories:', error);
      this.setState({ error: error.message, isLoading: false });
    }
  }

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

  handleFavourite = locId => {
    const favourites = JSON.parse(localStorage.getItem('favourites') || '[]');
    const index = favourites.indexOf(locId);

    if (index > -1) {
      favourites.splice(index, 1);
    } else {
      favourites.push(locId);
    }

    localStorage.setItem('favourites', JSON.stringify(favourites));
    this.setState(prevState => ({ checked: !prevState.checked }));
  }

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
    const { isLoading, error, categories } = this.state;
    const { filters, allLocations, allEvents } = this.props;

    if (isLoading) {
      return <div className='Favourites'><p>Loading...</p></div>;
    }

    if (error) {
      return <div className='Favourites'><p>Error: {error}</p></div>;
    }

    return (
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
            <label htmlFor="category-filter" className='filter-label'>Filter by Category</label>
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
            <label htmlFor="search" className='filter-label'>Search for Locations</label>
            <div className='search-container'>
              <input
                type="text"
                id="search"
                placeholder="Search..."
                value={filters.searchText}
                onChange={this.handleSearchChange}
                className='search-input'
              />
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
                  <span className='sort-icons'>
                    <i
                      className="bi bi-chevron-up"
                      onClick={this.sortAscending}
                      title="Sort Ascending"
                      aria-label="Sort by ascending number of events"
                    ></i>
                    <i
                      className="bi bi-chevron-down"
                      onClick={this.sortDescending}
                      title="Sort Descending"
                      aria-label="Sort by descending number of events"
                    ></i>
                  </span>
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
                          checked={JSON.parse(localStorage.getItem('favourites') || '[]').includes(location.locId)}
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
    );
  }
}

export default Locations;