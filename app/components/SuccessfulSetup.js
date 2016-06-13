import React, { Component } from 'react';
import styles from './SuccessfulSetup.css';
import { Link } from 'react-router';

class SuccessfulSetup extends Component {

  render() {
    return (
      <div>
        <div className={styles.container}>
          <h2>Your Smart Power Socket was successfuly configured!
            <br /><br />
            <Link to="/exit">Exit</Link>
          </h2>
        </div>
      </div>
    );
  }
}

export default SuccessfulSetup;
