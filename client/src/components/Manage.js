import React from 'react';
import './../styles/Manage.css';

class Manage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPage: 'NewEvent',
        };
    }

    navigateTo = (page) => {
        this.setState({ currentPage: page });
    };

    render() {
        const routerStyle = {
            listStyle: 'none',
            padding: '1vh',
            margin: 0,
            display: 'flex',
            justifyContent: 'flex-start',
            gap: '20px',
        };

        const linkStyle = {
            textDecoration: 'none',
            color: 'black',
            cursor: 'pointer',
        };

        const { currentPage } = this.state;

        return (
            <div>
                {/* 导航栏 */}
                <ul style={routerStyle}>
                    <li style={linkStyle} onClick={() => this.navigateTo('NewEvent')}>New Event</li>
                    <li style={linkStyle} onClick={() => this.navigateTo('ModifyEvent')}>Modify Event</li>
                    <li style={linkStyle} onClick={() => this.navigateTo('CreateUser')}>Create User</li>
                    <li style={linkStyle} onClick={() => this.navigateTo('ModifyUser')}>Modify User</li>
                </ul>

                <div>
                    {currentPage === 'NewEvent' && <NewEvent />}
                    {currentPage === 'ModifyEvent' && <ModifyEvent />}
                    {currentPage === 'CreateUser' && <CreateUser />}
                    {currentPage === 'ModifyUser' && <ModifyUser />}
                </div>
            </div>
        );
    }
}

class NewEvent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            eventID: "",
          eventName: '',
          eventDate: '',
          locId: '',
          presenter: '',
          eventDescription: '',
          eventPrice: 0
        };
    }
    
    handleSubmit = async(event) => {
        try{
        event.preventDefault();
        const form = document.getElementById('newEvent');
        const Eid = document.getElementById('new_eventID').value;
        const Ename = document.getElementById('new_eventName').value;
        const new_locId = document.getElementById('new_locID').value;
        const new_date = document.getElementById('new_eventDate').value;
        const new_des = document.getElementById('new_description').value;
        const presenter = document.getElementById('new_presenter').value;
        const price = document.getElementById('new_price').value;
        const content = {
            eventID: Eid,
            title: Ename,
            locID: new_locId,
            date: new_date,
            description: new_des,
            presenter: presenter,
            price: price
        };
        const response = await fetch('http://localhost:3001/admin/newEvent', 
            {method: 'POST', 
            credentials: 'include',
            body: JSON.stringify(content),
            headers:{
                'Content-Type': 'application/json',
            }
            });
        //console.log(response);
        const message = await response.text();
        document.getElementById('info').innerText = message;
        //form.reset();
        this.setState({
            eventID: "",
            eventName: "",
            eventDate: "",
            locId: "",
            presenter: "",
            eventDescription: "",
            eventPrice: ""});
    }
        catch(err){
            console.log(err);
        }
    }

    render() {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
  <div className="col-md-6 col-lg-4">
    <div className="p-4 bg-light rounded shadow">
      <form onSubmit={async (event) => { await this.handleSubmit(event); }} id='newEvent'>
        <div className="mb-3">
          <label htmlFor='new_eventID' className="form-label">Event ID:</label>
          <input 
            type="number" 
            id="new_eventID" 
            name="new_eventID" 
            value={this.state.eventID} 
            onChange={(event) => this.setState({ eventID: event.target.value })} 
            required 
            className="form-control"
          />
        </div>

        <div className="mb-3">
          <label htmlFor='new_eventName' className="form-label">Event title:</label>
          <input 
            type='text' 
            id="new_eventName" 
            name="new_eventName" 
            value={this.state.eventName} 
            onChange={(event) => this.setState({ eventName: event.target.value })} 
            required 
            className="form-control"
          />
        </div>

        <div className="mb-3">
          <label htmlFor='new_locID' className="form-label">Location ID (should be based on ID on location list):</label>
          <input 
            type="number" 
            id='new_locID' 
            name='new_locID' 
            value={this.state.locId} 
            onChange={(event) => this.setState({ locId: event.target.value })} 
            required 
            className="form-control"
          />
        </div>

        <div className="mb-3">
          <label htmlFor='new_eventDate' className="form-label">Date/time:</label>
          <input 
            type='datetime-local' // Changed from 'text' to 'datetime-local'
            id='new_eventDate' 
            name='new_eventDate'
            value={this.state.eventDate} 
            onChange={(event) => this.setState({ eventDate: event.target.value })} 
            required 
            className="form-control"
          />
        </div>

        <div className="mb-3">
          <label htmlFor='new_description' className="form-label">Description:</label>
          <textarea 
            id='new_description' 
            name='new_description' 
            value={this.state.eventDescription} 
            onChange={(event) => this.setState({ eventDescription: event.target.value })} 
            required 
            className="form-control"
          ></textarea>
        </div>

        <div className="mb-3">
          <label htmlFor='new_presenter' className="form-label">Presenter:</label>
          <input 
            type='text' 
            id='new_presenter' 
            name='new_presenter'
            value={this.state.presenter} 
            onChange={(event) => this.setState({ presenter: event.target.value })} 
            required 
            className="form-control"
          />
        </div>

        <div className="mb-3">
          <label htmlFor='new_price' className="form-label">Price:</label>
          <input 
            type='number' 
            id='new_price' 
            name='new_price' 
            value={this.state.eventPrice} 
            onChange={(event) => this.setState({ eventPrice: event.target.value })} 
            required 
            className="form-control"
          />
        </div>

        <p id="info"></p>

        <button type='submit' className="btn btn-primary w-100">Add new</button>
      </form>
    </div>
  </div>
</div>
        );
    }
}

