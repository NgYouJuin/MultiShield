export const getVotesBySubmission = (token, id) => {
    return fetch(`${process.env.REACT_APP_API_URL}/api/submissions/${id}/vote`, {
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

export const createVote = (token, id, body) => {
    return fetch(`${process.env.REACT_APP_API_URL}/api/submissions/${id}/vote`, {
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

export const updateVote = (token, id, body) => {
     return fetch(`${process.env.REACT_APP_API_URL}/api/votes/${id}`, {
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

export const checkForUserVote = (token, id) => {
    return fetch(`${process.env.REACT_APP_API_URL}/api/submissions/${id}/hasVoted`, {
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