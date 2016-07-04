import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { hashHistory } from 'react-router';
import { routerMiddleware } from 'react-router-redux';
import { AUTH_USER } from '../actions/auth';
import rootReducer from '../reducers';

const router = routerMiddleware(hashHistory);

const enhancer = applyMiddleware(thunk, router);

export default function configureStore(initialState) {
  const store = createStore(rootReducer, initialState, enhancer);

  // If we have a token, consider the user to be signed in
  const token = localStorage.getItem('token');

  if (token) {
    // we need to update the application state
    store.dispatch({ type: AUTH_USER });
  }

  return store;
}
