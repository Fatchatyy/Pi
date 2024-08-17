import axios from './axios'
import * as urls from './url'
import encrypt from '../utils/encrypt'

function getMethod(url, responseCB, loadingCB) {
    console.log("url ?? making error?", url, "CB : ", responseCB, "LCB :", loadingCB);
    if (loadingCB) loadingCB(true)
        
    return axios
        .get(url)
        .then(response => {
            console.log("response?",response.data)
            if (responseCB) responseCB(response.data)
            if (loadingCB) loadingCB(false)
            return response.data
        })
        .catch(err => {
            if (loadingCB) loadingCB(false)
            return null
        })
}

function postMethod(url, { data, token }, responseCB, loadingCB) {
    console.log("we are in the post method",responseCB, loadingCB)
    if (loadingCB) loadingCB(true)

    let packet = token ? [url, data, token] : [url, data]
    console.log("dataaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa? ",token ,url, data)
    return axios
        .post(...packet)
        .then(response => {
            if (responseCB) responseCB(response.data)
            if (loadingCB) loadingCB(false)
            return response.data
        })
        .catch(err => {
            if (loadingCB) loadingCB(false)
            return null
        })
}
function postMethod1(url, { token, newPassword }, responseCB, loadingCB) {
    console.log("we are in the post method");
    if (loadingCB) loadingCB(true);

    const data = { token, newPassword };
    console.log("Sending data:", data);

    return axios
        .post(url, data) // Send data as JSON
        .then(response => {
            if (responseCB) responseCB(response.data);
            if (loadingCB) loadingCB(false);
            return response.data;
        })
        .catch(err => {
            if (loadingCB) loadingCB(false);
            console.error(err);
            return null;
        });
}
function postMethod2(url, { token, EncyptedPassword }, responseCB, loadingCB) {
    console.log("we are in the post method");
    if (loadingCB) loadingCB(true);

    const data = { token, EncyptedPassword };
    console.log("Sending data:", data);

    return axios
        .post(url, data) // Send data as JSON
        .then(response => {
            if (responseCB) responseCB(response.data);
            if (loadingCB) loadingCB(false);
            return response.data;
        })
        .catch(err => {
            if (loadingCB) loadingCB(false);
            console.error(err);
            return null;
        });
}
function postMethod3(url, { token, email }, responseCB, loadingCB) {
    console.log("we are in the post method");
    if (loadingCB) loadingCB(true);

    const data = { token, email };
    console.log("Sending data:", data);

    return axios
        .post(url, data) // Send data as JSON
        .then(response => {
            if (responseCB) responseCB(response.data);
            if (loadingCB) loadingCB(false);
            return response.data;
        })
        .catch(err => {
            if (loadingCB) loadingCB(false);
            console.error(err);
            return null;
        });
}



export const loginUser = (...args) => {

    return postMethod(urls.LOGIN_USER, ...args)
}

export const registerUser = (...args) => {

    return postMethod(urls.REGISTER_USER, ...args)
}
// Request Password Reset
export const requestPasswordReset = (email) => {
    console.log("we reached the api with args", email);
    return postMethod3(urls.REQUEST_PASSWORD_RESET, {email});
}

export const resetPassword = (token, EncyptedPassword) => {
    console.log("tokennn",token);
    console.log("newPassworddd",EncyptedPassword);
    return postMethod2(urls.RESET_PASSWORD, { token, EncyptedPassword });
}

export const createPost = (...args) => {
    console.log("e7m e7m e7m", ...args);
    return postMethod(urls.CREATE_POST, ...args)
}

export const uploadAvatar = (...args) => {
    return postMethod(urls.UPLOAD_AVATAR, ...args)
}

export const updateUser = (...args) => {
    return postMethod(urls.UPDATE_USER, ...args)
}

export const followUser = (...args) => {
    return postMethod(urls.FOLLOW_USER, ...args)
}

export const unfollowUser = (...args) => {
    return postMethod(urls.UNFOLLOW_USER, ...args)
}

export const removeAvatar = (...args) => {
    return postMethod(urls.REMOVE_AVATAR, ...args)
}

export const removeFollower = (...args) => {
    return postMethod(urls.REMOVE_FOLLOWER, ...args)
}

export const getHome = (...args) => {
    console.log("the args of get home ");
    return getMethod(urls.GET_HOME, ...args)
}

export const getUser = ({ id, username }, ...args) => {
    console.log('we are getting the user hihihii', id , username);
    var query;
    if (id) query = `?userID=${id}`
    else if (username) query = `?username=${username}`
    return getMethod(urls.GET_USER + query, ...args)
}

export const getPosts = (userID, ...args) => {
    return getMethod(urls.GET_POSTS + `?id=${userID}`, ...args)
}
