import React, { Component } from 'react'
import { endVotingForSubmission, getSubmissionsById } from './apiSubmissions'
import { isAuthenticated } from '../auth/auth'
import VoteList from '../votes/voteList'
import AddAndEditVoteForm from '../votes/addAndEditVoteForm'
import { Link } from 'react-router-dom';

class SubmissionPage extends Component {
    constructor(){
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
            getSubmissionsById(token, submissionId).then(data=> {
                this.setState({isLoading:false})
                if (!data.success) {
                    this.setState({validSubmission: false})
                }else {
                    this.setState({
                        submission: data.data,
                        validSubmission: true
                    })
                }
            })
    }

    componentDidMount(){
        this.getSubmission();
    }

    renderMarkedText = (text, keywords) => {

    const escapeRegex = (str) =>
        str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const sortedKeywords = [...keywords].sort(
        (a, b) => b.length - a.length
    );

    const regex = new RegExp(
        `(${sortedKeywords.map(escapeRegex).join("|")})`,
        "gi"
    );

    const parts = text.split(regex);

    return (
        <p className="card-text" style={{lineHeight:'2'}}>
        {parts.map((part, index) => {
            const isMatch = sortedKeywords.some(
            (k) => k.toLowerCase() === part.toLowerCase()
            );

            return isMatch ? (
            <mark style={{backgroundColor:'rgba(255, 100, 100, 0.5)'}} key={index}>{part}</mark>
            ) : (
            part
            );
        })}
        </p>
    );
    };

    renderVoteSummary = submission => {
        
        const yes_percentage = (submission.yes_votes / submission.total_votes) * 100
        if (submission.total_votes > 0) {
        return(
                <div className='row' >
                    <div className='col-sm-12 col-md-6' style={{marginTop:'10px'}}>
                        <div className="card">
                            <div className="card-body" style={{textAlign:'center'}}>
                                <p className='card-text'><strong>{yes_percentage.toFixed(2)}%</strong> of users voted for it to be a scam.</p>
                            </div>
                        </div>
                    </div>

                    <div className='col-sm-12 col-md-6' style={{marginTop:'10px'}}>
                        <div className="card">
                            <div className="card-body" style={{textAlign:'center'}}>
                                <p className='card-text'><strong>{(100 - yes_percentage).toFixed(2)}%</strong> of users voted for it to be not a scam.</p>
                            </div>
                        </div>
                    </div>
                </div>
        )}
        else{
            return (
                <div className='row' style={{marginTop:'10px'}}>
                    <div className='col-12'>
                        <div className="card">
                            <div className="card-body" style={{textAlign:'center'}}>
                                <p className='card-text'>No votes yet!</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    }

    handleKeyDown = e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.submitVote()}
    }

    endVoteSession = () => {
        const token = isAuthenticated().token
        const submissionId = this.props.match.params.submissionId;
        endVotingForSubmission(token, submissionId).then(data => {
            if(data.success){
                this.getSubmission();
            }
        })
    }

    render(){
        const {submission, validSubmission, isLoading} = this.state

        if (isLoading) {
            return (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
                    <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            );
        }

        if (!validSubmission){
            return(
            <div className="container mt-5 text-center p-5" 
            style={{ backgroundColor: '#f8fafc', borderRadius: '24px' }}>
            <i className="fa fa-exclamation-circle fa-4x text-muted mb-3"></i>
            <h3 className="font-weight-bold">Submission Not Found</h3>
            <p className="text-muted">
                The submission you are looking for does not exist or has been removed.
            </p>
            <Link to="/" className="btn btn-primary mt-3 px-4 py-2">
                Return to Dashboard
            </Link>
            </div>
            )
        }

        return (
            <div className='container' style={{marginTop:'50px'}}>
                

                <div className="card">
                    <h4 className='card-header'>{submission.title}</h4>
                    <div className="card-body">
                        <h5 className="card-title"><strong>The content is:</strong></h5>
                        {/* <p className='card-text'>{submission.text}</p> */}
                        { submission.found_keywords === null && (
                            <p className='card-text'>{submission.text}</p>
                        )}
                        { submission.found_keywords !== null && (
                            <>
                                {this.renderMarkedText(submission.text, submission.found_keywords)}
                            </>
                        )}
                    </div>
                </div>

                {/* {submission.is_votable === false || submission.creator === isAuthenticated().user.id && (
                    <>
                        {this.renderVoteSummary(submission)}
                    </>
                )} */}

                {submission.ai_explaination && (
                    <div className="card" style={{marginTop: "10px"}}>
                        <div className="card-body">
                            <h5 className="card-title">Analysis:</h5>
                            <p className='card-text'>{submission.ai_explaination}</p>
                        </div>
                    </div>
                )}

                {submission.is_votable !== true && (
                 <div className="card" style={{marginTop: "10px", textAlign:"center"}}>
                    <div className="card-body">
                        <p>Voting is closed!</p>
                        <p>The submission is considered:</p>
                        <ul class="list-group" style={{maxWidth:"500px", margin:"auto"}}>
                            {(submission.finalised_categories !== null && submission.finalised_categories !== undefined) && (
                                (submission.finalised_categories.map((category, i) => 
                                {
                                    return(
                                    <li class="list-group-item list-group-item-secondary">{category}</li>
                                    )
                                }
                                ))
                            )}
                            {submission.finalised_category === null && (
                                <li class="list-group-item list-group-item-secondary">Not a scam!</li>
                            )}
                            
                        </ul>
                    </div>
                </div>
                )}

                {(submission.is_votable === false || submission.creator === isAuthenticated().user.id) && (
                    <VoteList submissionId={this.props.match.params.submissionId}></VoteList>
                )}

                {(submission.is_votable === true && submission.creator !== isAuthenticated().user.id) && (
                    <>
                        <AddAndEditVoteForm options={submission.predicted_type_of_scam} submissionId={this.props.match.params.submissionId} getSubmission={this.getSubmission}></AddAndEditVoteForm>
                    </>
                )}

                {submission.is_votable === true && submission.creator === isAuthenticated().user.id && (
                <div className="card" style={{marginTop: "10px", textAlign:"center"}}>
                    <div className="card-body">
                        <p className='card-text'>Voting is still in progress, would you like to end the session?</p>
                        <button className='btn btn-primary' onClick={this.endVoteSession}>End Voting Session</button>
                    </div>
                </div>
                )}

                
            </div>
        )
    }

}

export default SubmissionPage