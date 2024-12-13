import React, {createContext, useState} from 'react';

export const AuthContext = createContext();

export class AuthProvider extends React.Component {
    state = {
      isAuthenticated: false,
      userRole: null,
      userName: null,
    };
  
    login = (role, username) => {
      this.setState({ isAuthenticated: true, userRole: role , userName:username});
    };
  
    logout = () => {
      this.setState({ isAuthenticated: false, userRole: null });
    };
  
    render() {
      return (
        <AuthContext.Provider value={{ ...this.state, login: this.login, logout: this.logout }}>
          {this.props.children}
        </AuthContext.Provider>
      );
    }
}