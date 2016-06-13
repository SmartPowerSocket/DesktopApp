import React, { Component } from 'react';
import styles from './FailedSetup.css';
import { Link } from 'react-router';
import { remote } from 'electron';

class FailedSetup extends Component {

  constructor(props) {
    super(props); // We are calling the React.Component constructor method

    this.state = {
      errorMessage: null,
    };
  }

  componentWillMount() {
    this.setState({
      errorMessage: remote.getGlobal('sharedObj').photonSetupFailed
    });

    remote.getGlobal('sharedObj').photonSetupFailed = null;
    remote.getGlobal('sharedObj').photonSetupSuccess = null;
    remote.getGlobal('sharedObj').photonNetworkList = null;
  }

  render() {
    return (
      <div>
        <div className={styles.container}>
          <h2>{this.state.errorMessage}
            <br /><br />
            <Link to="/setupInstructions">Try again</Link>
            <br />
            <Link to="/exit">Exit</Link>
          </h2>
        </div>
      </div>
    );
  }
}

export default FailedSetup;
