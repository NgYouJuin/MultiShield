import React, { Component } from 'react'
import { checkForUserVote, createVote, updateVote } from './apiVotes';
import { isAuthenticated } from '../auth/auth';

class AddAndEditVoteForm2 extends Component {
    constructor() {
        super()
        this.state = {
            yesOrNoInput: "Test",
            typeOfScamInput: "",
            hasVoted: false,
            isEditForm: false,
            vote: ""
        }
    }

    componentDidMount() {
        checkForUserVote(isAuthenticated().token, this.props.submissionId).then(data => {
            if (data.success) {
                this.setState({
                    hasVoted: true,
                    yesOrNoInput: data.data.vote,
                    typeOfScamInput: data.data.type_of_scam,
                    vote: data.data.id
                })
            }
        })
    }

    submitVote = () => {
        const { yesOrNoInput, typeOfScamInput } = this.state;
        const submissionId = this.props.submissionId;
        const token = isAuthenticated().token
        const bodyData = yesOrNoInput === "Yes"
            ? { vote: yesOrNoInput, type_of_scam: typeOfScamInput }
            : { vote: yesOrNoInput }
        createVote(token, submissionId, bodyData).then(data => {
            if (!data.success) { console.log(data.message) }
            else { this.props.getSubmission(); this.setState({ hasVoted: true }) }
        })
    }

    submitUpdatedVote = () => {
        this.setState({ isEditForm: false })
        const { yesOrNoInput, typeOfScamInput, vote } = this.state;
        const token = isAuthenticated().token
        const bodyData = yesOrNoInput === "Yes"
            ? { vote: yesOrNoInput, type_of_scam: typeOfScamInput }
            : { vote: yesOrNoInput, type_of_scam: null }
        updateVote(token, vote, bodyData).then(data => {
            if (!data.success) { console.log(data.message) }
            else { this.props.getSubmission() }
        })
    }

    activateEditForm = () => { this.setState({ isEditForm: true }) }
    deactivateEditForm = () => { this.setState({ isEditForm: false }) }

    render() {
        const { yesOrNoInput, hasVoted, isEditForm } = this.state
        const locked = hasVoted && !isEditForm
        return (
            <div className="card" style={{ marginTop: '12px' }}>
                <div className="card-body" style={{ textAlign: 'center' }}>
                    <h5 className='card-title' style={{ fontWeight: 700, marginBottom: 4 }}>Share your verdict</h5>
                    <small style={{ color: 'var(--ms-muted)' }}>Help the community decide whether this is a scam.</small>

                    <div className='container mt-3'>
                        <div className='row align-items-center' style={{ marginTop: 10 }}>
                            <div className='col-sm-12 col-md-6'>
                                <p style={{ marginBottom: 0 }}>Do you think it is a scam?</p>
                            </div>
                            <div className='col-sm-12 col-md-6'>
                                <div className="form-check form-check-inline" style={{ marginLeft: 10 }}>
                                    <input className="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio1" value="Yes"
                                        onChange={(e) => { this.setState({ yesOrNoInput: e.target.value }) }} disabled={locked} checked={yesOrNoInput === "Yes"} />
                                    <label className="form-check-label" htmlFor="inlineRadio1">Yes</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <input className="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio2" value="No"
                                        onChange={(e) => { this.setState({ yesOrNoInput: e.target.value }) }} disabled={locked} checked={yesOrNoInput === "No"} />
                                    <label className="form-check-label" htmlFor="inlineRadio2">No</label>
                                </div>
                            </div>
                        </div>

                        {yesOrNoInput === "Yes" && (
                            <div className='row align-items-center' style={{ marginTop: 12 }}>
                                <div className='col-sm-12 col-md-6'>
                                    <p style={{ marginBottom: 0 }}>What type of scam?</p>
                                </div>
                                <div className='col-sm-12 col-md-6'>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <select className="form-control" value={this.state.typeOfScamInput}
                                            onChange={(e) => { this.setState({ typeOfScamInput: e.target.value }) }} disabled={locked}>
                                            <option value="">Select an option</option>
                                            <option value="Impersonation">Impersonation</option>
                                            <option value="Parcel Scams">Parcel Scams</option>
                                            <option value="Compromised business emails">Compromised business emails</option>
                                            <option value="Marketplace Phishing">Marketplace Phishing</option>
                                            <option value="Fake Friend/Boss">Fake Friend/Boss</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-4">
                            {hasVoted && !isEditForm && (
                                <button className='btn btn-primary' onClick={this.activateEditForm}>Edit vote</button>
                            )}
                            {hasVoted && isEditForm && (
                                <div className='row'>
                                    <div className='col-6 text-right'>
                                        <button className='btn btn-primary' onClick={this.submitUpdatedVote}>Submit</button>
                                    </div>
                                    <div className='col-6 text-left'>
                                        <button className='btn btn-secondary' onClick={this.deactivateEditForm}>Cancel</button>
                                    </div>
                                </div>
                            )}
                            {!hasVoted && (
                                <button className='btn btn-primary' onClick={this.submitVote}>Submit vote</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default AddAndEditVoteForm2;