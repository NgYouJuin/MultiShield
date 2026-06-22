import React, { Component } from "react";

const onboardingSteps = [
    {
        title: "Check a suspicious message",
        icon: "fa fa-search",
        text: "Paste the message, email, or listing that you want the community to review."
    },
    {
        title: "Let others vote",
        icon: "fa fa-users",
        text: "Community members vote whether the content looks like a scam and choose the scam type."
    },
    {
        title: "Review the result",
        icon: "fa fa-pie-chart",
        text: "Compare the vote breakdown, scam categories, and final community decision."
    }
]

class UserOnboarding extends Component {
    constructor() {
        super()
        this.state = {
            activeStep: 0
        }
    }

    goToStep = activeStep => {
        this.setState({activeStep})
    }

    goToNextStep = () => {
        const {activeStep} = this.state
        if (activeStep < onboardingSteps.length - 1) {
            this.setState({activeStep: activeStep + 1})
        }
    }

    goToPreviousStep = () => {
        const {activeStep} = this.state
        if (activeStep > 0) {
            this.setState({activeStep: activeStep - 1})
        }
    }

    renderStepIndicators = () => {
        const {activeStep} = this.state

        return (
            <div className="d-flex justify-content-center mb-4">
                {onboardingSteps.map((step, index) => (
                    <button
                        key={step.title}
                        type="button"
                        className={`btn btn-sm mx-1 ${activeStep === index ? "btn-primary" : "btn-outline-primary"}`}
                        onClick={() => this.goToStep(index)}
                        aria-label={`Go to onboarding step ${index + 1}`}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        )
    }

    renderOnboardingContent = () => {
        const {activeStep} = this.state
        const step = onboardingSteps[activeStep]
        const progressPercentage = ((activeStep + 1) / onboardingSteps.length) * 100
        const isFirstStep = activeStep === 0
        const isLastStep = activeStep === onboardingSteps.length - 1

        return (
            <div className="card-body text-center">
                {this.renderStepIndicators()}

                <div className="progress mb-4" style={{height: "8px"}}>
                    <div
                        className="progress-bar"
                        role="progressbar"
                        style={{width: `${progressPercentage}%`}}
                        aria-valuenow={progressPercentage}
                        aria-valuemin="0"
                        aria-valuemax="100"
                    ></div>
                </div>

                <div className="mb-4">
                    <span
                        className="rounded-circle bg-light text-primary d-inline-flex align-items-center justify-content-center"
                        style={{width: "72px", height: "72px", fontSize: "30px"}}
                    >
                        <i className={step.icon}></i>
                    </span>
                </div>

                <h5 className="card-title">{step.title}</h5>
                <p className="card-text text-muted">{step.text}</p>

                <div className="d-flex justify-content-between mt-4">
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={this.goToPreviousStep}
                        disabled={isFirstStep}
                    >
                        Previous
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={isLastStep && this.props.onComplete ? this.props.onComplete : this.goToNextStep}
                        data-dismiss={isLastStep ? "modal" : undefined}
                    >
                        {isLastStep ? "Get started" : "Next"}
                    </button>
                </div>
            </div>
        )
    }

    render() {
        if (this.props.isModal) {
            return this.renderOnboardingContent()
        }

        return (
            <div className="container" style={{marginTop: "50px"}}>
                <div className="row justify-content-center">
                    <div className="col-sm-12 col-md-10 col-lg-8">
                        <div className="card shadow border-0">
                            <div className="card-header bg-primary text-white text-center">
                                <h4 className="mb-0">Welcome to Multi-shield</h4>
                            </div>
                            {this.renderOnboardingContent()}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default UserOnboarding
