import React from 'react'
import SubmissionList from '../submissions/submissionList';
import { Link } from 'react-router-dom/cjs/react-router-dom';
// import Posts from '../post/Posts'

const Home = () => (
    <div className='container'>
        <div className="jumbotron" id='homeJumbotron' style={{marginTop:"50px"}}>
        <h1 className="display-4">Hello!</h1>
        <p className="lead">Welcome to Multi-Shields! A place where you can get the community to decide if it is a scam or not!</p>
        <hr className="my-4"/>
        <p>If you have encountered a potential scam, go to the submission page to submit the textual content.</p>
        <Link className="btn btn-primary btn-lg" role="button" to="/submit">Submission page</Link>
        </div>
        <SubmissionList></SubmissionList>
    </div>
    
)

export default Home;
