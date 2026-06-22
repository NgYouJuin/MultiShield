import React, { Component } from 'react'
import { getSubmissionsByCurrentUser } from './apiSubmissions'
import { isAuthenticated } from '../auth/auth'
import { Link } from 'react-router-dom/cjs/react-router-dom'

class SubmissionList extends Component {
    constructor() {
        super()
        this.state = { sumbissions: [] }
    }

    componentDidMount() {
        const token = isAuthenticated().token
        getSubmissionsByCurrentUser(token).then(data => {
            if (!data.success) { } else { this.setState({ sumbissions: data.data }) }
        })
    }

    renderList = submissions => (
        <div>
            {submissions && submissions.map((submission, i) => {
                const yes_percentage = (submission.yes_votes / submission.total_votes) * 100
                return (
                    <div key={i} className="card" style={{ marginBottom: '12px' }}>
                        <div className="card-body">
                            <div className="row align-items-center">
                                <div className="col-sm-12 col-md-5">
                                    <h5 className="card-title" style={{ marginBottom: 4, fontWeight: 600 }}>{submission.title}</h5>
                                    <small style={{ color: 'var(--ms-muted)' }}>Submission #{submission.id}</small>
                                </div>
                                <div className="col-sm-12 col-md-4">
                                    {submission.total_votes > 0 ? (
                                        <div>
                                            <div className="d-flex justify-content-between" style={{ fontSize: 13, color: 'var(--ms-muted)', marginBottom: 6 }}>
                                                <span><i className="fa fa-thumbs-up" style={{ color: 'var(--ms-cyan)' }} /> {yes_percentage.toFixed(1)}% scam</span>
                                                <span><i className="fa fa-thumbs-down" style={{ color: 'var(--ms-danger)' }} /> {(100 - yes_percentage).toFixed(1)}% safe</span>
                                            </div>
                                            <div className="progress" style={{ height: 8 }}>
                                                <div className="progress-bar" style={{ width: `${yes_percentage}%` }} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center', color: 'var(--ms-muted)' }}>No votes yet</div>
                                    )}
                                </div>
                                <div className="col-sm-12 col-md-3 text-center">
                                    <Link className="btn btn-primary" to={`/submission/${submission.id}`}>View</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )

    render() {
        const { sumbissions } = this.state
        return (<section>{this.renderList(sumbissions)}</section>)
    }
}

export default SubmissionList