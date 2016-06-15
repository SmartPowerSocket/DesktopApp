import axios from 'axios';
import { hashHistory } from 'react-router';
import { remote } from 'electron';

export const CLAIM_DEVICE = 'claim_device';

const ROOT_URL = 'http://e023e096.ngrok.io';

export function claimDevice(deviceId, deviceName) {

  console.log("localStorage.getItem('token'): ", localStorage.getItem('token'));
  console.log("deviceId: ", deviceId);
  console.log("deviceName: ", deviceName);

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