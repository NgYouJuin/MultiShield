import React, { Component } from 'react'
import { getSubmissionsByCurrentUser } from './apiSubmissions'
import { isAuthenticated } from '../auth/auth'
import { Link } from 'react-router-dom/cjs/react-router-dom'

class SubmissionList extends Component {
    constructor(){
        super()
        this.state = {
            sumbissions: []
        }
    }

    componentDidMount(){
        const token = isAuthenticated().token
        getSubmissionsByCurrentUser(token).then(data=> {
            if (!data.success) {
            }else {
                this.setState({sumbissions: data.data})
            }
        })
    }

    renderList = submissions => {
        return(
            <div>
                <h1 style={{marginBottom: '20px'}}
                    hidden={!submissions.length}><strong><u>My Submissions:</u></strong></h1>
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
        const {sumbissions} = this.state
        return (
            <section>
                {this.renderList(sumbissions)}
            </section>
        )
    }
}

export default SubmissionList