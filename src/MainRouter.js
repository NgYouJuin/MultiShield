import React from 'react'
import {Route, Switch} from 'react-router-dom'
import Home2 from './core/Home2'
import Menu from './core/Menu3'
import Login from './auth/login3'
import SignUp from './auth/signUp3'
import PrivateRoute from './auth/privateRoute'
import AddSubmissionPage from './submissions/addSubmission3'
import SubmissionPage from './submissions/submissionPage3'
import Community from './submissions/community3'
import Scoreboard from './user/scoreboard3'
import UserProfile from './user/userProfile2'

const MainRouter = () => (
    <div>
        <Menu/>
        <Switch>
            <PrivateRoute exact path="/" component={Home2}/>
            <PrivateRoute exact path="/community" component={Community}/>
            <PrivateRoute exact path="/submit" component={AddSubmissionPage}/>
            <PrivateRoute exact path="/scoreboard" component={Scoreboard}/>
            <PrivateRoute exact path="/userProfile/:userId" component={UserProfile}/>
            <PrivateRoute exact path="/submission/:submissionId" component={SubmissionPage}/>
            <Route exact path="/login" component={Login}/>
            <Route exact path="/signup" component={SignUp}/>
        </Switch>
    </div>
)

export default MainRouter;
