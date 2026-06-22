import { Component } from "react";
import { getUsers } from "./apiUser";
import { isAuthenticated } from "../auth/auth";
import { Link } from "react-router-dom/cjs/react-router-dom.min";

class Scoreboard extends Component {
    constructor() {
        // To use real data change constructor to constructor(props)
        //super(props);
        
        // Using mock data
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

        // Find the users by their rank out of the passed array
        const [first, second, third] = topThree;

        return (
            <div className="container mt-4">
                <div 
                    className="p-4" 
                    style={{ 
                        backgroundColor: '#ffffff', 
                        borderRadius: '24px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
                    }}
                >
                    {/* Header Section */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <label className="h4 font-weight-bold mb-1 d-block text-dark">
                                Multi-Shield Leaderboard
                            </label>
                            <small className="text-muted">Top contributors in our community</small>
                        </div>
                        <i className="fa fa-trophy text-warning" style={{ fontSize: '3rem' }}></i>
                    </div>

                    {/* Podium Layout (Left = 2nd, Middle = 1st, Right = 3rd) */}
                    <div className="row no-gutters mb-4 justify-content-center align-items-end">
                        
                        {/* 2nd Place Card */}
                        {second && (
                             
                            <div className="col-4 px-2 text-center">
                                
                                <div className="p-3 mb-2" style={{ backgroundColor: '#f1f5f9', borderRadius: '16px', border: '1px solid #cbd5e1' }}>
                                    <div className="badge badge-secondary mb-2" style={{ borderRadius: '50%', width: '28px', height: '28px', lineHeight: '20px' }}>2</div>
                                   <div className="font-weight-bold text-truncate" style={{ fontSize: '0.95rem' }}><Link to={"/userProfile/"+second.id}>{second.username}</Link></div>
                                    <div className="text-primary font-weight-bold" style={{ fontSize: '0.9rem' }}>{second.score} pts</div>
                                </div>
                            </div>
                        )}

                        {/* 1st Place Card */}
                        {first && (
                            <div className="col-4 px-2 text-center">
                               
                                <div className="p-4 mb-2" style={{ backgroundColor: '#f0fdf4', borderRadius: '16px', border: '2px solid #bbf7d0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}>
                                   <svg 
                                        viewBox="0 0 24 24" 
                                        fill="#eab308"
                                        width="2rem" 
                                        height="2rem" 
                                        className="mb-2 d-block mx-auto"
                                    >
                                        <path d="M2 19h20v2H2v-2zM2 5l5 3.5L12 2l5 6.5L22 5v12H2V5zm2 3.841V15h16V8.841l-3.418 2.393L12 5.03l-4.582 6.204L4 8.841z"/>
                                    </svg>
                                    <div className="badge badge-warning mb-2 text-white" style={{ borderRadius: '50%', width: '32px', height: '32px', lineHeight: '24px', backgroundColor: '#eab308' }}>1</div>
                                    <div className="font-weight-bold text-truncate" style={{ fontSize: '1.1rem' }}><Link to={"/userProfile/"+first.id}>{first.username}</Link></div>
                                    <div className="text-success font-weight-bold" style={{ fontSize: '1rem' }}>{first.score} pts</div>
                                </div>
                                
                            </div>
                        )}

                        {/* 3rd Place Card */}
                        {third && (
                            <div className="col-4 px-2 text-center">
                                <div className="p-3 mb-2" style={{ backgroundColor: '#fff7ed', borderRadius: '16px', border: '1px solid #fed7aa' }}>
                                    <div className="badge badge-danger mb-2" style={{ borderRadius: '50%', width: '28px', height: '28px', lineHeight: '20px', backgroundColor: '#b45309' }}>3</div>
                                    <div className="font-weight-bold text-truncate" style={{ fontSize: '0.95rem' }}><Link to={"/userProfile/"+third.id}>{third.username}</Link></div>
                                    <div className="text-primary font-weight-bold" style={{ fontSize: '0.9rem' }}>{third.score} pts</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* List Breakdown Table */}
                    <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                        <div className="table-responsive">
                            <table className="table table-borderless mb-0">
                                <thead>
                                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                        <th scope="col" className="text-muted font-weight-bold py-3 pl-4" style={{ fontSize: '0.85rem' }}>RANK</th>
                                        <th scope="col" className="text-muted font-weight-bold py-3" style={{ fontSize: '0.85rem' }}>USER</th>
                                        <th scope="col" className="text-muted font-weight-bold py-3 text-right pr-4" style={{ fontSize: '0.85rem' }}>TOTAL POINTS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboardData.map((user, key) => (
                                        <tr 
                                            key={key + 3} 
                                            style={{ 
                                                backgroundColor: user.isCurrentUser ? '#eff6ff' : 'transparent',
                                                borderBottom: '1px solid #f1f5f9' 
                                            }}
                                            
                                        >
                                            
                                            <td className={`py-3 pl-4 font-weight-bold ${user.isCurrentUser ? 'text-primary' : 'text-muted'}`} style={{ width: '80px' }}>
                                                #{key + 3}
                                            </td>
                                            <td className="py-3 font-weight-bold text-dark">
                                                <Link to={"/userProfile/"+user.id}>{user.username}</Link>
                                            </td>
                                            <td className="py-3 text-right pr-4 font-weight-bold text-primary">
                                                {user.score} pts
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                                    
                </div>
            </div>
        );
    }
}

export default Scoreboard