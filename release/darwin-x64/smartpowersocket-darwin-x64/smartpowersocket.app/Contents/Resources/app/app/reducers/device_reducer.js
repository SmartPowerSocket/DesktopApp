import { CLAIM_DEVICE } from '../actions/device';

export default function (state = {}, action) {
  switch (action.type) {
    case CLAIM_DEVICE:
      return { ...state };
    default:
      return state;
  }
}
