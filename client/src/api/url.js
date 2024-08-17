/* ENDPOINTS */

/* POST */
export const LOGIN_USER = "/login"
export const REGISTER_USER = "/register"
export const REQUEST_PASSWORD_RESET = "/request-password-reset";
export const RESET_PASSWORD = "/reset-password";
export const CREATE_POST = "/create-post"
export const UPLOAD_AVATAR = "/upload-avatar"
export const UPDATE_USER = "/update-user"
export const FOLLOW_USER = "/follow"
export const UNFOLLOW_USER = "/unfollow"
export const REMOVE_AVATAR = "/remove-avatar"
export const REMOVE_FOLLOWER = "/remove-follower"

/* GET */
export const GET_HOME = "/home"
export const GET_USER = "/user" // username or user id required
export const GET_POSTS = "/get-posts" // user id required