class ModifyEvent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          eventName: '',
          eventDate: '',
          locId: '',
          presenter: '',
          eventDescription: '',
          eventPrice: 0
        };
    }

    handleSubmit = async(event) => {
        try{
        event.preventDefault();
        const form = document.getElementById('modifyEvent');
        const Eid = document.getElementById('eventID').value;
        const Ename = document.getElementById('eventName').value;
        const new_locId = document.getElementById('locID').value;
        const new_date = document.getElementById('eventDate').value;
        const new_des = document.getElementById('description').value;
        const presenter = document.getElementById('presenter').value;
        const price = document.getElementById('price').value;
        const content = {
            eventID: Eid,
            title: Ename,
            locID: new_locId,
            date: new_date,
            description: new_des,
            presenter: presenter,
            price: price
        };
        const response = await fetch('http://localhost:3001/admin/modifyEvent', 
            {method: 'POST', 
            credentials: 'include',
            body: JSON.stringify(content),
            headers:{
                'Content-Type': 'application/json',
            }
            });
        //console.log(response);
        const message = await response.text();
        document.getElementById('info').innerText = message;
        //form.reset();
        this.setState({eventName: "",
            eventDate: "",
            locId: "",
            presenter: "",
            eventDescription: "",
            eventPrice: ""});
    }
        catch(err){
            console.log(err);
        }
    }

    loadEvent = async() => {
        const Eid = Number(document.getElementById('eventID').value);
        const response = await fetch(`http://localhost:3001/events/${Eid}`);
        const data = await response.json();
        //console.log(data);
        this.setState({eventName: data.title,
            eventDate: data.date,
            locId: data.locId,
            presenter: data.presenter,
            eventDescription: data.description,
            eventPrice: data.price});
    }

    deleteEvent = async() => {
        const Eid = Number(document.getElementById('eventID').value);
        const response = await fetch(`http://localhost:3001/admin/events/${Eid}`, 
            {method: 'DELETE', 
            credentials: 'include',
            });
        const message = await response.text();
        document.getElementById('info').innerText = message;
        this.setState({eventName: "",
            eventDate: "",
            locId: "",
            presenter: "",
            eventDescription: "",
            eventPrice: ""});
    }

    render() {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="col-md-6 col-lg-4">
            <div className="p-4 bg-light rounded shadow">
                <form onSubmit={async (event) => {await this.handleSubmit(event)}} id='modifyEvent'>
                    <div className='mb-3 d-flex align-items-center'>
                    <label htmlFor='eventID' className="form-label me-2">Event ID:</label>
                    <input type="number" id="eventID" name="eventID" className="form-control" required/>
                    <button type="button" onClick={async () => await this.loadEvent()} style={{display: 'inline'}}>Load event</button>
                    </div>
                    <div className="mb-3">
                    <label htmlFor='eventName' className="form-label">Event title:</label>
                    <input type='text' id="eventName" name="eventName" className="form-control" value={this.state.eventName} onChange={(event) => {this.setState({eventName: event.target.value})}} required/>
                    </div>
                    <div className="mb-3">
                    <label htmlFor='locID' className="form-label">Location ID(should be based on ID on location list):</label>
                    <input type="number" id='locID' name='locID' className="form-control" value={this.state.locId} onChange={(event) => {this.setState({ locId: event.target.value })}} required/>
                    </div>
                    <div className="mb-3">
                    <label htmlFor='eventDate' className="form-label">Date/time:</label>
                    <input type='text' id='eventDate' name='eventDate' className="form-control" value={this.state.eventDate} onChange={(event) => { this.setState({ eventDate: event.target.value }) }} required/>
                    </div>
                    <div className="mb-3">
                    <label htmlFor='description' className="form-label">Description:</label>
                    <textarea id='description' name='description' className="form-control" value={this.state.eventDescription} onChange={(event) => { this.setState({ eventDescription: event.target.value}) }} required/>
                    </div>
                    <div className="mb-3">
                    <label htmlFor='presenter' className="form-label">Presenter:</label>
                    <input type='text' id='presenter' name='presenter' className="form-control" value={this.state.presenter} onChange={(event) => { this.setState({ presenter: event.target.value} ) }} required/>
                    </div>
                    <div className="mb-3">
                    <label htmlFor='price' className="form-label">Price:</label>
                    <input type='number' id='price' name='price' className="form-control" value={this.state.eventPrice} onChange={(event) => { this.setState({ eventPrice: event.target.value }) }} required/>
                    <p id="info"></p>
                    </div>
                    <div className="d-grid gap-2">
                    <button type='submit' className="btn btn-primary">Submit</button>
                    <button type='button' onClick={() => this.deleteEvent()}>Delete</button>
                    </div>
                </form>
                </div>
            </div>
            </div>
        );
    }
}

