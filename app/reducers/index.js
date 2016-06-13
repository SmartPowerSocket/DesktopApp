import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import { reducer as form } from 'redux-form';
import authReducer from './auth_reducer';

const rootReducer = combineReducers({
  routing,
  form,  // form: form - ES6
  auth: authReducer
});

export default rootReducer;
