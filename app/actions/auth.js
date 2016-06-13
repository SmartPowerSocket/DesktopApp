import axios from 'axios';
import { hashHistory } from 'react-router';

export const AUTH_USER = 'auth_user';
export const UNAUTH_USER = 'unauth_user';
export const AUTH_ERROR = 'auth_error';
export const FETCH_MESSAGE = 'fetch_message';

const ROOT_URL = 'http://localhost:3090';

export function signoutUser() {
  localStorage.removeItem('token');

  return { type: UNAUTH_USER };
}

export function signinUser({ email, password }) {
  // redux thunk magic (return a function that allows us to call the dispatcher
  // whenever we resolve our promises)
  return function(dispatch) {
    // { email, password } = { email: email, password: password }
    // Submit email/password to the server
    axios.post(`${ROOT_URL}/signin`, { email, password })
      .then(response => {
        // If request is good...
        // - Update state to indicate user is authenticated
        dispatch({ type: AUTH_USER });
        // - Save the JWT token
        localStorage.setItem('token', response.data.token);
        // - redirect to the route '/feature'

        hashHistory.push('/setupInstructions');
      })
      .catch(() => {
        // If request is bad...
        // - Show an error to the user
        dispatch(authError('Bad login info'));
      });
  };
}

export function activateDevice(deviceId) {
  return function(dispatch) {
    axios.post(`${ROOT_URL}/registerDevice`, {
      headers: { authorization: localStorage.getItem('token') },
      deviceId
    }).then(response => {
      dispatch({
        type: FETCH_MESSAGE,
        payload: response.data.message
      });

      hashHistory.push('/successfulSetup');
    });
  };
}

export function fetchMessage() {
  return function(dispatch) {
    axios.get(`${ROOT_URL}/`, {
      headers: { authorization: localStorage.getItem('token') }
    }).then(response => {
      dispatch({
        type: FETCH_MESSAGE,
        payload: response.data.message
      });
    });
  };
}

export function authError(error) {
  return {
    type: AUTH_ERROR,
    payload: error
  };
}
