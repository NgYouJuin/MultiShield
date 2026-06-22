import React, { Component } from 'react'
import { endVotingForSubmission, getSubmissionsById } from './apiSubmissions'
import { isAuthenticated } from '../auth/auth'
import VoteList from '../votes/voteList'
import AddAndEditVoteForm from '../votes/addAndEditVoteForm'
import { Link } from 'react-router-dom'

class SubmissionPage extends Component {
    constructor() {
        super()
        this.state = {
            submission: {},
            validSubmission: false,
            isLoading: true
        }
    }

    getSubmission = () => {
        const token = isAuthenticated().token
        const submissionId = this.props.match.params.submissionId;
        getSubmissionsById(token, submissionId).then(data => {
            this.setState({ isLoading: false })
            if (!data.success) {
                this.setState({ validSubmission: false })
            } else {
                this.setState({
                    submission: data.data,
                    validSubmission: true
                })
            }
        })
    }

    componentDidMount() { this.getSubmission(); }

    renderMarkedText = (text, keywords) => {
        const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);
        const regex = new RegExp(
            `(${sortedKeywords.map(escapeRegex).join("|")})`,
            "gi"
        );
        const parts = text.split(regex);

        return (
            <p className="card-text" style={{ lineHeight: '2', whiteSpace: 'pre-wrap' }}>
                {parts.map((part, index) => {
                    const isMatch = sortedKeywords.some(
                        (k) => k.toLowerCase() === part.toLowerCase()
                    );
                    return isMatch ? (
                        <mark
                            key={index}
                            style={{ backgroundColor: 'rgba(255, 100, 100, 0.5)', padding: '0 2px', borderRadius: 4 }}
                        >
                            {part}
                        </mark>
                    ) : (
                        part
                    );
                })}
            </p>
        );
    };

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
        const { submission, validSubmission, isLoading } = this.state

        if (isLoading) {
            return (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
                    <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            );
        }

        if (!validSubmission) {
            return (
                <div className="container mt-5 text-center p-5 ms-glass"
                    style={{ borderRadius: '24px' }}>
                    <i className="fa fa-exclamation-circle fa-4x mb-3" style={{ color: 'var(--ms-muted)' }}></i>
                    <h3 className="font-weight-bold">Submission Not Found</h3>
                    <p style={{ color: 'var(--ms-muted)' }}>
                        The submission you are looking for does not exist or has been removed.
                    </p>
                    <Link to="/" className="btn btn-primary mt-3 px-4 py-2">
                        Return to Dashboard
                    </Link>
                </div>
            )
        }

        return (
            <div className='container' style={{ marginTop: '40px', paddingBottom: 60 }}>
                <div className="card">
                    <div className="card-header" style={{ background: 'var(--ms-grad)', color: '#06122a', borderRadius: '18px 18px 0 0' }}>
                        <h4 style={{ marginBottom: 0, fontWeight: 700, color: '#06122a' }}>{submission.title}</h4>
                    </div>
                    <div className="card-body">
                        <h6 style={{ color: 'var(--ms-muted)', textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 12, marginBottom: 12 }}>The content</h6>
                        {submission.found_keywords === null || submission.found_keywords === undefined ? (
                            <p className='card-text' style={{ whiteSpace: 'pre-wrap' }}>{submission.text}</p>
                        ) : (
                            this.renderMarkedText(submission.text, submission.found_keywords)
                        )}
                    </div>
                </div>

                {submission.ai_explaination && (
                    <div className="card" style={{ marginTop: "12px" }}>
                        <div className="card-body">
                            <h6 style={{ color: 'var(--ms-muted)', textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 12, marginBottom: 12 }}>Analysis</h6>
                            <p className='card-text' style={{ whiteSpace: 'pre-wrap' }}>{submission.ai_explaination}</p>
                        </div>
                    </div>
                )}

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
                    <AddAndEditVoteForm
                        options={submission.predicted_type_of_scam}
                        submissionId={this.props.match.params.submissionId}
                        getSubmission={this.getSubmission}
                    />
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
