import React, { Component } from 'react';
import { Link } from 'react-router';
import styles from './SuccessfulSetup.css';

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
