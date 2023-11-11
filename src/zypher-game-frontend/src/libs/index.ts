import { ethers } from 'ethers';
import { AtomEffect } from 'recoil';

export function localStorageEffect<T>(key: string): AtomEffect<T> {
  return ({ setSelf, onSet }) => {
    const savedValue = localStorage.getItem(key);
    if (savedValue != null) {
      setSelf(JSON.parse(savedValue));
    }

    onSet((newValue, _, isReset) => {
      if (isReset) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(newValue));
      }
    });
  };
}

export const formatEthNumber = (num?: number | string | ethers.BigNumber | bigint, fixed?: number) => {
  if (num instanceof ethers.BigNumber) {
    try {
      num = num.mul(1e6).div(ethers.constants.WeiPerEther).toNumber() / 1e6;
    } catch (e) {
      console.error('formatEthNumber', e);
      num = 0;
    }
  }
  if (typeof num === 'bigint') {
    try {
      num = Number(num / BigInt(1e6) / BigInt(1e6)) / 1e6;
    } catch (e) {
      console.error('formatEthNumber', e);
      num = 0;
    }
  }
  if (!num) return '0';
  if (typeof num !== 'number') num = Number(num);
  if (typeof fixed === 'number') num = Number(num.toFixed(fixed));
  return NumStrFmtDot(num);
};

export const NumStrFmtDot = (num?: string | number | ethers.BigNumber | bigint, fixedMax = 6) => {
  if (!num) return '0';
  if (typeof num === 'bigint') num = String(num).replace(/n/, '');
  num = String(num);
  const nums = num.split('.');
  nums[0] = nums[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (nums[1]) nums[1] = nums[1].slice(0, fixedMax);
  return nums.join('.');
};

export const fmtNumStr = (num?: number | string | ethers.BigNumber | null | bigint, decimals = 0, options = { fixedMax: 6, useMT: false }) => {
  if (!num) return '0';
  try {
    if (typeof num === 'bigint') num = ethers.BigNumber.from(num);
    if (typeof num === 'string') num = ethers.BigNumber.from(num);
    if (typeof num === 'number') num = ethers.BigNumber.from(num);
  } catch (e) {
    console.error('fmtNumStr', e);
    num = ethers.BigNumber.from(0);
  }

  if (num.eq(0)) return '0';
  num = num.toString();
  const len = num.length - decimals;
  if (len <= 0) {
    num = num.padStart(decimals, '0');
    return `0.${num.replace(/0+$/g, '')}`.slice(0, 8);
  }
  const lastStr = num.slice(0, 6);
  if (len <= 6) {
    return NumStrFmtDot(parseFloat(`${lastStr.slice(0, len)}.${lastStr.slice(len, 6)}`));
  }
  if (options.useMT) {
    if (len <= 12) {
      const len2 = len - 6;
      return `${NumStrFmtDot(parseFloat(`${lastStr.slice(0, len2)}.${lastStr.slice(len2, num.length)}`))}M`;
    }
    const len2 = len - 12;
    return `${NumStrFmtDot(parseFloat(`${lastStr.slice(0, len2)}.${lastStr.slice(len2, num.length)}`))}T`;
  }
  const ints = num.split('.');
  if (ints.length === 1) ints.push('');
  ints[1] = ints[0].slice(len) + ints[1];
  if (ints[1].match(/^0+$/)) ints[1] = '';
  ints[0] = ints[0].slice(0, len);
  ints[0] = ints[0].replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
  if (!ints[1]) return ints[0];
  ints[1] = ints[1].slice(0, options.fixedMax);
  return ints.join('.');
};
export const fmtNum = formatEthNumber;

export const fmtNumStr2 = (num: string) => {
  if (!num) return '0';
  const nums = num.split('.');
  if (nums[0].length <= 6) return NumStrFmtDot(parseFloat(`${nums[0]}.${nums[1].slice(0, 6 - nums[0].length)}`));
  if (nums[0].length <= 12) return `${NumStrFmtDot(parseFloat(`${nums[0].slice(0, nums[0].length - 6)}.${nums[0].slice(nums[0].length - 6, nums[0].length)}`))}M`;
  let res = `${parseFloat(`${nums[0].slice(0, nums[0].length - 12)}.${nums[0].slice(nums[0].length - 12, nums[0].length)}`)}`;
  const newNums = res.split('.');
  res = res.slice(0, Math.max(8, newNums[0].length));
  if (res.endsWith('.')) res = res.slice(0, res.length - 1);
  return `${NumStrFmtDot(res)}T`;
};

export const errorParse = (e: any) => {
  console.error('errorParse', e);
  if (!e) return 'unknown error';
  let msg = String(e);

  if (typeof e === 'object') {
    if (typeof e.data === 'object' && e.data.message) {
      msg = String(e.data.message);
    } else if (typeof e.message === 'string') {
      msg = String(e.message);
    } else if (typeof e.reason === 'string') {
      msg = e.reason;
    }
  }
  msg = msg.replace(/TransactionExecutionError: /, '');
  msg = msg.replace(/\n\nRequest Arguments:([\w\W]*)/, '');
  msg = msg.replace(/\n\nRaw Call Arguments:([\w\W]*)/, '');

  msg = msg.replace(/Contract Call:([\w\W]*)/, '');

  // TransactionExecutionError: User rejected the request. Request Arguments: from: 0x34df25eae393ab
  msg = msg.replace(/(.*){\\"code\\":-32000,\\"message\\":\\"(.*?)\\"}}([\w\W]*)/, '$2');
  if (msg.match(/underlying network changed/)) msg = 'underlying network changed';
  msg = msg.replace(/(.*)execution reverted: (.*?)"(.*)/, '$2').replace(/\\$/, '');
  msg = msg.replace(/VM Exception while processing transaction: /, '');
  msg = msg.replace(/\(action="sendTransaction", transaction=(.*)/, '');
  msg = msg.replace(/Error: /, '');
  if (msg.match(/SilenceError:/)) return '';
  msg = msg.slice(0, 500);
  msg = msg.replace(/\[ See: https:\/\/links.ethers.org\/(.*)/, '');
  return msg;
};

export const textMiddleEllipsis = (text = '', start: number = 6, end: number = 3) => {
  if (text.length <= start + end) return text;
  return `${text.substring(0, start)}...${text.substring(text.length - end)}`;
};
