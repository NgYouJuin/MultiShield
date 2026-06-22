import React, { Component } from 'react'
import { endVotingForSubmission, getSubmissionsById } from './apiSubmissions'
import { isAuthenticated } from '../auth/auth'
import VoteList from '../votes/voteList'
import AddAndEditVoteForm from '../votes/addAndEditVoteForm'

class SubmissionPage extends Component {
    constructor() {
        super()
        this.state = { submission: {} }
    }

    getSubmission = () => {
        const token = isAuthenticated().token
        const submissionId = this.props.match.params.submissionId;
        getSubmissionsById(token, submissionId).then(data => {
            if (!data.success) { } else { this.setState({ submission: data.data }) }
        })
    }

    componentDidMount() { this.getSubmission(); }

    handleKeyDown = e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); }
    }

    endVoteSession = () => {
        const token = isAuthenticated().token
        const submissionId = this.props.match.params.submissionId;
        endVotingForSubmission(token, submissionId).then(data => {
            if (data.success) { this.getSubmission(); }
        })
    }

    render() {
        const { submission } = this.state
        return (
            <div className='container' style={{ marginTop: '40px', paddingBottom: 60 }}>
                <div className="card">
                    <div className="card-header" style={{ background: 'var(--ms-grad)', color: '#06122a', borderRadius: '18px 18px 0 0' }}>
                        <h4 style={{ marginBottom: 0, fontWeight: 700, color: '#06122a' }}>{submission.title}</h4>
                    </div>
                    <div className="card-body">
                        <h6 style={{ color: 'var(--ms-muted)', textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 12, marginBottom: 12 }}>The content</h6>
                        <p className='card-text' style={{ whiteSpace: 'pre-wrap' }}>{submission.text}</p>
                    </div>
                </div>

                {submission.is_votable !== true && (
                    <div className="card" style={{ marginTop: "12px", textAlign: "center" }}>
                        <div className="card-body">
                            <p style={{ color: 'var(--ms-muted)' }}>Voting is closed.</p>
                            <p>The submission is considered:</p>
                            <ul className="list-group" style={{ maxWidth: "500px", margin: "auto" }}>
                                {(submission.finalised_categories !== null && submission.finalised_categories !== undefined) && (
                                    submission.finalised_categories.map((category, i) => (
                                        <li key={i} className="list-group-item list-group-item-secondary">{category}</li>
                                    ))
                                )}
                                {submission.finalised_category === null && (
                                    <li className="list-group-item list-group-item-secondary">Not a scam!</li>
                                )}
                            </ul>
                        </div>
                    </div>
                )}

                {(submission.is_votable === false || submission.creator === isAuthenticated().user.id) && (
                    <VoteList submissionId={this.props.match.params.submissionId} />
                )}

                {(submission.is_votable === true && submission.creator !== isAuthenticated().user.id) && (
                    <AddAndEditVoteForm submissionId={this.props.match.params.submissionId} getSubmission={this.getSubmission} />
                )}

                {submission.is_votable === true && submission.creator === isAuthenticated().user.id && (
                    <div className="card" style={{ marginTop: "12px", textAlign: "center" }}>
                        <div className="card-body">
                            <p className='card-text'>Voting is in progress. Would you like to end the session?</p>
                            <button className='btn btn-primary' onClick={this.endVoteSession}>End voting session</button>
                        </div>
                    </div>
                )}
            </div>
        )
    }
}

export default SubmissionPage