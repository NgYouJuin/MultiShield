import { Component } from "react";
import { getUserById, updateUserById } from "./apiUser";
import { isAuthenticated } from "../auth/auth";

class UserProfile extends Component {
    constructor() {
        super();
        this.state = {
            user: {},
            usernameInput: "",
            emailInput: ""
        }
    }

    componentDidMount(){
        this.getUserProfileData();
    }

    getUserProfileData = () => {
        const userId = this.props.match.params.userId;
        getUserById(isAuthenticated().token, userId).then((data) => {
            if (data.success === true){
                this.setState({
                    user: data.data,
                    usernameInput: data.data.username,
                    emailInput: data.data.email
                })
            }
        })
    }

    handleUsernameInput = e => {
        this.setState({ usernameInput: e.target.value })
    }

    handleEmailInput = e => {
        this.setState({ emailInput: e.target.value })
    }

    handleKeyDown = e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.submitData()}
    }

    submitData = () => {
        const {usernameInput, emailInput, user} = this.state
        const bodyData = {
            username: usernameInput,
            email: emailInput
        }
        updateUserById(isAuthenticated().token, user.id, bodyData).then(data=>{
            if(data.success === true){
                this.getUserProfileData()
            }
        })
    }

    render() {
        const {user, usernameInput, emailInput} = this.state
        return(
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card shadow border-0">
                            <div className="card-header bg-primary text-white text-center">
                                <div className="mb-3">
                                    <i
                                        className="fa fa-user"
                                        style={{ fontSize: "80px" }}
                                    ></i>
                                </div>
                                <h3 className="mb-0">{user.username}</h3>
                            </div>

                            <div className="card-body">
                                <div className="row mb-3">
                                    <div className="col-4 font-weight-bold">
                                        Email
                                    </div>
                                    <div className="col-8 text-muted">
                                        {user.email}
                                    </div>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-4 font-weight-bold">
                                        Score
                                    </div>
                                    <div className="col-8">
                                        <span className="badge badge-success p-2">
                                            {user.score}
                                        </span>
                                    </div>
                                </div>

                                <div className="row mb-2">
                                    <div className="col-12">
                                        <small className="text-muted">
                                            Voting Accuracy
                                        </small>
                                        <div className="progress mt-1">
                                            <div
                                                className="progress-bar bg-success"
                                                role="progressbar"
                                                style={{
                                                    width: `${
                                                        user.total_votes > 0
                                                            ? (user.score /
                                                                user.total_votes) *
                                                            100
                                                            : 0
                                                    }%`
                                                }}
                                            >
                                                {user.total_votes > 0
                                                    ? Math.round(
                                                        (user.score /
                                                            user.total_votes) *
                                                            100
                                                    )
                                                    : 0}
                                                %
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card-footer text-center bg-light">
                                <strong>{user.score}</strong> correct votes out of{" "}
                                <strong>{user.total_votes}</strong> total votes
                            </div>
                        </div>
                    </div>
                </div>
                {isAuthenticated() && isAuthenticated().user.id === user.id && (
                <>
                <div className="row justify-content-center" style={{marginTop:'20px'}}>
                    <div className="col-md-6">
                        <button type="button" className="btn btn-primary btn-lg btn-block" data-toggle="modal" data-target="#editProfileModal">Edit Profile</button>
                    </div>
                </div>
                <div class="modal fade" id="editProfileModal" tabindex="-1" aria-labelledby="editProfileModal" aria-hidden="true" data-backdrop="static" data-keyboard="false">
                    <div class="modal-dialog">
                        <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="editProfileModal">Update User Profile</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <form>
                            <div class="form-group">
                                <label for="usernameInput">Username</label>
                                <input type="email" class="form-control" id="usernameInput" value={usernameInput} onChange={this.handleUsernameInput} onKeyDown={this.handleKeyDown}/>
                            </div>
                            <div class="form-group">
                                <label for="emailInput">Email address</label>
                                <input type="email" class="form-control" id="emailInput" value={emailInput} onChange={this.handleEmailInput} onKeyDown={this.handleKeyDown}/>
                            </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" onClick={this.submitData}>Save changes</button>
                        </div>
                        </div>
                    </div>
                </div>
                </>
                )}
            </div>
        )
    }
}

export default UserProfile