import React, { Component } from 'react';
import { Link } from 'react-router';
import styles from './SetupInstructions.css';

class SetupInstructions extends Component {
  constructor(props) {
    super(props); // We are calling the React.Component constructor method

    this.state = {
      mouseOverSetupButton: false
    };
  }

  changeButtonIcon() {
    if (this.state.mouseOverSetupButton) {
      return (<img width="3%" alt="Smart Power Socket icon" src="images/logo-icon-over.png"/>);
    }
    return (<img width="3%" alt="Smart Power Socket icon" src="images/logo-icon.png"/>);
  }

  render() {
    return (
      <div className={styles.container}>
        <div className={styles.backButton}>
          <Link to="/">
            <i className="fa fa-arrow-left fa-3x" />
          </Link>
        </div>
        <div className={styles.instructions}>
          <div className="list-group">
            <a className="list-group-item">1) Make sure your computer has
              <b> internet connection</b> and <b>Wifi</b> is enabled </a>
            <a className="list-group-item">2) <b>Connect your Smart Power
            Socket</b> to your computer using an USB cable</a>
          <a className="list-group-item">3) Click and <b>hold both SETUP and
            RESET buttons</b> on the board</a>
          <a className="list-group-item">4) <b>Release the RESET button </b>
            and keep holding <b>SETUP</b></a>
          <a className="list-group-item">5) When the board <b>starts blinking
            <span style={{ color: 'purple' }}> purple</span>, release the SETUP
            button</b></a>
          <a className="list-group-item">6) Once the <b>LED goes strong
            <span style={{ color: 'purple' }} > purple</span>, click and hold
            the SETUP button for 5 seconds</b></a>
          <a className="list-group-item">7) Finally, the LED will start
            blinking <b><span style={{ color: 'blue' }}>blue</span></b></a>
            <Link to="/setupWifi">
              <span onMouseOver={() => this.setState({ mouseOverSetupButton: true }) }
                onMouseOut={() => this.setState({ mouseOverSetupButton: false }) }
                className={styles.setupButton}>
                {this.changeButtonIcon()} &nbsp;&nbsp; <b>CONNECT IT!</b>
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

export default SetupInstructions;
