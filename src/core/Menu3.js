import React from "react";
import { Link, withRouter } from "react-router-dom";
import { isAuthenticated, signout } from "../auth/auth";
import UserOnboarding from "../user/userOnboarding";

const isActive = (history, path) => {
    if (history.location.pathname === path) return { color: "var(--ms-cyan)" }
    else return { color: "var(--ms-muted)" }
}

const Menu3 = ({ history }) => (
    <>
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
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
                                <a className="nav-link dropdown-toggle" href="/"  role="button" data-toggle="dropdown" aria-expanded="false" style={{ color: 'var(--ms-text)'}} >
                                    {isAuthenticated().user.username}
                                </a>
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

        {isAuthenticated() && (
            <div className="modal fade" id="userOnboardingModal" tabIndex="-1" aria-labelledby="userOnboardingModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content" style={{ background: 'var(--ms-surface, #101a33)', color: 'var(--ms-text)', border: '1px solid var(--ms-border)', borderRadius: 20 }}>
                        <div className="modal-header" style={{ background: 'var(--ms-grad)', color: '#06122a', borderRadius: '20px 20px 0 0' }}>
                            <h5 className="modal-title" id="userOnboardingModalLabel" style={{ color: '#06122a', fontWeight: 700 }}>Welcome to Multi-Shield</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close" style={{ color: '#06122a', textShadow: 'none', opacity: 0.8 }}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <UserOnboarding isModal={true} />
                    </div>
                </div>
            </div>
        )}
    </>
);

export default withRouter(Menu3);
