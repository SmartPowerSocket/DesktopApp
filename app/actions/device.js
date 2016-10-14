import axios from 'axios';
import { hashHistory } from 'react-router';
import { remote } from 'electron';
import { ROOT_URL } from './types';

export const CLAIM_DEVICE = 'claim_device';

export function claimDevice(deviceId, deviceName) {
  return (dispatch) => {
    axios.post(`${ROOT_URL}/claimDevice`, { deviceId, deviceName }, {
      headers: { authorization: localStorage.getItem('token') },
    }).then(() => {
      dispatch({
        type: CLAIM_DEVICE
      });
      hashHistory.push('/successfulSetup');
      return;
    })
    .catch(() => {
      remote.getGlobal('particleEnhancement').photonSetupFailed
        = 'Device already registered!';
      hashHistory.push('/failedSetup');
    });
  };
}
