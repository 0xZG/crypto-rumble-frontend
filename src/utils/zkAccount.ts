import { ethers } from 'ethers';
import { decryptStringByPassword, encryptStringByPassword } from './aes';

const maxSeed = ethers.BigNumber.from('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364140');

export const getZkAccountBySign = async (account: string, signer: ethers.Signer) => {
  const AppDomain = window.location.host;
  const signMessage = [
    `${AppDomain} wants you to sign in with your Ethereum account:`,
    `${account}\n`,
    `Welcome to CryptoRumble!`,
    `\nURI: https://${AppDomain}`,
    'Version: 1',
    `Chain ID: 1`,
    'Nonce: CreateGameAccount',
    'Issued At: 2023-11-11T00:00:00.000Z',
  ].join('\n');
  const signature = await signer.signMessage(signMessage);
  const seed = encryptStringByPassword(signature, account);
  const key = 'Account Initialization';
  const content = encryptStringByPassword(seed, key);
  let pkSeed = ethers.BigNumber.from(`0x${seed.slice(0, 64)}`);
  if (pkSeed.gt(maxSeed)) pkSeed = pkSeed.div(2);
  const zkAccount = new ethers.Wallet(pkSeed.toHexString());
  return { account, zkAccount, content, key };
};

export const decryptedZkAccount = (props: { content: string; key: string }) => {
  const seed = decryptStringByPassword(props.content, props.key);
  let pkSeed = ethers.BigNumber.from(`0x${seed.slice(0, 64)}`);
  if (pkSeed.gt(maxSeed)) pkSeed = pkSeed.div(2);
  const zkAccount = new ethers.Wallet(pkSeed.toHexString());
  return zkAccount;
};
