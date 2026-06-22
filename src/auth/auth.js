export const login = (email, password) => {
    // console.log(message)
    return fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body:  JSON.stringify({
            "email": email,
            "password": password
        })
    })
    .then(response => {
        return response.json()
    })
    .catch(err => console.log(err))
}

export const signup = (email, username, password) => {
    // console.log(message)
    return fetch(`${process.env.REACT_APP_API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body:  JSON.stringify({
            "email": email,
            "username": username,
            "password": password
        })
    })
    .then(response => {
        return response.json()
    })
    .catch(err => console.log(err))
}

export const authenticate = (jwt, next) => {
    if(typeof window !== "undefined") {
        localStorage.setItem("jwt", JSON.stringify(jwt));
        next();
    }
}

export const signout = (next) => {
    if(typeof window !== "undefined") localStorage.removeItem("jwt")
    next();
}

export const isAuthenticated = () => {
    // console.log(localStorage.getItem("jwt"))
    if(typeof window == "undefined"){
        return false
    }
    if(localStorage.getItem("jwt")){
        return JSON.parse(localStorage.getItem("jwt"))
    }
}