import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import { reducer as form } from 'redux-form';
import authReducer from './auth_reducer';
import deviceReducer from './device_reducer';

const rootReducer = combineReducers({
  routing,
  form,  // form: form - ES6
  auth: authReducer,
  device: deviceReducer
});

export default rootReducer;
