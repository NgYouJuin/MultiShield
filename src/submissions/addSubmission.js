import React, { Component, createRef } from 'react'
import { postSubmissions } from './apiSubmissions'
import { isAuthenticated } from '../auth/auth'
import { Redirect } from 'react-router-dom/cjs/react-router-dom'

class AddSubmissionPage extends Component {
    constructor(){
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

    componentDidMount(){

    }

    handleTitleInput = e => {
        this.setState({ titleInput: e.target.value })
    }

    handleTextInput = e => {
        this.setState({ textInput: e.target.value })
    }

    readFile = (file) => {
        if (!file) return;

        if (
        file.type !== "text/plain" &&
        !file.name.toLowerCase().endsWith(".txt")
        ) {
        alert("Please upload a .txt file only.");
        return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            this.setState({ textInput: e.target.result })
        };

        reader.readAsText(file);
    };

    handleDrop = e => {
        e.preventDefault();
        this.setState({ isDragging: false})

        const file = e.dataTransfer.files[0];
        this.readFile(file);
    };

    handleDragOver = e => {
        e.preventDefault();
    };

    handleDragEnter = e => {
        e.preventDefault();
        this.setState({ isDragging: true})
    };

   handleDragLeave = e => {
        e.preventDefault();
        this.setState({ isDragging: false})
    };

    handleFileChange = e => {
        const file = e.target.files[0];
        this.readFile(file);
    };

    handleKeyDown = e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.submitData()}
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

        const token = isAuthenticated().token;
        const bodyData = {
            "title": finalTitle,
            "text": textInput
        };

        postSubmissions(token, bodyData).then(data => {
            this.setState({ isProcessing: false });

            if (!data.success) {
               alert(data.message);
            } else {
                this.setState({ redirectToReferer: true });
            }
        }).catch(err => {
            this.setState({ isProcessing: false });
            console.error(err);
        });
    }

    render() {
        const {redirectToReferer, isDragging, isProcessing} = this.state;
        if(redirectToReferer) {
            return <Redirect to="/"/>
        }
        return(
            <div className="container mt-4">
                <div 
                    className="p-4" 
                    style={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '24px' 
                    }}
                >

                <div className="form-group">
                    <label className="h5 font-weight-bold mb-2 d-block">
                        Title
                </label>
                <input 
                    type="text" 
                    className="form-control" 
                    placeholder='Submission Name'
                    style={{ 
                    borderRadius: '12px',
                    padding: '12px 16px',
                    backgroundColor: '#f8fafc',
                    border: `1px solid #e2e8f0`
                    }}
                    value={this.state.titleInput}
                    onChange={this.handleTitleInput}
                />
                </div>

                {/* Analyze Potential Scam Header */}
                <label className="h5 font-weight-bold mb-3 d-block">
                    Analyze Potential Scam
                </label>

                {/* Drag & Drop Area */}
                <div 
                className="d-flex flex-column align-items-center justify-content-center" 
                style={{ 
                    border: `2px dashed ${
                        isDragging ? "#0070f3" : "#cbd5e1"
                    }`, // Softer, modern dash color
                    borderRadius: '16px', 
                    padding: '50px 20px',
                    backgroundColor: '#f8fafc'
                }}
                onDrop={this.handleDrop}
                onDragOver={this.handleDragOver}
                onDragEnter={this.handleDragEnter}
                onDragLeave={this.handleDragLeave}
                >
                <i className="fa fa-file-text-o mb-3" style={{ fontSize: '3rem', color: '#333' }}></i>
                <p className="mb-0" style={{ fontSize: '1.1rem', color: '#333' }}>
                    Drag & Drop text files
                </p>
                <p className="mb-0" style={{ fontSize: '1.1rem', color: '#333' }}>or</p>
                <div style={{textAlign:'center'}}>
                    <p className="mb-0" style={{ fontSize: '1.1rem', color: '#333' }}>Upload Text file</p>
                    <br />
                    <div class="file-container" style={{display:"flex", justifyContent: "center", alignItems: "center", width: "100%"}}>
                        <input
                        class="form-control-file"
                        type="file"
                        accept=".txt,text/plain"
                        onChange={this.handleFileChange}
                        style={{display: "inline-block", margin: "0 auto", width:"250px"}}
                        />
                    </div>
                </div>

                </div>

                 {/* Separator Line */}
                <div className="d-flex align-items-center my-4 text-muted">
                <hr className="flex-grow-1 mr-3" style={{ borderTop: '1px solid #e2e8f0' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>OR</span>
                <hr className="flex-grow-1 ml-3" style={{ borderTop: '1px solid #e2e8f0' }} />
                </div>

                {/* Manual Textbox (Gemini Style) */}
                <div className="form-group mb-4">
                <textarea 
                    className="form-control"
                    id="manualTextInput"
                    rows="5"
                    placeholder="Paste or type your text here manually..."
                    style={{
                    borderRadius: '16px',
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    resize: 'vertical',  // Allows vertical resizing only
                    }}
                    value={this.state.textInput}
                    onChange={this.handleTextInput}
                />
                </div>

                <button 
                    type="button" 
                    className="btn btn-primary btn-lg btn-block" 
                    onClick={this.submitData}
                    disabled={isProcessing}
                >
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
        )
    }

}

export default AddSubmissionPage;