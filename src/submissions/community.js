import React, { Component } from 'react'
import { getSubmissions } from './apiSubmissions'
import { isAuthenticated } from '../auth/auth'
import { Link } from 'react-router-dom/cjs/react-router-dom'

class Community extends Component {
    constructor(){
        super()
        this.state = {
            sumbissions: [],
            isLoading: true
        }
    }

    componentDidMount(){
        const token = isAuthenticated().token
        getSubmissions(token).then(data=> {
            if (!data.success) {
            }else {
                this.setState({
                    sumbissions: data.data,
                    isLoading: false
                })
            }
        })
    }

    renderList = submissions => {
        return(
            <div>
            {submissions && (submissions.map((submission, i) => 

                {
                    const yes_percentage = (submission.yes_votes / submission.total_votes) * 100

                    return(
                    <div className="card" style={{marginBottom: '10px'}}>
                         <div className="card-body">
                            <div className="row">
                                <div className="col-sm-12 col-md-4 special-row-col" style={{marginBottom: '0px'}}>
                                    <h5 className="card-title">{submission.title}</h5>
                                </div>
                                <div className="col-sm-12 col-md-4 special-row-col" style={{marginBottom: '0px'}}>
                                    <div className="row">
                                        {submission.total_votes > 0 && (
                                        <>
                                        <div className="col-3" style={{textAlign: 'end'}}>
                                            <i className="fa fa-thumbs-up" style={{fontSize: '30px'}}></i>
                                        </div>
                                        <div className="col-3">
                                            <p>{yes_percentage.toFixed(2)}%</p>
                                        </div>
                                        <div className="col-3" style={{textAlign: 'end'}}>
                                            <i className="fa fa-thumbs-down" style={{fontSize: '30px'}}></i>
                                        </div>
                                        <div className="col-3">
                                             <p>{(100 - yes_percentage).toFixed(2)}%</p>
                                        </div>
                                        </>
                                        )}
                                        {submission.total_votes <= 0 && (
                                        <div style={{width: '100%', textAlign: 'center'}}>
                                        <h5>No votes yet!</h5>
                                        </div>
                                        )}
                                    </div>
                                </div>
                                <div className="col-sm-12 col-md-4 special-row-col" style={{textAlign: 'center', marginBottom:'0px'}}>
                                    <Link className="btn btn-primary" to={`/submission/${submission.id}`}>View</Link>
                                </div>   
                            </div>
                        </div>
                    </div>
                    )
                }
            ))
            }
            </div>
        )
    }

    render() {
        const {sumbissions,isLoading} = this.state

        if (isLoading) {
            return (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
                    <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            );
        }
        return (
            <div className='container' style={{marginTop: '50px'}}>
                <h4>List of Submissions:</h4>
                {this.renderList(sumbissions)}
            </div>
        )
    }
}

export default Community