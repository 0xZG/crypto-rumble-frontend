import AppConstants from '_src/constants/Constant';
import { BigNumber, ethers } from 'ethers';
import BigNumberJs from 'bignumber.js';
import { Dispatch, SetStateAction } from 'react';

export { errorParse } from '_src/zypher-game-frontend/src/libs';

export const textMiddleEllipsis = (text = '', start: number = 6, end: number = 3) => {
  if (text.length <= start + end) return text;
  return `${text.substring(0, start)}...${text.substring(text.length - end)}`;
};

export const sleep = (t = 200) => new Promise((r) => setTimeout(r, t));

export const timeFmt = (t: number | string | undefined, isSec = false) => {
  if (!t) return '';
  if (typeof t === 'string') t = Number(t);
  if (isSec) t *= 1000;
  const date = new Date(t);
  return date.toLocaleString();
};

export function memoize<T>(factory: T, hasher?: (...args: any[]) => string, callback?: (cache: { [index: string]: T }) => any): T {
  const cache: { [index: string]: T } = {};
  if (callback) callback(cache);
  return function fn(...args: any[]) {
    const key = hasher ? hasher(...args) : JSON.stringify(args);
    if (!cache[key]) {
      cache[key] = (factory as any)(...args);
    }
    return cache[key];
  } as any;
}

export function debounce(fn: Function, delay: number, isDebounce = true) {
  let timer: any;
  return function n(this: any, ...args: any[]) {
    if (isDebounce) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        fn.apply(this, args);
      }, delay);
    } else {
      if (!timer) {
        timer = setTimeout(() => {
          fn.apply(this, args);
          timer = null;
        }, delay);
      }
    }
  };
}

export function CacheIndexOut<T>(data: T) {
  return (e: any) => {
    if (String(e).indexOf('index out of range') !== -1) return Promise.resolve(data);
    console.error('CacheIndexOut', data, e);
    return Promise.resolve(data);
  };
}

export const decodeSVG = (svg: string) => {
  const encoded = svg.replace('data:image/svg+xml;base64,', '');
  return decodeBase64(encoded);
};
const decodeBase64 = (str: string) => {
  if (typeof Buffer === 'undefined') return atob(str);
  const buf = Buffer.from(str, 'base64');
  return buf.toString('ascii');
};
export function StateMerge<T>(state: T, newData: Partial<T>): T {
  return { ...state, ...newData };
}

export function AddressShortString(address: string) {
  return address.replace(/(0x[0-9a-zA-Z]{4})(.*?)([0-9a-zA-Z]{4})$/, '$1...$3');
}

export function generateCubicBezier(v: number, g: number, t: number) {
  const a = v / g;
  const b = t + v / g;
  return [
    [(a / 3 + (a + b) / 3 - a) / (b - a), ((a * a) / 3 + (a * b * 2) / 3 - a * a) / (b * b - a * a)],
    [(b / 3 + (a + b) / 3 - a) / (b - a), ((b * b) / 3 + (a * b * 2) / 3 - a * a) / (b * b - a * a)],
  ];
}

export const log = (name: string, other: string) => {
  // const count = counter.get(name) || 1;
  // counter.set(name, count + 1);
  // console.log(`%c${name}`, 'color: #f60', count, other);
};

// export const addAsset2Wallet = (
//   options: {
//     address: `0x${string}`;
//     decimals: number;
//     image?: string;
//     symbol: string;
//   },
//   type = 'ERC20' as const,
// ) => {
//   if (!window.ethereum) return;
//   return window.ethereum.request({ method: 'wallet_watchAsset', params: { type, options } });
// };

export const formatNumber = (num?: number | string | ethers.BigNumber, fixed?: number) => {
  if (num instanceof ethers.BigNumber) {
    try {
      num = num.mul(1e6).div(ethers.constants.WeiPerEther).toNumber() / 1e6;
    } catch (e) {
      console.error('formatNumber', e);
      num = 0;
    }
  }
  if (!num) return '0';
  if (typeof num !== 'number') num = Number(num);
  if (typeof fixed === 'number') num = Number(num.toFixed(fixed));
  return NumStrFmtDot(num);
};

export const NumStrFmtDot = (num?: string | number | BigNumber) => {
  if (!num) return '0';
  num = String(num);
  const nums = num.split('.');
  nums[0] = nums[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return nums.join('.');
};

export const fmtNumStr = (num?: number | string | BigNumber | null | bigint, decimals = 0, uint = false) => {
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
    if (uint) {
      num = num.slice(0, 10);
      return `0.${num.padStart(10, '0').replace(/0+$/g, '')}`;
    }
    return `0.${num.replace(/0+$/g, '')}`.slice(0, 8);
  }
  const lastStr = num.slice(0, 6);
  if (len <= 6) {
    return NumStrFmtDot(parseFloat(`${lastStr.slice(0, len)}.${lastStr.slice(len, 6)}`));
  }
  if (uint) {
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
  return ints.join('.');
};
export const fmtNum = formatNumber;

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

export const getCountdownText = (endTime: number) => {
  const diff = Math.max(0, endTime - Date.now());
  if (diff === 0) return '';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  const texts: string[] = [];
  if (days > 0) texts.push(`${days.toString().padStart(2, '0')}d`);
  if (hours > 0 || texts.length > 0) texts.push(`${hours.toString().padStart(2, '0')}h`);
  if (minutes > 0 || texts.length > 0) texts.push(`${minutes.toString().padStart(2, '0')}m`);
  texts.push(`${seconds.toString().padStart(2, '0')}s`);
  return texts.join(' ');
};

export const num2b = (num?: number, big = 8) => {
  return new BigNumberJs(num || 0).multipliedBy(new BigNumberJs(10).pow(big)).toFixed(0);
};

export const parseUnits = (num: string | number | BigNumber, decimals = 18) => {
  try {
    num = String(num);
    const nums = num.split('.');
    if (nums[1] && nums[1].length > decimals) nums[1] = nums[1].slice(0, decimals);
    return ethers.utils.parseUnits(nums.join('.'), decimals);
  } catch (e) {
    console.error('parseUnits', e);
    return ethers.constants.Zero;
  }
};

export const getAvatar = (from: string) => {
  return 'https://static.zypher.game/img/avatar/default.png';
};

export const getReactStateValue = <T>(setState: Dispatch<SetStateAction<T>>) => {
  let value: T;
  let resolved = false;
  setState((v) => {
    value = v;
    resolved = true;
    return v;
  });
  return new Promise<T>((resolve) => {
    const check = () => {
      if (!resolved) return;
      resolve(value);
      clearInterval(timer);
    };
    const timer = setInterval(check, 0);
    check();
  });
};

export const awaitReactStateValue = <T>(setState: Dispatch<SetStateAction<T>>) => {
  return new Promise<T>((resolve) => {
    let value: T;
    (setState as any)(
      (v: any) => {
        value = v;
        console.log(value);
        return v;
      },
      () => {
        resolve(value);
      },
    );
  });
};
