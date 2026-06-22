import React, { Component, createRef  } from 'react'
import { authenticate, login } from './auth'
import { Link } from 'react-router-dom/cjs/react-router-dom.min'
import { Redirect } from 'react-router-dom/cjs/react-router-dom'

class Login extends Component {
    constructor(){
        super()
        this.state = {
            emailInput: "",
            passwordInput: "",
            redirectToReferer: false,
            isProcessing: false
        }
        this.emailInputRef = createRef()
        this.passwordInputRef = createRef()
    }

    componentDidMount() {

    }

    handleEmailInput = e => {
        this.setState({ emailInput: e.target.value })
    }

    handlePasswordInput = e => {
        this.setState({ passwordInput: e.target.value })
    }

    handleKeyDown = e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.submitCredentials()}
    }

    submitCredentials = () => {
        const {emailInput, passwordInput} = this.state;
        this.setState({ isProcessing: true });

        login(emailInput, passwordInput).then(data => {
            this.setState({ isProcessing: false });
            if (!data.success){

            }else{
                authenticate(data.data, () => {
                    this.setState({redirectToReferer: true})
                })
            }
        })
    }

    render() {
        const {redirectToReferer, isProcessing} = this.state;
        if(redirectToReferer) {
            return <Redirect to="/"/>
        }
        return(
            <section>
                 <div className="container">
                    <div id='loginForm' style={{marginTop: '50px'}}>
                        <div className="card bg-primary text-white">
                            <div className="card-body">
                             <h5 className="card-title">Login</h5>
                             <form>
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
                            <p className="Form-footer" style={{textAlign:'center'}}>Don't have an account? <Link to="/signup" style={{color:'#00008B'}}>Sign Up</Link></p>
                             </div>
                        </div>
                    </div>
                 </div>
            </section>
        )
    }
}

export default Login