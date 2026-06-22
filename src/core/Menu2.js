import React from "react";
import { Link, withRouter } from "react-router-dom";
import { isAuthenticated, signout } from "../auth/auth";

const isActive = (history, path) => {
    if (history.location.pathname === path) return { color: "var(--ms-cyan)" }
    else return { color: "var(--ms-muted)" }
}

const Menu2 = ({ history }) => (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
            <Link className="navbar-brand d-flex align-items-center" to="/">
                <span style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: 'var(--ms-grad)', display: 'inline-flex',
                    alignItems: 'center', justifyContent: 'center',
                    marginRight: 10, boxShadow: 'var(--ms-glow)'
                }}>
                    <img src="/multishield_logo.svg" alt="Logo" width="20" height="20" />
                </span>
                <span>Multi-Shield</span>
            </Link>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <ul className="navbar-nav mr-auto">
                    {isAuthenticated() && (
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
                    {!isAuthenticated() && (
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
                {isAuthenticated() && (
                    <ul className="navbar-nav justify-content-end">
                        <li className="nav-item dropdown">
                                <button className="nav-link dropdown-toggle" type="button" data-toggle="dropdown" aria-expanded="false" style={{ color: 'var(--ms-text)'}} >
                                    {isAuthenticated().user.username}
                                </button>
                            <div className="dropdown-menu dropdown-menu-right">
                                <Link className="dropdown-item" to={"/userProfile/" + isAuthenticated().user.id}>Profile</Link>
                                <div className="dropdown-divider"></div>
                                <Link className="dropdown-item" to="/" onClick={() => signout(() => history.push('/'))}>Log out</Link>
                            </div>
                        </li>
                    </ul>
                )}
            </div>
        </div>
    </nav>
);
export default withRouter(Menu2);