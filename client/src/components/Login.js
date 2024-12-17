import React from 'react';
import { AuthContext } from '../services/AuthContext';
//import { useNavigate } from 'react-router-dom';
import { login, getAdmin } from '../services/login';
import './../styles/login.css';

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
      <div className="login-body">
  <h2 className="login-title">Login Page</h2>
  <div className="login-container">
    <form className="login-form" onSubmit={async (e) => { e.preventDefault(); await this.handleLogin(); }}>
      <label className="login-label" htmlFor="name">Username</label><br />
      <input
        className="login-input"
        type="text"
        id="name"
        name="name"
        required
      /><br /><br />

      <label className="login-label" htmlFor="password">Password</label><br />
      <input
        className="login-input"
        type="password"
        id="password"
        name="password"
        required
      /><br /><br />

      <button className="login-button login-submit" type="submit">Log In</button>
      <button className="login-button login-register" type="button" onClick={async () => { await this.handleRegister(); }}>Register</button>
    </form>
  </div>
</div>
    );
}
}

export default Login;