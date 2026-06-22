import { Component } from "react";
import { getUsers } from "./apiUser";
import { isAuthenticated } from "../auth/auth";
import { Link } from "react-router-dom/cjs/react-router-dom.min";

class Scoreboard extends Component {
    constructor() {
        super();
        this.state = {
            topThree: [],
            leaderboardData: [],
            isLoading: true
        };
    }

    componentDidMount(){
        getUsers(isAuthenticated().token).then(data => {
            this.setState({
                topThree: data.data.slice(0,3),
                leaderboardData: data.data.slice(3),
                isLoading: false
            })
        })
    }

    render() {
        const { topThree, leaderboardData, isLoading} = this.state;

        if (isLoading) {
            return (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
                    <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            );
        }

        const [first, second, third] = topThree;
        const currentUserId = isAuthenticated() && isAuthenticated().user && isAuthenticated().user.id;

        return (
            <div className="container mt-4" style={{ paddingBottom: 60 }}>
                {/* Outer Glass Container matching Scoreboard3 colors */}
                <div 
                    className="ms-glass p-4" 
                    style={{ 
                        borderRadius: '24px',
                        padding: '32px'
                    }}
                >
                    {/* Header Section */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <label className="h4 font-weight-bold mb-1 d-block" style={{ color: 'inherit' }}>
                                Multi-Shield Leaderboard
                            </label>
                            <small style={{ color: 'var(--ms-muted)' }}>Top contributors in our community</small>
                        </div>
                        <i className="fa fa-trophy" style={{ fontSize: '3rem', color: 'var(--ms-warn)' }}></i>
                    </div>

                    {/* Podium Layout (Left = 2nd, Middle = 1st, Right = 3rd) */}
                    <div className="row no-gutters mb-4 justify-content-center align-items-end">
                        
                        {/* 2nd Place Card */}
                        {second && (
                            <div className="col-4 px-2 text-center">
                                <div className="p-3 mb-2 ms-podium-2" style={{ borderRadius: '16px' }}>
                                    <div className="badge mb-2" style={{ borderRadius: '50%', width: '28px', height: '28px', lineHeight: '20px', background: 'var(--ms-surface-2)', color: '#06122a' }}>2</div>
                                    <div className="font-weight-bold text-truncate" style={{ fontSize: '0.95rem' }}>
                                        <Link to={"/userProfile/"+second.id}>{second.username}</Link>
                                    </div>
                                    <div className="font-weight-bold" style={{ fontSize: '0.9rem', color: 'var(--ms-cyan)' }}>{second.score} pts</div>
                                </div>
                            </div>
                        )}

                        {/* 1st Place Card */}
                        {first && (
                            <div className="col-4 px-2 text-center">
                                <div className="p-4 mb-2 ms-podium-1" style={{ borderRadius: '16px' }}>
                                   <svg 
                                        viewBox="0 0 24 24" 
                                        fill="var(--ms-warn)"
                                        width="2rem" 
                                        height="2rem" 
                                        className="mb-2 d-block mx-auto"
                                    >
                                        <path d="M2 19h20v2H2v-2zM2 5l5 3.5L12 2l5 6.5L22 5v12H2V5zm2 3.841V15h16V8.841l-3.418 2.393L12 5.03l-4.582 6.204L4 8.841z"/>
                                    </svg>
                                    <div className="badge mb-2" style={{ borderRadius: '50%', width: '32px', height: '32px', lineHeight: '24px', backgroundColor: 'var(--ms-warn)', color: '#06122a' }}>1</div>
                                    <div className="font-weight-bold text-truncate" style={{ fontSize: '1.1rem' }}>
                                        <Link to={"/userProfile/"+first.id}>{first.username}</Link>
                                    </div>
                                    <div className="font-weight-bold" style={{ fontSize: '1rem', color: 'var(--ms-cyan)' }}>{first.score} pts</div>
                                </div>
                            </div>
                        )}

                        {/* 3rd Place Card */}
                        {third && (
                            <div className="col-4 px-2 text-center">
                                <div className="p-3 mb-2 ms-podium-3" style={{ borderRadius: '16px' }}>
                                    <div className="badge mb-2" style={{ borderRadius: '50%', width: '28px', height: '28px', lineHeight: '20px', backgroundColor: 'var(--ms-danger)', color: '#06122a' }}>3</div>
                                    <div className="font-weight-bold text-truncate" style={{ fontSize: '0.95rem' }}>
                                        <Link to={"/userProfile/"+third.id}>{third.username}</Link>
                                    </div>
                                    <div className="font-weight-bold" style={{ fontSize: '0.9rem', color: 'var(--ms-cyan)' }}>{third.score} pts</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* List Breakdown Table */}
                    <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--ms-border)' }}>
                        <div className="table-responsive">
                            <table className="table table-borderless mb-0">
                                <thead>
                                    <tr style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--ms-border)' }}>
                                        <th scope="col" className="font-weight-bold py-3 pl-4" style={{ fontSize: '0.85rem', color: 'var(--ms-muted)' }}>RANK</th>
                                        <th scope="col" className="font-weight-bold py-3" style={{ fontSize: '0.85rem', color: 'var(--ms-muted)' }}>USER</th>
                                        <th scope="col" className="font-weight-bold py-3 text-right pr-4" style={{ fontSize: '0.85rem', color: 'var(--ms-muted)' }}>TOTAL POINTS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboardData.map((user, key) => {
                                        const isCurrentUser = user.id === currentUserId;
                                        return (
                                            <tr 
                                                key={key + 3} 
                                                style={{ 
                                                    backgroundColor: isCurrentUser ? 'rgba(58,160,255,0.10)' : 'transparent',
                                                    borderBottom: '1px solid var(--ms-border)' 
                                                }}
                                            >
                                                <td className="py-3 pl-4 font-weight-bold" style={{ width: '80px', color: isCurrentUser ? 'var(--ms-cyan)' : 'var(--ms-muted)' }}>
                                                    #{key + 4}
                                                </td>
                                                <td className="py-3 font-weight-bold">
                                                    <Link to={"/userProfile/"+user.id}>{user.username}</Link>
                                                </td>
                                                <td className="py-3 text-right pr-4 font-weight-bold" style={{ color: 'var(--ms-cyan)' }}>
                                                    {user.score} pts
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Scoreboard;
