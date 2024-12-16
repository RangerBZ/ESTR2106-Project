import React from 'react';
import { AuthContext } from '../services/AuthContext';
//import { useNavigate } from 'react-router-dom';
import { login, getAdmin } from '../services/login';

class Login extends React.Component {
    static contextType = AuthContext;

    handleLogin = async () => {
        const username = document.getElementById('name').value;
        const password = document.getElementById('password').value;
        const success = await login(username, password);
        if(success){
            if(getAdmin())
            {
                this.context.login(true,username);
            }
            else this.context.login(false,username);
            //this.props.navigate('/');
        }
    }

    handleRegister = async() => {
        const username = document.getElementById('name').value;
        const password = document.getElementById('password').value;
        const content = {
          username: username,
          password: password
        }
        try{
        const response = await fetch('http://localhost:3001/register', {
          method: 'POST',
          body: JSON.stringify(content),
          headers:{
            'Content-Type': 'application/json'
          }
        });
        const message = await response.text();
        alert(message);
      }catch(err){
        console.log(err);
      }
    }

    render(){
    return (
      <div>
        <br /><br /><br />
        <h2 style={{textAlign:"center"}}>Login Page</h2>
        <div className='container'>
          <form onSubmit={async (e) => { e.preventDefault();await this.handleLogin(); }} style={{marginLeft:'40vw'}}>
          <label htmlFor="name">Username</label><br />
          <input 
            type='text' 
            id="name" 
            name="name" 
            required
          /><br /><br/>

          <label htmlFor="password">Password</label><br />
          <input 
            type='password' // Changed from 'text' to 'password'
            id="password" 
            name="password" 
            required
          /><br /><br/>

          <button id="sub" type="submit">Log In</button>
          <button type='button' onClick={async() => { await this.handleRegister();}}>Register</button>
          </form>
        </div>
    </div>
    );
}
}

export default Login;