import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './containers/App';
import HomePage from './containers/HomePage';
import SetupWifi from './components/SetupWifi';
import SetupInstructions from './components/SetupInstructions';
import SuccessfulSetup from './components/SuccessfulSetup';
import FailedSetup from './components/FailedSetup';
import Exit from './components/Exit';
import requireAuth from './components/auth/require_auth';

export default (
  <Route path="/" component={App}>
    <IndexRoute component={HomePage} />
    <Route path="/setupInstructions" component={requireAuth(SetupInstructions)} />
    <Route path="/setupWifi" component={requireAuth(SetupWifi)} />
    <Route path="/successfulSetup" component={requireAuth(SuccessfulSetup)} />
    <Route path="/failedSetup" component={requireAuth(FailedSetup)} />
    <Route path="/exit" component={Exit} />
  </Route>
);