class CreateUser extends React.Component {
    handleSubmit = async(event) => {
        event.preventDefault();
        const formData = new FormData(event.target);

        const new_username = formData.get('new_username');
        const new_password = formData.get('new_password');
        const choice1 = formData.get('choice');
        const choice = choice1 === 'Yes';
        const content = {
            username: new_username,
            password: new_password,
            admin: choice
        };
        try{
            const response = await fetch('http://localhost:3001/admin/createUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(content),
                credentials: 'include'
            });
            const message = await response.text();
            alert(message);
            event.target.reset();
        }catch(err){
            console.log(err);
        }
    }

    render() {
        return (
                <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="col-md-6 col-lg-4">
          <div className="p-4 bg-light rounded shadow">
            <form onSubmit={async(event) => { await this.handleSubmit(event);}}>
              <div className="mb-3">
                <label htmlFor='new_username' className="form-label">New Username</label>
                <input 
                  type='text' 
                  id='new_username' 
                  name='new_username' 
                  required 
                  className="form-control"
                  onChange={this.handleChange}
                />
              </div>

              <div className="mb-3">
                <label htmlFor='new_password' className="form-label">New Password</label>
                <input 
                  type='password' 
                  id='new_password' 
                  name='new_password' 
                  required 
                  className="form-control"
                  onChange={this.handleChange}
                />
              </div>

              <fieldset className="mb-3 border p-3">
                <legend className="fw-bold">Please choose if it is admin:</legend>
                <div className="form-check">
                  <input 
                    type="radio" 
                    id="choiceYes" 
                    name="choice" 
                    value="Yes" 
                    required 
                    className="form-check-input"
                    onChange={this.handleChange}
                  />
                  <label htmlFor="choiceYes" className="form-check-label">Yes</label>
                </div>
                <div className="form-check">
                  <input 
                    type="radio" 
                    id="choiceNo" 
                    name="choice" 
                    value="No" 
                    className="form-check-input"
                    onChange={this.handleChange}
                  />
                  <label htmlFor="choiceNo" className="form-check-label">No</label>
                </div>
              </fieldset>

              <button type='submit' className="btn btn-primary w-100">Submit</button>
            </form>
          </div>
        </div>
      </div>
        );
    }
}

class ModifyUser extends React.Component {
    handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const new_username = formData.get('username');
        const new_password = formData.get('password');;
        const content = {
            username: new_username,
            password: new_password,
        };
        try{
            const response = await fetch('http://localhost:3001/admin/modifyUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(content),
                credentials: 'include'
            });
            const message = await response.text();
            alert(message);
            event.target.reset();
        }catch(err){
            console.log(err);
        }
    }

    deleteUser = async() => {
        const form = document.getElementById('modUser');
        const username = document.getElementById('username').value;
        if(username == '' | !username){
            alert('please enter a valid username');
            return;
        }
        else{
            const response = await fetch(`http://localhost:3001/admin/users/${username}`, {
                method: 'DELETE',
                credentials: 'include'}
            );
            const message = await response.text();
            alert(message);
            form.reset();
        }
    }

    render() {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="col-md-6 col-lg-4">
          <div className="p-4 bg-light rounded shadow">
            <form id='modUser' onSubmit={async (event) => { await this.handleSubmit(event);}}>
              <div className="mb-3">
                <label htmlFor='username' className="form-label">Targeted Username</label>
                <input 
                  type='text' 
                  id='username' 
                  name='username' 
                  required 
                  className="form-control"
                  onChange={this.handleChange}
                />
              </div>

              <div className="mb-3">
                <label htmlFor='password' className="form-label">New Password</label>
                <input 
                  type='password' 
                  id='password' 
                  name='password' 
                  required 
                  className="form-control"
                  onChange={this.handleChange}
                />
              </div>

              <div className="d-grid gap-2">
                <button type='button' onClick={ async() => { await this.deleteUser();}} className="btn btn-danger">Delete</button>
                <button type='submit' className="btn btn-primary">Change Password</button>
              </div>
            </form>
          </div>
        </div>
      </div>
        );
    }
}

export default Manage;
