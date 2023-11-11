import AppConstants from '_src/constants/Constant';
import { ethers } from 'ethers';

export const defaultOverrides = async (provider: ethers.providers.Provider) => {
  const gasPrice = await provider.getGasPrice();
  let gasLimit = AppConstants.MaxGasPerTx.div(gasPrice);
  if (gasLimit.gt(AppConstants.MaxGasLimit)) gasLimit = AppConstants.MaxGasLimit;
  return { gasPrice, gasLimit };
};
