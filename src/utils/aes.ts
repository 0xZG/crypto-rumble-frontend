import AES from 'crypto-js/aes';
import MD5 from 'crypto-js/md5';
import encBase64 from 'crypto-js/enc-base64';
import encUtf8 from 'crypto-js/enc-utf8';
import encHex from 'crypto-js/enc-hex';
import padPkcs7 from 'crypto-js/pad-pkcs7';
import CryptoJsCore from 'crypto-js/core';

const initAesConfig = {
  mode: CryptoJsCore.mode.CBC,
  padding: padPkcs7,
  keySize: 256,
  iv: '',
};
const getAESConfig = (password: string, config?: Partial<typeof initAesConfig>) => {
  const conf = { ...initAesConfig, ...config };
  const iv = conf.iv ?? md5(`${password}:iv`);
  return {
    iv: encUtf8.parse(md5(iv).substring(0, 16)),
    mode: conf.mode,
    padding: conf.padding,
    keySize: conf.keySize,
  };
};
export const md5 = (str: string) => MD5(str).toString();
const getPassowrd = (pwd: string) => encUtf8.parse(md5(`${pwd}:password`));

export const encryptStringByPassword = (data: string, password: string, config?: Partial<typeof initAesConfig>) => {
  const conf = getAESConfig(password, config);
  const pwd = getPassowrd(password);
  const encData = AES.encrypt(data, pwd, conf).toString();
  const hex = encBase64.parse(encData).toString(encHex);
  // check
  const res = decryptStringByPassword(hex, password);
  if (!res) throw new Error('decrypt result not match');
  if (res !== data) throw new Error('decrypt result not match.');
  return hex;
};

export const decryptStringByPassword = (hex: string, password: string, config?: Partial<typeof initAesConfig>) => {
  const conf = getAESConfig(password, config);
  const pwd = getPassowrd(password);
  hex = encBase64.stringify(encHex.parse(hex));
  return AES.decrypt(hex, pwd, conf).toString(encUtf8);
};
