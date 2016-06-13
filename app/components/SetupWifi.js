import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { remote } from 'electron';
import styles from './SetupWifi.css';
import TimerMixin from 'react-timer-mixin';
import * as actions from '../actions/auth';

class SetupWifi extends Component {
  static contextTypes = {
    router: React.PropTypes.object
  };

  static propTypes = {
    activateDevice: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props); // We are calling the React.Component constructor method

    this.state = {
      networks: null,
      selectedNetwork: '',
      networkPassword: '',
      loading: false,
      connectLabel: 'Connect'
    };
  }

  componentWillMount() {
    remote.getGlobal('sharedObj').particleSetup();

    let timeoutIsSet = false;
    TimerMixin.setInterval(() => {
      if (remote.getGlobal('sharedObj').photonSetupFailed) {
        this.context.router.push('/failedSetup');
      } else if (remote.getGlobal('sharedObj').photonSetupSuccess) {
        this.props.activateDevice();
      } else if (remote.getGlobal('sharedObj').photonNetworkList &&
        remote.getGlobal('sharedObj').photonNetworkList.length > 0 &&
        !this.state.networks) {
        this.setState({
          networks: remote.getGlobal('sharedObj').photonNetworkList
        });
      } else if (!timeoutIsSet) {
        timeoutIsSet = true;
        TimerMixin.setTimeout(
          () => {
            remote.getGlobal('sharedObj').stopPhotonWifiMonitoring();
            remote.getGlobal('sharedObj').photonSetupFailed = 'Setup timeout,' +
            ' could not find a Smart Power Socket!';
            this.context.router.push('/failedSetup');
          },
          (1000 * 60 * 2) // Wait for 2 minute
        );
      }
    }, 1000); // Wait 1 second
  }

  onInputChange(networkPassword) {
    this.setState({
      networkPassword
    });
  }

  onSubmit(event) {
    event.preventDefault();
    this.connectToNetwork();
  }

  connectToNetwork() {
    remote.getGlobal('sharedObj').setPhotonNetwork(this.state.selectedNetwork,
      this.state.networkPassword);
    this.setState({
      connectLabel: 'Connecting',
      loading: true
    });
  }

  selectNetwork(network) {
    this.setState({
      selectedNetwork: network,
      networkPassword: ''
    });
  }

  showPhotonNetworks() {
    let body = null;

    if (this.state.networks && this.state.networks.length > 0) {
      const networkItems = this.state.networks.map((network) => {
        let output = null;

        if (this.state.selectedNetwork === network) {
          output = (<a onClick={() => this.selectNetwork(network)} key={network}
            className="list-group-item active">{network}</a>);
        } else {
          output = (<a onClick={() => this.selectNetwork(network)} key={network}
            className="list-group-item">{network}</a>);
        }
        return output;
      });

      body = (
        <div className={styles.container}>
          <h2>Select a network to connect your Smart Power Socket</h2>
          <div className="list-group">
            {networkItems}
          </div>
          {this.state.selectedNetwork ?
          <form className={styles.networkForm} onSubmit={this.onSubmit.bind(this)}>
            <div className="form-group">
              <input type="password" className="form-control"
                style={{ height: '54px', fontSize: '120%' }}
                placeholder="Network Password" value={this.state.networkPassword}
                onChange={ event => this.onInputChange(event.target.value) }
              >
              </input>
            </div>
            <div className={styles.menuOptions}>
              {this.state.networkPassword.length > 0 ?
              <a onClick={this.connectToNetwork.bind(this)}>{this.state.connectLabel}</a>
              : <span></span>}
              <br />
                {this.state.loading ?
                  <img src="images/spinner.gif" alt="Loading spinner" /> :
                <span></span>}
            </div>
          </form> : <span></span>}
      </div>

      );
    } else {
      body = (<div className={styles.loading}>
                  Searching for Smart Power Sockets...<br />
                  <img src="images/spinner.gif" alt="Loading spinner" />
              </div>);
    }

    return body;
  }

  render() {
    return (
      <div>
        {this.showPhotonNetworks()}
      </div>
    );
  }
}

export default connect(null, actions)(SetupWifi);
