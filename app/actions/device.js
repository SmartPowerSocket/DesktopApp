import axios from 'axios';
import { hashHistory } from 'react-router';
import { remote } from 'electron';
import { ROOT_URL } from './types';

export const CLAIM_DEVICE = 'claim_device';

export function claimDevice(deviceId, deviceName) {

  return function(dispatch) {
    axios.post(`${ROOT_URL}/claimDevice`, {deviceId: deviceId, deviceName: deviceName}, {
      headers: { authorization: localStorage.getItem('token') },
    }).then(response => {
      dispatch({
        type: CLAIM_DEVICE
      });
      hashHistory.push('/successfulSetup');
    })
    .catch(function (error) {
      remote.getGlobal('particleEnhancement').photonSetupFailed = "Device already registered!"
      hashHistory.push('/failedSetup');
    });
  };
}