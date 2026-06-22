import React, { Component, createRef } from 'react'
import { authenticate, login } from './auth'
import { Link } from 'react-router-dom/cjs/react-router-dom.min'
import { Redirect } from 'react-router-dom/cjs/react-router-dom'
import Logo from '../logo/multishield_transparent.png'

class Login2 extends Component {
    constructor() {
        super()
        this.state = {
            emailInput: "",
            passwordInput: "",
            redirectToReferer: false,
            errorMessage: ""
        }
        this.emailInputRef = createRef()
        this.passwordInputRef = createRef()
    }

    componentDidMount() { }

    handleEmailInput = e => { this.setState({ emailInput: e.target.value }) }
    handlePasswordInput = e => { this.setState({ passwordInput: e.target.value }) }
    handleKeyDown = e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.submitCredentials() }
    }

    submitCredentials = () => {
        const { emailInput, passwordInput } = this.state;
        this.setState({ errorMessage: "" });
        login(emailInput, passwordInput).then(data => {
            if (!data.success) {
                this.setState({ errorMessage: "Email and password mismatch!" });
                this.setState({ emailInput: "" })
                this.setState({ passwordInput: "" })
            } else {
                authenticate(data.data, () => {
                    this.setState({ redirectToReferer: true })
                })
            }
        })
    }

    render() {
        const { redirectToReferer } = this.state;
        if (redirectToReferer) return <Redirect to="/" />
        return (
            <section>
                <div className="container">
                    <div id='loginForm' style={{ marginTop: '70px', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
                        <div className="ms-glass" style={{ padding: '36px' }}>
                            <div className="text-center mb-4">
                                <div className="ms-logo" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <img src={Logo} alt="Multi-Shield Logo"/>
                                </div>
                                <h3 style={{ fontWeight: 700, marginBottom: 4 }}>Welcome back</h3>
                                <small style={{ color: 'var(--ms-muted)' }}>Log in to your Multi-Shield account</small>
                            </div>
                            <form>
                                <div className="form-group">
                                    <label htmlFor="emailInput">Email address</label>
                                    <input type="email" className="form-control" id="emailInput" aria-describedby="emailHelp"
                                        ref={this.emailInputRef} onChange={this.handleEmailInput} onKeyDown={this.handleKeyDown} value={this.state.emailInput} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="passwordInput">Password</label>
                                    <input type="password" className="form-control" id="passwordInput"
                                        ref={this.passwordInputRef} onChange={this.handlePasswordInput} onKeyDown={this.handleKeyDown} value={this.state.passwordInput} required />
                                </div>

                                {this.state.errorMessage && (
                                    <div className="alert alert-danger" role="alert">
                                        {this.state.errorMessage}
                                    </div>
                                )}

                                <button type="button" className="btn btn-primary btn-block" onClick={this.submitCredentials}>Log in</button>
                            </form>
                            <p style={{ textAlign: 'center', marginTop: '18px', color: 'var(--ms-muted)' }}>
                                Don't have an account? <Link to="/signup">Sign up</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        )
    }
}

export default Login2