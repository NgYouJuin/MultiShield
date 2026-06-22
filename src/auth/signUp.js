import React, { Component, createRef  } from 'react'
import { authenticate, signup } from './auth'
import { Link } from 'react-router-dom/cjs/react-router-dom.min'
import { Redirect } from 'react-router-dom/cjs/react-router-dom'

class SignUp extends Component {
    constructor(){
        super()
        this.state = {
            emailInput: "",
            usernameInput: "",
            passwordInput: "",
            retypePasswordInput: "",
            redirectToReferer: false,
            isProcessing: false
        }
        this.usernameInputRef = createRef()
        this.emailInputRef = createRef()
        this.passwordInputRef = createRef()
        this.retypePasswordInputRef = createRef()
    }

    componentDidMount() {

    }

    handleInput = e => {
        this.setState({ input: e.target.value })
    }

    handleUsernameInput = e => {
        this.setState({ usernameInput: e.target.value })
    }

    handleEmailInput = e => {
        this.setState({ emailInput: e.target.value })
    }

    handlePasswordInput = e => {
        this.setState({ passwordInput: e.target.value })
    }

    handleRetypePasswordInput = e => {
        this.setState({ retypePasswordInput: e.target.value })
    }

    handleKeyDown = e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.submitCredentials()}
    }

    submitCredentials = () => {
        const {usernameInput, emailInput, passwordInput, retypePasswordInput} = this.state;
        this.setState({ isProcessing: true });

        if(passwordInput === retypePasswordInput){
            signup(emailInput, usernameInput, passwordInput).then(data => {
                this.setState({ isProcessing: false });
                if (!data.success){
                
                }else{
                    authenticate(data.data, () => {
                        this.setState({redirectToReferer: true})
                    })
                }
            })
        }
    }

    render() {
        const {redirectToReferer, isProcessing} = this.state;
        if(redirectToReferer) {
            return <Redirect to="/"/>
        }
        return(
            <section>
                 <div className="container">
                    <div id='signUpForm' style={{marginTop: '50px'}}>
                        <div className="card bg-primary text-white">
                            <div className="card-body">
                             <h5 className="card-title">Sign Up</h5>
                             <form>
                            <div className="form-group">
                                <label for="usernameInput">Username</label>
                                <input type="text" className="form-control" id="usernameInput" aria-describedby="emailHelp"
                                ref={this.usernameInputRef} onChange={this.handleUsernameInput} onKeyDown={this.handleKeyDown} value={this.state.usernameInput} required/>
                            </div>
                            <div className="form-group">
                                <label for="emailInput">Email address</label>
                                <input type="email" className="form-control" id="emailInput" aria-describedby="emailHelp"
                                ref={this.emailInputRef} onChange={this.handleEmailInput} onKeyDown={this.handleKeyDown} value={this.state.emailInput} required/>
                            </div>
                            <div className="form-group">
                                <label for="passwordInput">Password</label>
                                <input type="password" className="form-control" id="passwordInput"
                                ref={this.passwordInputRef} onChange={this.handlePasswordInput} onKeyDown={this.handleKeyDown} value={this.state.passwordInput} required/>
                            </div>
                            <div className="form-group">
                                <label for="retypePasswordInput">Re-Type Password</label>
                                <input type="password" className="form-control" id="retypePasswordInput"
                                ref={this.retypePasswordInputRef} onChange={this.handleRetypePasswordInput} onKeyDown={this.handleKeyDown} value={this.state.retypePasswordInput} required/>
                            </div>
                            <button type="button" className="btn btn-dark"  
                            onClick={this.submitCredentials}>
                                {isProcessing ? (
                                <>
                                    <span className="spinner-border spinner-border-sm mr-2" 
                                    role="status" aria-hidden="true"></span>
                                    Processing...
                                </>
                                ) : (<span>Submit</span>)}
                            </button>
                            </form>
                            <p className="Form-footer" style={{textAlign:'center'}}>Already have an account? <Link to="/login" style={{color:'#00008B'}}>Login</Link></p>
                             </div>
                        </div>
                    </div>
                 </div>
            </section>
        )
    }
}

export default SignUp