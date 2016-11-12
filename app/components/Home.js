import React, { Component, PropTypes } from 'react';
import { reduxForm, propTypes } from 'redux-form';
import styles from './Home.css';
import * as actions from '../actions/auth';

class Home extends Component {

  static contextTypes = {
    router: PropTypes.object
  };

  static propTypes = {
    ...propTypes,
    signinUser: PropTypes.func,
    errorMessage: PropTypes.string
  };

  constructor(props) {
    super(props); // We are calling the React.Component constructor method

    this.state = {
      loading: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.errorMessage) {
      this.setState({
        loading: false
      });
    }
  }

  handleFormSubmit({ email, password }) {
    this.setState({
      loading: true
    });
    // {email, password} - {email: email, password: password}
    this.props.signinUser({ email, password });
  }

  renderAlert() {
    if (this.props.errorMessage) {
      return (
        <div className="alert alert-danger">
          <strong>Oops! </strong> {this.props.errorMessage}
        </div>
      );
    }
  }

  render() {
    const { handleSubmit, fields: { email, password } } = this.props;

    return (
      <div>
        <div className={styles.container}>
          <img src="images/logo.png" alt="Smart Power Socket logo" />
          <br />
          <div className={styles.menu}>
            <form onSubmit={handleSubmit(this.handleFormSubmit.bind(this))}>
              <fieldset className="form-group">
                <label htmlFor={'email'}>Email:</label>
                <input {...email} className="form-control" />
              </fieldset>
              <fieldset className="form-group">
                <label htmlFor={'password'}>Password:</label>
                <input {...password} type="password" className="form-control" />
              </fieldset>
              {this.renderAlert()}
              <button action="submit" className="btn btn-primary">
                {this.state.loading ?
                  <img width="60px" height="60px" src="images/spinner.gif" alt="Loading spinner" /> :
                  <span />} Sign in
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return { errorMessage: state.auth.error };
}

// just like connect
export default reduxForm({
  form: 'signin',
  fields: ['email', 'password']
}, mapStateToProps, actions)(Home);
