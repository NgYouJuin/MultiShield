export const getSubmissionsByCurrentUser = (token) => {
    // console.log(message)
    return fetch(`${process.env.REACT_APP_API_URL}/api/submissions/by/currentuser`, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        return response.json()
    })
    .catch(err => console.log(err))
}

export const getSubmissionsById = (token, id) => {
    // console.log(message)
    return fetch(`${process.env.REACT_APP_API_URL}/api/submissions/${id}`, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        return response.json()
    })
    .catch(err => console.log(err))
}

export const getSubmissions = (token) => {
    // console.log(message)
    return fetch(`${process.env.REACT_APP_API_URL}/api/submissions`, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        return response.json()
    })
    .catch(err => console.log(err))
}

export const postSubmissions = (token, body) => {
    return fetch(`${process.env.REACT_APP_API_URL}/api/submissions`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
    })
    .then(response => {
        return response.json()
    })
    .catch(err => console.log(err)) 
}

export const updateSubmissions = (token, body) => {
    return fetch(`${process.env.REACT_APP_API_URL}/api/submissions`, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
    })
    .then(response => {
        return response.json()
    })
    .catch(err => console.log(err)) 
}

export const voteSubmissions = (token, submissionId, body) => {
    return fetch(`${process.env.REACT_APP_API_URL}/api/submissions/${submissionId}/vote`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
    })
    .then(response => {
        return response.json()
    })
    .catch(err => console.log(err)) 
}

export const endVotingForSubmission = (token, submissionId) => {
    return fetch(`${process.env.REACT_APP_API_URL}/api/submissions/${submissionId}/endVoting`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        return response.json()
    })
    .catch(err => console.log(err)) 
}