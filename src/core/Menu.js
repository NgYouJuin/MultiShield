import React from "react";
import { Link, withRouter } from "react-router-dom";
import { isAuthenticated, signout } from "../auth/auth";
import UserOnboarding from "../user/userOnboarding";

const isActive = (history, path) => {
    if(history.location.pathname === path) return {color: "#ff9900"}
    else return {color: "#ffffff"}
}

const Menu = ({history}) => (
    <>
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">

            <Link className="navbar-brand d-flex align-items-center" to="/">
                <img src="/multishield_logo.svg" alt="Logo" 
                width="30" height="30"
                className="mr-2"/>

                <span>Multi-shield</span>
            </Link>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <ul className="navbar-nav mr-auto">
                    { isAuthenticated() && (
                    <>
                    <li className="nav-item active">
                        <Link className="nav-link" to="/" style={isActive(history, "/")}>Home</Link>
                    </li>
                    <li className="nav-item active">
                        <Link className="nav-link" to="/community" style={isActive(history, "/community")}>Community</Link>
                    </li>
                    <li className="nav-item active">
                        <Link className="nav-link" to="/scoreboard" style={isActive(history, "/scoreboard")}>Scoreboard</Link>
                    </li>
                    </>
                    )}
                    { !isAuthenticated() && (
                    <>
                    <li className="nav-item active">
                        <Link className="nav-link" to="/login" style={isActive(history, "/login")}>Login</Link>
                    </li>
                    <li className="nav-item active">
                        <Link className="nav-link" to="/signup" style={isActive(history, "/signup")}>Sign up</Link>
                    </li>
                    </>
                    )}
                </ul>
                { isAuthenticated() && (
                <ul className="navbar-nav justify-content-end">
                    <li className="nav-item dropdown">
                        <button className="nav-link dropdown-toggle btn btn-link" type="button" data-toggle="dropdown" aria-expanded="false" style={{color:'rgba(255,255,255,1)', textDecoration: "none"}}>
                        {isAuthenticated().user.username}
                        </button>
                        <div className="dropdown-menu dropdown-menu-right">
                        <Link className="dropdown-item" to={"/userProfile/" + isAuthenticated().user.id}>Profile</Link>
                        <button className="dropdown-item" type="button" data-toggle="modal" data-target="#userOnboardingModal">Help</button>
                        <div className="dropdown-divider"></div>
                        <Link className="dropdown-item" to="/" onClick={() => signout(() => history.push('/'))}>Log out</Link>
                        </div>
                    </li>
                </ul>
                )}
            </div>
        </div>
    </nav>

    { isAuthenticated() && (
    <div className="modal fade" id="userOnboardingModal" tabIndex="-1" aria-labelledby="userOnboardingModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                    <h5 className="modal-title" id="userOnboardingModalLabel">Welcome to Multi-shield</h5>
                    <button type="button" className="close text-white" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <UserOnboarding isModal={true}></UserOnboarding>
            </div>
        </div>
    </div>
    )}
    </>
);
export default withRouter(Menu);
