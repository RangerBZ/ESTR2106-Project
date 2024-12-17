import React from 'react';
import { AuthContext } from '../services/AuthContext';
//import { useNavigate } from 'react-router-dom';
import { login, getAdmin } from '../services/login';
import './../styles/Login.css';

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
      <div className="login-container">
  <div className="login-form">
    <h2 className="text-center mb-4">Login Page</h2>
    <form onSubmit={async (e) => { e.preventDefault(); await this.handleLogin(); }}>
      <div className="mb-3">
        <label htmlFor="name" className="form-label">Username</label>
        <input 
          type='text' 
          id="name" 
          name="name" 
          className="form-control" 
          required
        />
      </div>
      <div className="mb-3">
        <label htmlFor="password" className="form-label">Password</label>
        <input 
          type='password' // Changed from 'text' to 'password'
          id="password" 
          name="password" 
          className="form-control" 
          required
        />
      </div>
      <div className="d-grid gap-2">
        <button className="btn btn-primary" type="submit">Log In</button>
        <button className="btn btn-secondary" type='button' onClick={async() => { await this.handleRegister();}}>Register</button>
      </div>
    </form>
  </div>
</div>
    );
}
}

export default Login;