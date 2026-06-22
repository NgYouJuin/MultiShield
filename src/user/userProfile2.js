import { Component } from "react";
import { getUserById, updateUserById } from "./apiUser";
import { isAuthenticated } from "../auth/auth";

// Drop-in replacement for src/user/userProfile.js.
// Same API surface (getUserById / updateUserById / isAuthenticated, match.params.userId),
// restyled to match the Multi Shield dark-navy + cyan gradient theme.
// Requires Bootstrap 4.6.2 CSS (already loaded by the app) + Font Awesome.

// ---- Theme tokens (kept inline so nothing else in the app changes) ----
const T = {
    bg: "#0b1224",
    card: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.10)",
    text: "#f5f7ff",
    muted: "#9aa6c2",
    gradient: "linear-gradient(135deg,#3aa0ff 0%,#3aebd6 100%)",
    glow: "0 0 60px -10px rgba(58,160,255,0.5)",
    elegant: "0 20px 60px -20px rgba(0,0,0,0.6)",
    hero: "radial-gradient(ellipse at top, #1a2a55 0%, #0b1224 60%)",
};

class UserProfile2 extends Component {
    constructor() {
        super();
        this.state = {
            user: {},
            usernameInput: "",
            emailInput: "",
            loading: true,
        };
    }

    componentDidMount() {
        this.getUserProfileData();
    }

    componentDidUpdate(prevProps) {
        // Re-fetch when navigating between /user/:userId routes
        const prev = prevProps.match?.params?.userId;
        const next = this.props.match?.params?.userId;
        if (prev !== next) this.getUserProfileData();
    }

    getUserProfileData = () => {
        const userId = this.props.match.params.userId;
        this.setState({ loading: true });
        getUserById(isAuthenticated().token, userId).then((data) => {
            if (data && data.success === true) {
                this.setState({
                    user: data.data,
                    usernameInput: data.data.username,
                    emailInput: data.data.email,
                    loading: false,
                });
            } else {
                this.setState({ loading: false });
            }
        });
    };

    handleUsernameInput = (e) => this.setState({ usernameInput: e.target.value });
    handleEmailInput = (e) => this.setState({ emailInput: e.target.value });

    handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            this.submitData();
        }
    };

    submitData = () => {
        const { usernameInput, emailInput, user } = this.state;
        const bodyData = { username: usernameInput, email: emailInput };
        updateUserById(isAuthenticated().token, user.id, bodyData).then((data) => {
            if (data && data.success === true) this.getUserProfileData();
        });
    };

    render() {
        const { user, usernameInput, emailInput, loading } = this.state;
        const accuracy =
            user.total_votes > 0 ? Math.round((user.score / user.total_votes) * 100) : 0;
        const isOwner =
            isAuthenticated() && isAuthenticated().user && isAuthenticated().user.id === user.id;
        const initials = (user.username || "?")
            .split(" ")
            .map((s) => s[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

        return (
            <div
                style={{
                    minHeight: "100vh",
                    background: T.bg,
                    color: T.text,
                    fontFamily:
                        "system-ui,-apple-system,'Segoe UI',Roboto,sans-serif",
                }}
            >
                {/* Hero header */}
                <section style={{ background: T.hero }} className="pt-5 pb-5">
                    <div className="container pt-4 pb-3">
                        {/*
                        <span
                            className="d-inline-block text-uppercase mb-3"
                            style={{
                                background: "rgba(255,255,255,0.06)",
                                border: T.border,
                                color: "#3aebd6",
                                borderRadius: 999,
                                padding: "4px 12px",
                                fontSize: 11,
                                letterSpacing: "0.1em",
                            }}
                        >

                        </span>
                            */}
                        <div
                            className="p-4"
                            style={{
                                background: T.card,
                                border: T.border,
                                borderRadius: 24,
                                boxShadow: T.elegant,
                                backdropFilter: "blur(8px)",
                            }}
                        >
                            <div className="row align-items-center">
                                <div className="col-md-2 text-center mb-3 mb-md-0">
                                    <div
                                        className="mx-auto d-flex align-items-center justify-content-center font-weight-bold"
                                        style={{
                                            width: 104,
                                            height: 104,
                                            borderRadius: "50%",
                                            fontSize: 36,
                                            background: T.gradient,
                                            boxShadow: T.glow,
                                            color: "#0b1224",
                                        }}
                                    >
                                        {loading ? "…" : initials}
                                    </div>
                                </div>
                                <div className="col-md-7">
                                    <h2 className="mb-1" style={{ fontWeight: 800 }}>
                                        {user.username || (loading ? "Loading…" : "Unknown user")}
                                    </h2>
                                    <p className="mb-3" style={{ color: T.muted }}>
                                        {user.email || ""}
                                    </p>
                                    <span
                                        className="mr-2 mb-2 d-inline-block font-weight-bold"
                                        style={{
                                            background: T.gradient,
                                            color: "#0b1224",
                                            borderRadius: 999,
                                            padding: "4px 12px",
                                            fontSize: 12,
                                        }}
                                    >
                                        Score {user.score ?? 0}
                                    </span>
                                    <span
                                        className="mr-2 mb-2 d-inline-block font-weight-bold"
                                        style={{
                                            background: "rgba(58,235,214,0.15)",
                                            color: "#3aebd6",
                                            borderRadius: 999,
                                            padding: "4px 12px",
                                            fontSize: 12,
                                        }}
                                    >
                                        {accuracy}% accuracy
                                    </span>
                                </div>
                                <div className="col-md-3 text-md-right">
                                    {isOwner && (
                                        <button
                                            type="button"
                                            className="btn btn-block font-weight-bold text-white"
                                            data-toggle="modal"
                                            data-target="#editProfileModal"
                                            style={{
                                                background: T.gradient,
                                                boxShadow: T.glow,
                                                border: "none",
                                                borderRadius: 999,
                                                padding: "10px",
                                            }}
                                        >
                                            Edit profile
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats + accuracy */}
                <div
                    className="container"
                    style={{ marginTop: -40, position: "relative", zIndex: 2 }}
                >
                    <div className="row mb-4">
                        {[
                            { label: "Score", value: user.score ?? 0 },
                            { label: "Total Votes", value: user.total_votes ?? 0 },
                            { label: "Accuracy", value: `${accuracy}%` },
                        ].map((s) => (
                            <div className="col-12 col-md-4 mb-3" key={s.label}>
                                <div
                                    className="h-100 text-center p-4"
                                    style={{
                                        background: T.card,
                                        border: T.border,
                                        borderRadius: 20,
                                        boxShadow: T.elegant,
                                        backdropFilter: "blur(8px)",
                                    }}
                                >
                                    <h2
                                        className="font-weight-bold mb-1"
                                        style={{
                                            background: T.gradient,
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                            backgroundClip: "text",
                                            fontSize: 32,
                                        }}
                                    >
                                        {s.value}
                                    </h2>
                                    <small
                                        className="text-uppercase"
                                        style={{
                                            color: T.muted,
                                            letterSpacing: "0.08em",
                                            fontSize: 11,
                                        }}
                                    >
                                        {s.label}
                                    </small>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div
                        className="p-4 mb-5"
                        style={{
                            background: T.card,
                            border: T.border,
                            borderRadius: 20,
                            boxShadow: T.elegant,
                        }}
                    >
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h5 className="mb-0">Voting Accuracy</h5>
                            <small style={{ color: T.muted }}>
                                {user.score ?? 0} correct / {user.total_votes ?? 0} votes
                            </small>
                        </div>
                        <div
                            className="progress"
                            style={{
                                height: 12,
                                background: "rgba(255,255,255,0.08)",
                                borderRadius: 999,
                                overflow: "hidden",
                            }}
                        >
                            <div
                                role="progressbar"
                                style={{
                                    width: `${accuracy}%`,
                                    background: T.gradient,
                                    boxShadow: T.glow,
                                }}
                                aria-valuenow={accuracy}
                                aria-valuemin={0}
                                aria-valuemax={100}
                            />
                        </div>
                        <small className="d-block mt-2" style={{ color: T.muted }}>
                            Keep voting on community submissions to grow your protector score.
                        </small>
                    </div>
                </div>

                {/* Edit modal (Bootstrap 4) */}
                {isOwner && (
                    <div
                        className="modal fade"
                        id="editProfileModal"
                        tabIndex="-1"
                        aria-labelledby="editProfileModalLabel"
                        aria-hidden="true"
                        data-backdrop="static"
                        data-keyboard="false"
                    >
                        <div className="modal-dialog">
                            <div
                                className="modal-content"
                                style={{
                                    background: "#101a33",
                                    color: T.text,
                                    border: T.border,
                                    borderRadius: 20,
                                }}
                            >
                                <div
                                    className="modal-header"
                                    style={{ borderBottom: T.border }}
                                >
                                    <h5 className="modal-title" id="editProfileModalLabel">
                                        Update User Profile
                                    </h5>
                                    <button
                                        type="button"
                                        className="close"
                                        data-dismiss="modal"
                                        aria-label="Close"
                                        style={{ color: T.text, textShadow: "none", opacity: 0.8 }}
                                    >
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <form>
                                        <div className="form-group">
                                            <label htmlFor="usernameInput">Username</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="usernameInput"
                                                value={usernameInput}
                                                onChange={this.handleUsernameInput}
                                                onKeyDown={this.handleKeyDown}
                                                style={{
                                                    background: "rgba(255,255,255,0.05)",
                                                    border: T.border,
                                                    color: T.text,
                                                }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="emailInput">Email address</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                id="emailInput"
                                                value={emailInput}
                                                onChange={this.handleEmailInput}
                                                onKeyDown={this.handleKeyDown}
                                                style={{
                                                    background: "rgba(255,255,255,0.05)",
                                                    border: T.border,
                                                    color: T.text,
                                                }}
                                            />
                                        </div>
                                    </form>
                                </div>
                                <div
                                    className="modal-footer"
                                    style={{ borderTop: T.border }}
                                >
                                    <button
                                        type="button"
                                        className="btn"
                                        data-dismiss="modal"
                                        style={{
                                            background: "rgba(255,255,255,0.06)",
                                            border: T.border,
                                            color: T.text,
                                            borderRadius: 999,
                                            padding: "6px 18px",
                                        }}
                                    >
                                        Close
                                    </button>
                                    <button
                                        type="button"
                                        className="btn font-weight-bold text-white"
                                        onClick={this.submitData}
                                        data-dismiss="modal"
                                        style={{
                                            background: T.gradient,
                                            boxShadow: T.glow,
                                            border: "none",
                                            borderRadius: 999,
                                            padding: "6px 22px",
                                        }}
                                    >
                                        Save changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default UserProfile2;
