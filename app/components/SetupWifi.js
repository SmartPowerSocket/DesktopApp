import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { remote } from 'electron';
import TimerMixin from 'react-timer-mixin';
import styles from './SetupWifi.css';
import * as authActions from '../actions/auth';
import * as deviceActions from '../actions/device';

const actions = Object.assign(authActions, deviceActions);
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
      manualSetup: false,
      manuallyConnectToPhoton: false,
      manualPhotonName: '',
      selectedNetwork: '',
      selectedNetworkSecurityType: '',
      networkName: '',
      networkPassword: '',
      networkSecurityType: '',
      loading: false,
      connectLabel: 'Connect',
      connectedToPhotonLabel: 'Ok, connected!'
    };
  }

  componentWillMount() {
    remote.getGlobal('particleEnhancement').setup();

    let timeoutIsSet = false;
    interval = TimerMixin.setInterval(() => {
      if (remote.getGlobal('particleEnhancement').photonSetupFailed) {
        TimerMixin.clearInterval(interval);
        this.context.router.push('/failedSetup');
      } else if (remote.getGlobal('particleEnhancement').photonSetupSuccess) {
        TimerMixin.clearInterval(interval);
        this.props.claimDevice(remote.getGlobal('particleEnhancement').photonDeviceId, remote.getGlobal('particleEnhancement').deviceName);
      } else if (remote.getGlobal('particleEnhancement').photonNetworkList &&
                 remote.getGlobal('particleEnhancement').photonNetworkList.length > 0 &&
                 !this.state.networks) {
        this.setState({
          networks: remote.getGlobal('particleEnhancement').photonNetworkList
        });
      } else if (remote.getGlobal('particleEnhancement').manualSetup &&
                  this.state.manuallyConnectToPhoton !== null) {
        this.setState({
          manualSetup: true,
          manuallyConnectToPhoton: true,
          manualPhotonName: remote.getGlobal('particleEnhancement').manualPhotonName
        });
      } else if (!timeoutIsSet) {
        timeoutIsSet = true;
        TimerMixin.setTimeout(
          () => {
            if (!remote.getGlobal('particleEnhancement').photonNetworkList) {
              TimerMixin.clearInterval(interval);
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

  componentWillUnmount() {
    TimerMixin.clearInterval(interval);
  }

  onNetworkPasswordChange(networkPassword) {
    this.setState({
      networkPassword
    });
  }

  onNetworkSecurityTypeChange(networkSecurityType) {
    this.setState({
      networkSecurityType
    });
  }

  onNetworkNameChange(networkName) {
    this.setState({
      networkName
    });
  }

  onSubmit(event) {
    event.preventDefault();
    this.connectToNetwork();
  }

  connectedToPhoton() {
    this.setState({
      manuallyConnectToPhoton: null
    });
    remote.getGlobal('particleEnhancement').manualPhotonName = null;
    remote.getGlobal('particleEnhancement').userConnectedToPhotonManually();
  }

  connectToNetwork() {
    if (this.state.manualSetup) {
      remote.getGlobal('particleEnhancement').setPhotonNetworkManually(this.state.networkName,
        this.state.networkPassword, this.state.networkSecurityType);
    } else {
      remote.getGlobal('particleEnhancement').setPhotonNetwork(this.state.selectedNetwork,
        this.state.networkPassword);
    }
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

    if (this.state.manuallyConnectToPhoton) {
      body = (
        <div className={styles.container}>
          <h1>Manual setup</h1>
          <h2>I am unable to automatically connect to SPS</h2>
          <h2>Please connect to the {this.state.manualPhotonName} Wi-Fi network</h2>
          <br />
          <div className={styles.menuOptions}>
            <button
              className="btn-lg btn-primary"
              onClick={this.connectedToPhoton.bind(this)}
            >
              {this.state.connectedToPhotonLabel}
            </button>
          </div>
        </div>
      );
    } else if (this.state.manualSetup) {
      body = (
        <div className={styles.container}>
          <h1>Manual setup</h1>
          <h2>I am unable to automatically connect to Wi-Fi networks</h2>
          <input
            type="text"
            className="form-control"
            placeholder="Network Name" value={this.state.networkName}
            onChange={event => this.onNetworkNameChange(event.target.value)}
          />
          <br />
          <input
            type="password"
            className="form-control"
            placeholder="Network Password" value={this.state.networkPassword}
            onChange={event => this.onNetworkPasswordChange(event.target.value)}
          />
          <br />
          <span><b>Security type:</b></span> <br />
          <input onClick={() => this.onNetworkSecurityTypeChange('None')} type="radio" name="networkSecurity" value="None" /> None <br />
          <input onClick={() => this.onNetworkSecurityTypeChange('WEP Shared')} type="radio" name="networkSecurity" value="WEP Shared" /> WEP Shared <br />
          <input onClick={() => this.onNetworkSecurityTypeChange('WPA TKIP')} type="radio" name="networkSecurity" value="WPA TKIP" /> WPA TKIP <br />
          <input onClick={() => this.onNetworkSecurityTypeChange('WPA AES')} type="radio" name="networkSecurity" value="WPA AES" /> WPA AES <br />
          <input onClick={() => this.onNetworkSecurityTypeChange('WPA2 AES')} type="radio" name="networkSecurity" value="WPA2 AES" /> WPA2 AES <br />
          <input onClick={() => this.onNetworkSecurityTypeChange('WPA2 TKIP')} type="radio" name="networkSecurity" value="WPA2 TKIP" /> WPA2 TKIP <br />
          <input onClick={() => this.onNetworkSecurityTypeChange('WPA2 Mixed')} type="radio" name="networkSecurity" value="WPA2 Mixed" /> WPA2 Mixed <br />
          <input onClick={() => this.onNetworkSecurityTypeChange('WPA2')} type="radio" name="networkSecurity" value="WPA2" /> WPA2
          <br />
          <div className={styles.menuOptions}>
            {this.state.networkName.length > 0 &&
              this.state.networkPassword.length > 0 &&
              this.state.networkSecurityType.length > 0 ?
                <button
                  className="btn-lg btn-primary"
                  onClick={this.connectToNetwork.bind(this)}
                >
                  {this.state.connectLabel}
                </button>
          : <span /> }
            <br />
            {this.state.loading ?
              <img src="images/spinner.gif" alt="Loading spinner" /> :
                <span />
            }
          </div>
        </div>
      );
    } else if (this.state.networks && this.state.networks.length > 0) {
      const networkItems = this.state.networks.map((network) => {
        let output = null;

        if (this.state.selectedNetwork === network) {
          output = (
            <button
              onClick={() => this.selectNetwork(network)}
              key={network}
              className="list-group-item active"
            >
              {network}
            </button>
          );
        } else {
          output = (
            <button
              onClick={() => this.selectNetwork(network)}
              key={network}
              className="list-group-item"
            >
              {network}
            </button>
          );
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
            <form
              className={styles.networkForm}
              onSubmit={this.onSubmit.bind(this)}
            >
              <div className="form-group">
                <input
                  type="password"
                  className="form-control"
                  style={{ height: '54px', fontSize: '120%' }}
                  placeholder="Network Password" value={this.state.networkPassword}
                  onChange={event => this.onNetworkPasswordChange(event.target.value)}
                />
              </div>
              <div className={styles.menuOptions}>
                {this.state.networkPassword.length > 0 ?
                  <button
                    className="btn-lg btn-primary"
                    onClick={this.connectToNetwork.bind(this)}
                  >
                    {this.state.connectLabel}
                  </button>
              : <span /> }
                <br />
                {this.state.loading ?
                  <img src="images/spinner.gif" alt="Loading spinner" /> :
                    <span />
                }
              </div>
            </form> : <span />}
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
