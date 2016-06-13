import React, { Component } from 'react';
import { remote } from 'electron';

export default class Exit extends Component {

  componentWillMount() {
    remote.getGlobal('sharedObj').quitApp();
  }

  render() {
    return (
      <div>
      </div>
    );
  }
}
