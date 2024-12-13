import React, {useContext} from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../services/AuthContext';

const Admin = ({children}) => {
    const { isAuthenticated, userRole } = useContext(AuthContext);
// userRole means if it is admin
    if(!isAuthenticated) {
        return <Navigate to="/login"/>;
    }

    if(isAuthenticated && !userRole)
        return <Navigate to="/"/>;

    return children;
};

export default Admin;
// a higher-order component for customing admin actions