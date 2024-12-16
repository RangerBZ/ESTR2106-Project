import React from 'react';

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
            padding: 0,
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
            <div>
                <form onSubmit={async (event) => {await this.handleSubmit(event)}} id='newEvent'>
                    <label htmlFor='new_eventID'>Event ID:</label>
                    <input type="number" id="new_eventID" name="new_eventID" value={this.state.eventID} onChange={(event) => { this.setState({eventID: event.target.value})}} required/>
                    <label htmlFor='new_eventName'>Event title:</label>
                    <input type='text' id="new_eventName" name="new_eventName" value={this.state.eventName} onChange={(event) => {this.setState({eventName: event.target.value})}} required/>
                    <br></br>
                    <label htmlFor='new_locID'>Location ID(should be based on ID on location list):</label>
                    <input type="number" id='new_locID' name='new_locID' value={this.state.locId} onChange={(event) => {this.setState({locId: event.target.value})}} required/>
                    <br></br>
                    <label htmlFor='new_eventDate'>Date/time:</label>
                    <input type='text' id='new_eventDate' name='new_eventDate'value={this.state.eventDate} onChange={(event) => {this.setState({eventDate: event.target.value})}} required/>
                    <br></br>
                    <label htmlFor='new_description'>Description:</label>
                    <textarea id='new_description' name='new_description' value={this.state.eventDescription} onChange={(event) => {this.setState({eventDescription: event.target.value})}} required/>
                    <br></br>
                    <label htmlFor='new_presenter'>Presenter:</label>
                    <input type='text' id='new_presenter' name='new_presenter'value={this.state.presenter} onChange={(event) => {this.setState({presenter: event.target.value})}} required/>
                    <br></br>
                    <label htmlFor='new_price'>Price:</label>
                    <input type='number' id='new_price' name='new_price' value={this.state.eventPrice} onChange={(event) => {this.setState({eventPrice: event.target.value})}} required/>
                    <br></br>
                    <p id="info"></p>
                    <br></br>
                    <button type='submit'>Add new</button>
                </form>
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
            <div>
                <form onSubmit={async (event) => {await this.handleSubmit(event)}} id='modifyEvent'>
                    <label htmlFor='eventID'>Event ID:</label>
                    <input type="number" id="eventID" name="eventID" required/>
                    <button type="button" onClick={async () => await this.loadEvent()} style={{display: 'inline'}}>Load event</button>
                    <br></br>
                    <label htmlFor='eventName'>Event title:</label>
                    <input type='text' id="eventName" name="eventName" value={this.state.eventName} onChange={(event) => {this.setState({eventName: event.target.value})}} required/>
                    <br></br>
                    <label htmlFor='locID'>Location ID(should be based on ID on location list):</label>
                    <input type="number" id='locID' name='locID' value={this.state.locId} onChange={(event) => {this.setState({ locId: event.target.value })}} required/>
                    <br></br>
                    <label htmlFor='eventDate'>Date/time:</label>
                    <input type='text' id='eventDate' name='eventDate' value={this.state.eventDate} onChange={(event) => { this.setState({ eventDate: event.target.value }) }} required/>
                    <br></br>
                    <label htmlFor='description'>Description:</label>
                    <textarea id='description' name='description' value={this.state.eventDescription} onChange={(event) => { this.setState({ eventDescription: event.target.value}) }} required/>
                    <br></br>
                    <label htmlFor='presenter'>Presenter:</label>
                    <input type='text' id='presenter' name='presenter' value={this.state.presenter} onChange={(event) => { this.setState({ presenter: event.target.value} ) }} required/>
                    <br></br>
                    <label htmlFor='price'>Price:</label>
                    <input type='number' id='price' name='price' value={this.state.eventPrice} onChange={(event) => { this.setState({ eventPrice: event.target.value }) }} required/>
                    <br></br>
                    <p id="info"></p>
                    <br></br>
                    <button type='submit'>Submit</button>
                    <button type='button' onClick={() => this.deleteEvent()}>Delete</button>
                </form>
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
            <div>
                <form onSubmit={async(event) => { await this.handleSubmit(event);}}>
                    <label htmlFor='new_username'>New Username</label>
                    <input type='text' id='new_username' name='new_username' required/>
                    <br></br>
                    <label htmlFor='new_password'>New password</label>
                    <input type='password' id='new_password' name='new_password' required/>
                    <br></br>
                    <fieldset>
                    <legend>Please choose if it is admin:</legend>
                    <label>
                    <input type="radio" name="choice" value="Yes" required/> Yes
                    </label>
                    <br></br>
                    <label>
                    <input type="radio" name="choice" value="No"/> No
                    </label>
                    <br></br>
                    </fieldset>
                    <button type='submit'>submit</button>
                </form>
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
            <div>
                <form id='modUser' onSubmit={async (event) => { await this.handleSubmit(event);}}>
                    <label htmlFor='username'>targeted Username</label>
                    <input type='text' id='username' name='username' required/>
                    <br></br>
                    <label htmlFor='password'>New password</label>
                    <input type='password' id='password' name='password' required/>
                    <br></br>
                    <button type='button' onClick={ async() => { await this.deleteUser();}}>Delete</button>
                    <button type='submit'>Change password</button>
                </form>
            </div>
        );
    }
}

export default Manage;
