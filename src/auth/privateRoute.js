import React from 'react';
import {Route, Redirect} from 'react-router-dom'
import { isAuthenticated } from './auth';

const PrivateRoute = ({component: Component, ...rest}) => (
    // props mean components passed down to this pricate route component
    <Route {...rest} render={props => isAuthenticated() && isAuthenticated().token ? (
        <Component {...props} />
    ) : (
        <Redirect to={{pathname: "/login", state: props.location}}/>
    )} />
)

export default PrivateRoute;