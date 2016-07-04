import React, { Component } from 'react';
import { remote } from 'electron';

export default class Exit extends Component {

  componentWillMount() {
    remote.getGlobal('particleEnhancement').quitApp();
  }

  render() {
    return (
      <div>
      </div>
    );
  }
}
