import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { remote } from 'electron';
import styles from './SetupWifi.css';
import TimerMixin from 'react-timer-mixin';
import * as authActions from '../actions/auth';
import * as deviceActions from '../actions/device';

function collect() {
  let ret = {};
  let len = arguments.length;
  for (let i=0; i<len; i++) {
    for (let p in arguments[i]) {
      if (arguments[i].hasOwnProperty(p)) {
        ret[p] = arguments[i][p];
      }
    }
  }
  return ret;
}

let actions = collect(authActions, deviceActions);
let interval = null;

class SetupWifi extends Component {
  static contextTypes = {
    router: React.PropTypes.object
  };

  static propTypes = {
    claimDevice: PropTypes.func.isRequired
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
  componentWillUnmount() {
    TimerMixin.clearInterval(interval);
  }

  componentWillMount() {
    remote.getGlobal('particleEnhancement').setup();

    let timeoutIsSet = false;
    interval = TimerMixin.setInterval(() => {
      if (remote.getGlobal('particleEnhancement').photonSetupFailed) {
        this.context.router.push('/failedSetup');
      } else if (remote.getGlobal('particleEnhancement').photonSetupSuccess) {
        this.props.claimDevice(remote.getGlobal('particleEnhancement').photonDeviceId, remote.getGlobal('particleEnhancement').deviceName);
      } else if (remote.getGlobal('particleEnhancement').photonNetworkList &&
                 remote.getGlobal('particleEnhancement').photonNetworkList.length > 0 &&
                 !this.state.networks) {
        this.setState({
          networks: remote.getGlobal('particleEnhancement').photonNetworkList
        });
      } else if (!timeoutIsSet) {
        timeoutIsSet = true;
        TimerMixin.setTimeout(
          () => {
            if (!remote.getGlobal('particleEnhancement').photonNetworkList) {
              remote.getGlobal('particleEnhancement').stopPhotonWifiMonitoring();
              remote.getGlobal('particleEnhancement').photonSetupFailed = 'Setup timeout,' +
                ' could not find a Smart Power Socket!';
              this.context.router.push('/failedSetup');
            }
          },
          (1000 * 60 * 2) // Wait for 2 minutes
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
    remote.getGlobal('particleEnhancement').setPhotonNetwork(this.state.selectedNetwork,
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
