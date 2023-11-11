import classNames from 'classnames';
import { ethers } from 'ethers';

(window as any).APP_ENV = process.env.REACT_APP_MY_NODE_ENV || process.env.NODE_ENV;

const AppConstants = {
  bot: false,

  BASE_URL_API: '',

  GameCryptoRumbleWidth: 8,

  SecPerStep: 4,

  setEntranceFee: ethers.utils.parseEther('10000').toBigInt(),
  GPTokenDecimals: 18,
  GPTokenDecimalsDiv: ethers.constants.WeiPerEther,

  MaxGasPerTx: ethers.utils.parseEther('0.01'),

  MaxGasLimit: ethers.BigNumber.from(30000000),

  NormalTileValues: [1, 2, 3, 4, 5],

  CryptoRumbleSleep: 100,
  CryptoRumbleNewGameHack: false,
  CryptoRumbleProofPerTx: 4,
  CryptoRumbleSeedStatic: true,
};

export default AppConstants;

export const GlobalVar = {
  dispatch: (arg: any) => null as any,
};

export const cn = classNames.bind({});
