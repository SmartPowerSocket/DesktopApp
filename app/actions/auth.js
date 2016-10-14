import axios from 'axios';
import { hashHistory } from 'react-router';
import { remote } from 'electron';
import { ROOT_URL } from './types';

export const AUTH_USER = 'auth_user';
export const UNAUTH_USER = 'unauth_user';
export const AUTH_ERROR = 'auth_error';
export const FETCH_MESSAGE = 'fetch_message';

export function signoutUser() {
  localStorage.removeItem('token');

  return { type: UNAUTH_USER };
}

export function signinUser({ email, password }) {
  // redux thunk magic (return a function that allows us to call the dispatcher
  // whenever we resolve our promises)
  return (dispatch) => {
    // { email, password } = { email: email, password: password }
    // Submit email/password to the server
    axios.post(`${ROOT_URL}/signin`, { email, password })
      .then(response => {
        // If request is good...
        // - Update state to indicate user is authenticated
        dispatch({ type: AUTH_USER });
        // - Save the JWT token
        localStorage.setItem('token', response.data.token);

        remote.getGlobal('particleEnhancement').photonApiKey = response.data.apiKey;

        hashHistory.push('/setupInstructions');

        return;
      })
      .catch(() => {
        // If request is bad...
        // - Show an error to the user
        dispatch(authError('Bad login info'));
      });
  };
}

export function authError(error) {
  return {
    type: AUTH_ERROR,
    payload: error
  };
}
