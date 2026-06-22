import React, { Component, createRef } from 'react'
import { authenticate, signup } from './auth'
import { Link } from 'react-router-dom/cjs/react-router-dom.min'
import { Redirect } from 'react-router-dom/cjs/react-router-dom'
import Logo from '../logo/multishield_transparent.png'

class SignUp3 extends Component {
    constructor() {
        super()
        this.state = {
            emailInput: "",
            usernameInput: "",
            passwordInput: "",
            retypePasswordInput: "",
            redirectToReferer: false,
            errorMessage: "",
            isProcessing: false
        }
        this.usernameInputRef = createRef()
        this.emailInputRef = createRef()
        this.passwordInputRef = createRef()
        this.retypePasswordInputRef = createRef()
    }

    componentDidMount() { }

    handleUsernameInput = e => { this.setState({ usernameInput: e.target.value }) }
    handleEmailInput = e => { this.setState({ emailInput: e.target.value }) }
    handlePasswordInput = e => { this.setState({ passwordInput: e.target.value }) }
    handleRetypePasswordInput = e => { this.setState({ retypePasswordInput: e.target.value }) }
    handleKeyDown = e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.handleSubmitClick() }
    }

    requiredFieldsCheck = () => {
        const { usernameInput, emailInput, passwordInput, retypePasswordInput } = this.state;
        if (!usernameInput || !emailInput || !passwordInput || !retypePasswordInput) {
            this.setState({ errorMessage: "All fields are required." });
            return false;
        }
        return true;
    }

    passwordQualityCheck = () => {
        const { passwordInput } = this.state;
        if (passwordInput.length < 8) {
            this.setState({ errorMessage: "Password must be at least 8 characters long." });
            return false;
        }
        if (!/[A-Z]/.test(passwordInput)) {
            this.setState({ errorMessage: "Password must contain at least one uppercase letter." });
            return false;
        }
        if (!/[a-z]/.test(passwordInput)) {
            this.setState({ errorMessage: "Password must contain at least one lowercase letter." });
            return false;
        }
        if (!/[0-9]/.test(passwordInput)) {
            this.setState({ errorMessage: "Password must contain at least one number." });
            return false;
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(passwordInput)) {
            this.setState({ errorMessage: "Password must contain at least one special character." });
            return false;
        }
        this.setState({ errorMessage: "" });
        return true;
    }

    submitCredentials = () => {
        const { usernameInput, emailInput, passwordInput, retypePasswordInput } = this.state;
        if (passwordInput !== retypePasswordInput) {
            this.setState({ errorMessage: "Passwords do not match." });
            return;
        }
        this.setState({ errorMessage: "", isProcessing: true });
        signup(emailInput, usernameInput, passwordInput).then(data => {
            this.setState({ isProcessing: false });
            if (!data.success) {
                this.setState({ errorMessage: data.message });
            } else {
                authenticate(data.data, () => {
                    this.setState({ redirectToReferer: true })
                })
            }
        }).catch(() => {
            this.setState({ isProcessing: false });
        })
    }

    handleSubmitClick = () => {
        if (this.requiredFieldsCheck() && this.passwordQualityCheck()) {
            this.submitCredentials();
        }
    }

    render() {
        const { redirectToReferer, isProcessing } = this.state;
        if (redirectToReferer) return <Redirect to="/" />
        return (
            <section>
                <div className="container">
                    <div id='signUpForm' style={{ marginTop: '70px', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
                        <div className="ms-glass" style={{ padding: '36px' }}>
                            <div className="text-center mb-4">
                                <div className="ms-logo" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <img src={Logo} alt="MultiShield Logo" />
                                </div>
                                <h3 style={{ fontWeight: 700, marginBottom: 4 }}>Join Multi-Shield</h3>
                                <small style={{ color: 'var(--ms-muted)' }}>Fight back against cyber scams</small>
                            </div>
                            <form>
                                <div className="form-group">
                                    <label htmlFor="usernameInput">Username</label>
                                    <input type="text" className="form-control" id="usernameInput"
                                        ref={this.usernameInputRef} onChange={this.handleUsernameInput} onKeyDown={this.handleKeyDown} value={this.state.usernameInput} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="emailInput">Email address</label>
                                    <input type="email" className="form-control" id="emailInput"
                                        ref={this.emailInputRef} onChange={this.handleEmailInput} onKeyDown={this.handleKeyDown} value={this.state.emailInput} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="passwordInput">Password</label>
                                    <input type="password" className="form-control" id="passwordInput"
                                        ref={this.passwordInputRef} onChange={this.handlePasswordInput} onKeyDown={this.handleKeyDown} value={this.state.passwordInput} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="retypePasswordInput">Re-type password</label>
                                    <input type="password" className="form-control" id="retypePasswordInput"
                                        ref={this.retypePasswordInputRef} onChange={this.handleRetypePasswordInput} onKeyDown={this.handleKeyDown} value={this.state.retypePasswordInput} required />
                                </div>
                                {this.state.errorMessage && (
                                    <div className="alert alert-danger" role="alert">
                                        {this.state.errorMessage}
                                    </div>
                                )}
                                <button
                                    type="button"
                                    className="btn btn-primary btn-block"
                                    onClick={this.handleSubmitClick}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                                            Processing...
                                        </>
                                    ) : (
                                        <span>Create account</span>
                                    )}
                                </button>
                            </form>
                            <p style={{ textAlign: 'center', marginTop: '18px', color: 'var(--ms-muted)' }}>
                                Already have an account? <Link to="/login">Log in</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        )
    }
}

export default SignUp3
