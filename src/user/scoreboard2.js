import { Component } from "react";
import { getUsers } from "./apiUser";
import { isAuthenticated } from "../auth/auth";
import { Link } from "react-router-dom/cjs/react-router-dom.min";

class Scoreboard extends Component {
    constructor() {
        super();
        this.state = { topThree: [], leaderboardData: [] };
    }

    componentDidMount() {
        getUsers(isAuthenticated().token).then(data => {
            this.setState({
                topThree: data.data.slice(0, 3),
                leaderboardData: data.data.slice(3)
            })
        })
    }

    render() {
        const { topThree, leaderboardData } = this.state;
        if (!topThree || !leaderboardData) {
            return <div className="text-center mt-4" style={{ color: 'var(--ms-muted)' }}>Loading leaderboard...</div>;
        }
        const [first, second, third] = topThree;
        const currentUserId = isAuthenticated() && isAuthenticated().user && isAuthenticated().user.id;

        const Podium = ({ user, rank, klass, podiumStyle }) => (
            <div className={`p-3 mb-2 ${klass}`} style={podiumStyle}>
                <div className="ms-avatar" style={{ width: 56, height: 56, fontSize: 22, marginBottom: 10 }}>
                    {user.username ? user.username[0].toUpperCase() : '?'}
                </div>
                <div className="badge mb-2" style={{
                    background: rank === 1 ? 'var(--ms-warn)' : rank === 2 ? 'var(--ms-surface-2)' : 'var(--ms-danger)',
                    color: '#06122a', borderRadius: '50%', width: 30, height: 30, lineHeight: '22px'
                }}>{rank}</div>
                <div className="font-weight-bold text-truncate" style={{ fontSize: '1rem' }}>
                    <Link to={"/userProfile/" + user.id}>{user.username}</Link>
                </div>
                <div className="font-weight-bold" style={{ fontSize: '0.95rem', color: 'var(--ms-cyan)' }}>{user.score} pts</div>
            </div>
        );

        return (
            <div className="container mt-4" style={{ paddingBottom: 60 }}>
                <div className="ms-glass p-4" style={{ padding: '32px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h3 style={{ fontWeight: 700, marginBottom: 4 }}>Multi-Shield Leaderboard</h3>
                            <small style={{ color: 'var(--ms-muted)' }}>Top contributors in our community</small>
                        </div>
                        <i className="fa fa-trophy" style={{ fontSize: '2.6rem', color: 'var(--ms-warn)' }}></i>
                    </div>

                    <div className="row no-gutters mb-4 justify-content-center align-items-end">
                        {second && (
                            <div className="col-4 px-2 text-center">
                                <Podium user={second} rank={2} klass="ms-podium-2" podiumStyle={{ borderRadius: 16 }} />
                            </div>
                        )}
                        {first && (
                            <div className="col-4 px-2 text-center" style={{ transform: 'translateY(-12px)' }}>
                                <Podium user={first} rank={1} klass="ms-podium-1" podiumStyle={{ borderRadius: 16, padding: '20px !important' }} />
                            </div>
                        )}
                        {third && (
                            <div className="col-4 px-2 text-center">
                                <Podium user={third} rank={3} klass="ms-podium-3" podiumStyle={{ borderRadius: 16 }} />
                            </div>
                        )}
                    </div>

                    <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--ms-border)' }}>
                        <div className="table-responsive">
                            <table className="table table-borderless mb-0">
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                                        <th scope="col" className="font-weight-bold py-3 pl-4" style={{ fontSize: '0.78rem', letterSpacing: 1.2 }}>RANK</th>
                                        <th scope="col" className="font-weight-bold py-3" style={{ fontSize: '0.78rem', letterSpacing: 1.2 }}>USER</th>
                                        <th scope="col" className="font-weight-bold py-3 text-right pr-4" style={{ fontSize: '0.78rem', letterSpacing: 1.2 }}>TOTAL POINTS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboardData.map((user, key) => {
                                        const isCurrentUser = user.id === currentUserId;
                                        return (
                                            <tr key={key + 3} style={{
                                                background: isCurrentUser ? 'rgba(58,160,255,0.10)' : 'transparent'
                                            }}>
                                                <td className="py-3 pl-4 font-weight-bold" style={{ width: '80px', color: isCurrentUser ? 'var(--ms-cyan)' : 'var(--ms-muted)' }}>
                                                    #{key + 4}
                                                </td>
                                                <td className="py-3 font-weight-bold">
                                                    <Link to={"/userProfile/" + user.id}>{user.username}</Link>
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

export default Scoreboard