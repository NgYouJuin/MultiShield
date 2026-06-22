import React, { Component, createRef } from 'react'
import { postSubmissions } from './apiSubmissions'
import { isAuthenticated } from '../auth/auth'
import { Redirect } from 'react-router-dom/cjs/react-router-dom'

class AddSubmissionPage extends Component {
    constructor() {
        super();
        this.state = {
            titleInput: "",
            textInput: "",
            redirectToReferer: false,
            isDragging: false,
            isProcessing: false,
        }
        this.titleInputRef = createRef()
        this.textInputRef = createRef()
    }

    componentDidMount() { }

    handleTitleInput = e => { this.setState({ titleInput: e.target.value }) }
    handleTextInput = e => { this.setState({ textInput: e.target.value }) }

    readFile = (file) => {
        if (!file) return;
        if (file.type !== "text/plain" && !file.name.toLowerCase().endsWith(".txt")) {
            alert("Please upload a .txt file only.");
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => { this.setState({ textInput: e.target.result }) };
        reader.readAsText(file);
    };

    handleDrop = e => {
        e.preventDefault();
        this.setState({ isDragging: false })
        const file = e.dataTransfer.files[0];
        this.readFile(file);
    };
    handleDragOver = e => { e.preventDefault(); };
    handleDragEnter = e => { e.preventDefault(); this.setState({ isDragging: true }) };
    handleDragLeave = e => { e.preventDefault(); this.setState({ isDragging: false }) };
    handleFileChange = e => { this.readFile(e.target.files[0]); };

    handleKeyDown = e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.submitData() }
    }

    submitData = () => {
        const { titleInput, textInput } = this.state;

        // 1. Validation: Prevent submission if text is empty (ignoring whitespace)
        if (!textInput || textInput.trim() === "") {
            alert("Please provide some text to analyze.");
            return; // Stop here if text is empty
        }

        // 2. Default Title: If title is empty/whitespace, use default
        const finalTitle = (titleInput && titleInput.trim() !== "") 
            ? titleInput 
            : "Untitled Submission";

        // 3. Proceed with submission
        this.setState({ isProcessing: true });

        const token = isAuthenticated().token
        const bodyData = { title: titleInput, text: textInput }
        postSubmissions(token, bodyData).then(data => {
            this.setState({ isProcessing: false });
            if (!data.success) {
                console.log(data.message)
            } else {
                this.setState({ redirectToReferer: true })
            }
        })
    }

    render() {
        const { redirectToReferer, isDragging, isProcessing} = this.state;
        if (redirectToReferer) return <Redirect to="/" />
        return (
            <div className="container mt-4" style={{ paddingBottom: 60 }}>
                <div className="ms-glass p-4" style={{ padding: '32px' }}>
                    <div className="mb-4">
                        <h3 style={{ fontWeight: 700, marginBottom: 4 }}>Report a potential scam</h3>
                        <small style={{ color: 'var(--ms-muted)' }}>Share suspicious content with the community for verification.</small>
                    </div>

                    <div className="form-group">
                        <label className="h6 font-weight-bold mb-2 d-block">Title</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder='Give your submission a name'
                            value={this.state.titleInput}
                            onChange={this.handleTitleInput}
                        />
                    </div>

                    <label className="h6 font-weight-bold mb-3 d-block mt-3">Analyze potential scam</label>

                    <div
                        className={`ms-dashed d-flex flex-column align-items-center justify-content-center ${isDragging ? 'is-drag' : ''}`}
                        style={{ padding: '50px 20px' }}
                        onDrop={this.handleDrop}
                        onDragOver={this.handleDragOver}
                        onDragEnter={this.handleDragEnter}
                        onDragLeave={this.handleDragLeave}
                    >
                        <i className="fa fa-file-text-o mb-3" style={{ fontSize: '3rem', color: 'var(--ms-cyan)' }}></i>
                        <p className="mb-0" style={{ fontSize: '1.05rem', color: 'var(--ms-text)' }}>Drag & drop a text file</p>
                        <p className="mb-0" style={{ fontSize: '0.95rem', color: 'var(--ms-muted)' }}>— or —</p>
                        <div style={{ textAlign: 'center', marginTop: 8 }}>
                            <p className="mb-2" style={{ fontSize: '1.05rem', color: 'var(--ms-text)' }}>Upload a .txt file</p>
                            <div className="file-container" style={{ display: 'flex', justifyContent: 'center' }}>
                                <input
                                    className="form-control-file"
                                    type="file"
                                    accept=".txt,text/plain"
                                    onChange={this.handleFileChange}
                                    style={{ color: 'var(--ms-muted)' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-group mt-4">
                        <label className="h6 font-weight-bold mb-2 d-block">Or paste the content</label>
                        <textarea
                            className="form-control"
                            rows="8"
                            placeholder="Paste suspicious message content here..."
                            value={this.state.textInput}
                            onChange={this.handleTextInput}
                            ref={this.textInputRef}
                        />
                    </div>

                    <div className="text-right mt-3">
                        <button type="button" 
                            className="btn btn-primary btn-lg" 
                            onClick={this.submitData}
                            disabled={isProcessing}>
                                {isProcessing ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                                        Processing...
                                    </>
                                ) : (
                                    <span>Submit</span>
                                )}
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}

export default AddSubmissionPage
