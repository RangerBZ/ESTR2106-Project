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
                this.context.login(true);
            }
            else this.context.login(false);
            //this.props.navigate('/');
        }
    }

    render(){
    return (
        <div>
      <h2>Login Page</h2>
      <form onSubmit={async (e) => { e.preventDefault();await this.handleLogin(); }}>
        <label htmlFor="name">Username</label><br />
        <input 
          type='text' 
          id="name" 
          name="name" 
          required
        /><br />

        <label htmlFor="password">Password</label><br />
        <input 
          type='password' // Changed from 'text' to 'password'
          id="password" 
          name="password" 
          required
        /><br />

        <button id="sub" type="submit">Log In</button>
      </form>
    </div>
    );
}
}

export default Login;