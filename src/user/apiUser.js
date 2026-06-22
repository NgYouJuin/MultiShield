export const getUsers = (token) => {
    return fetch(`${process.env.REACT_APP_API_URL}/api/users`, {
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

export const getCurrentUser = (token) => {
    return fetch(`${process.env.REACT_APP_API_URL}/api/users/current`, {
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

export const getUserById = (token, userId) => {
    return fetch(`${process.env.REACT_APP_API_URL}/api/users/${userId}`, {
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

export const updateUserById = (token, userId, body) => {
    return fetch(`${process.env.REACT_APP_API_URL}/api/users/${userId}`, {
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