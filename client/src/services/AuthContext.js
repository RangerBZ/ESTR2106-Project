import React, {createContext, useState} from 'react';

export const AuthContext = createContext();

export class AuthProvider extends React.Component {
    state = {
      isAuthenticated: false,
      userRole: null,
    };
  
    login = (role) => {
      this.setState({ isAuthenticated: true, userRole: role });
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