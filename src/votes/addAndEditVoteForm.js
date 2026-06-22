import React, { Component } from 'react'
import { checkForUserVote, createVote, updateVote } from './apiVotes';
import { isAuthenticated } from '../auth/auth';

class AddAndEditVoteForm extends Component {
    constructor(){
        super()
        this.state = {
            yesOrNoInput: "Test",
            typeOfScamInput: "",
            hasVoted: false,
            isEditForm: false,
            vote: "",
            isProcessing: false // Added processing state
        }
    }

    componentDidMount(){
        checkForUserVote(isAuthenticated().token, this.props.submissionId).then(data => {
            if(data.success){
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
        const {yesOrNoInput, typeOfScamInput} = this.state;
        const submissionId = this.props.submissionId;
        const token = isAuthenticated().token
        
        const bodyData = yesOrNoInput === "Yes" ? {
            "vote": yesOrNoInput,
            "type_of_scam": typeOfScamInput
        } : {"vote": yesOrNoInput}

        // Set processing state to true before calling API
        this.setState({ isProcessing: true });

        createVote(token, submissionId, bodyData)
            .then(data => {
                this.setState({ isProcessing: false }); // Reset processing state

                if(!data.success){
                    console.log(data.message)
                }else{
                    this.props.getSubmission()
                    this.setState({hasVoted: true})
                }
            })
            .catch(err => {
                this.setState({ isProcessing: false }); // Ensure reset if request fails
                console.error(err);
            });
    }

    submitUpdatedVote = () => {
        this.setState({isEditForm: false, isProcessing: true}) // Set processing true here
        const {yesOrNoInput, typeOfScamInput, vote} = this.state;
        const token = isAuthenticated().token
        const bodyData = yesOrNoInput === "Yes" ? {
            "vote": yesOrNoInput,
            "type_of_scam": typeOfScamInput
        } : {
            "vote": yesOrNoInput,
            "type_of_scam": null
        }
        updateVote(token, vote, bodyData)
            .then(data => {
                this.setState({ isProcessing: false }); // Reset processing state

                if(!data.success){
                    console.log(data.message)
                }else{
                    this.props.getSubmission()
                }
            })
            .catch(err => {
                this.setState({ isProcessing: false }); // Ensure reset if request fails
                console.error(err);
            });
    }

    activateEditForm = () => {
        this.setState({isEditForm: true})
    }

    deactivateEditForm = () => {
        this.setState({isEditForm: false})
    }

    render(){
        const {yesOrNoInput, hasVoted, isEditForm, isProcessing} = this.state
  
        return(
            <div className="card" style={{marginTop: '10px'}}>                    
                <div className="card-body" style={{textAlign: 'center'}}>
                    <h5 className='card-title'>Share your thoughts</h5>
                    <div className="card-body">
                    <div className='container'>
                        <div className='row'  style={{marginTop:'10px'}}>
                        <div className='col-sm-12 col-md-6'>
                        <p>Do you think it is a scam?</p>
                        </div>
                        <div className='col-sm-12 col-md-6'>
                        <div className="form-check form-check-inline" style={{marginLeft: '10px'}}>
                        <input className="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio1" value="Yes"
                        onChange={(e) => {this.setState({yesOrNoInput: e.target.value})}} disabled={(hasVoted && !isEditForm) || isProcessing} checked={yesOrNoInput === "Yes"}/>
                        <label className="form-check-label" htmlFor="inlineRadio1">Yes</label>
                        </div>
                        
                        <div className="form-check form-check-inline">
                        <input className="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio2" value="No"
                        onChange={(e) => {this.setState({yesOrNoInput: e.target.value})}} disabled={(hasVoted && !isEditForm) || isProcessing} checked={yesOrNoInput === "No"}/>
                        <label className="form-check-label" htmlFor="inlineRadio2">No</label>
                        </div>
                        </div>
                        </div>
                        {yesOrNoInput !== undefined  && (
                            <>
                            { yesOrNoInput === "Yes" && (
                            <div className='row' style={{marginTop:'10px'}}>
                                <div className='col-sm-12 col-md-6'>
                                <p>If yes, what type of scam is it?</p>
                                </div>
                                <div className='col-sm-12 col-md-6'>

                                <div className="form-group">
                                    <select className="form-control" 
                                    id="exampleFormControlSelect1"                                 
                                    value={this.state.typeOfScamInput}
                                    onChange={(e) => {this.setState({typeOfScamInput: e.target.value})}} disabled={hasVoted && !isEditForm}>
                                    <option value="">
                                    Select an option
                                    </option>
                                    {!this.props.options && (
                                        <>
                                        <option value="Impersonation">Impersonation</option>
                                        <option value="Parcel Scams">Parcel Scams</option>
                                        <option value="Compromised business emails">Compromised business emails</option>
                                        <option value="Marketplace Phishing">Marketplace Phishing</option>
                                        <option value="Fake Friend/Boss">Fake Friend/Boss</option>
                                        </>
                                    )}
                                    {this.props.options && (this.props.options.map((option) => {
                                        return(
                                            <option value={option}>{option}</option>
                                        )
                                    }))}
                                    </select>
                                </div>

                                </div>
                            </div>
                             )}
                             </>
                        )}
                        {(hasVoted === true && isEditForm === false) && (
                            <button className='btn btn-primary' onClick={this.activateEditForm}>Edit Vote</button>
                        )}
                        {(hasVoted === true && isEditForm === true) && (
                            <div className='row' style={{marginTop: "10px"}}>
                                <div className='col-6' style={{textAlign:'right'}}>
                                    <button className='btn btn-primary' onClick={this.submitUpdatedVote} disabled={isProcessing}>
                                        {isProcessing ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                                                Updating...
                                            </>
                                        ) : (
                                            <span>Submit</span>
                                        )}
                                    </button>
                                </div>
                                <div className='col-6' style={{textAlign:'left'}}>
                                    <button className='btn btn-primary' onClick={this.deactivateEditForm} disabled={isProcessing}>Cancel</button>
                                </div>
                            </div>
                        )}
                        {hasVoted !== true && (
                            <button className='btn btn-primary' onClick={this.submitVote} disabled={isProcessing}>
                                {isProcessing ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                                        Processing...
                                    </>
                                ) : (
                                    <span>Submit</span>
                                )}
                            </button>
                        )}
                    </div>
                    </div>
                </div>
            </div>
            
        )
    }
}

export default AddAndEditVoteForm;