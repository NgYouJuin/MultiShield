import React from 'react'
import SubmissionList from '../submissions/submissionList';
import { Link } from 'react-router-dom/cjs/react-router-dom';

const Home2 = () => (
    <div className='container' style={{ paddingBottom: '60px' }}>
        <div className="jumbotron" id='homeJumbotron' style={{ marginTop: '50px', padding: '48px' }}>
            <span style={{
                display: 'inline-block',
                padding: '6px 14px',
                borderRadius: '999px',
                background: 'rgba(58,235,214,0.12)',
                color: 'cyan',
                fontSize: '12px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                marginBottom: '18px',
                border: '1px solid rgba(58,235,214,0.25)'
            }}>Community Powered</span>

            <span style={{
                display: 'inline-block',
                padding: '6px 14px',
                borderRadius: '999px',
                background: 'rgba(16, 181, 88, 0.12)',
                color: 'springgreen',
                fontSize: '12px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                marginBottom: '18px',
                marginLeft: '10px',
                border: '1px solid rgba(6, 192, 111, 0.25)'
            }}>AI Driven</span>
            <h1 className="display-4" style={{ fontWeight: 800 }}> Spot scams as a{" "} <span style={{ textDecoration: "underline" }}> community</span> </h1>
            <p className="lead" style={{ color: 'var(--ms-muted)', maxWidth: '640px' }}>
                Welcome to Multi-Shield - where community deal with scams with the help of AI.
            </p>
            <hr className="my-4" />
            <p style={{ color: 'var(--ms-muted)' }}>Encountered a potential scam? Send it in and let other shields verify it.</p>
            <Link className="btn btn-primary btn-lg" role="button" to="/submit">Submit a scam</Link>
        </div>
        <SubmissionList />
    </div>
)

export default Home2;