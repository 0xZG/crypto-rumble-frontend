import { sleep } from '_src/utils';

let snarkjs = null as any;
let zkeyFile = '';

let cb: any;
export const HackWorkerMessageWatch = (fn: any) => {
  cb = fn;
};

export const HackWorkerOnMessage = async (e: any) => {
  e = { data: e };
  if (!e.data) return;
  if (typeof e.data !== 'object') return;
  if (e.data.to !== 'snarkjs') return;
  if (!snarkjs) {
    // eslint-disable-next-line no-undef
    if (!(window as any).snarkjs) {
      const s = document.createElement('script');
      s.src = '/CryptoRumble/static/snarkjs.min.js';
      document.body.append(s);
      await new Promise(async (resolve) => {
        while (!(window as any).snarkjs) {
          await sleep(1000);
        }
        resolve(null);
      });
    }
    snarkjs = (window as any).snarkjs;
    console.log('snarkjs', snarkjs);
  }

  const { requestId, data, action, to } = e.data;
  const end = (response: any) => {
    cb?.({ requestId, from: to, data: response });
  };

  try {
    switch (action) {
      case 'Groth16fullProveMounted': {
        if (!zkeyFile) zkeyFile = await getBigFileUrl2('/CryptoRumble/static/zk/zkeys/');
        end(null);
        break;
      }
      case 'Groth16fullProve': {
        if (!zkeyFile) zkeyFile = await getBigFileUrl2('/CryptoRumble/static/zk/zkeys/');
        const res = await snarkjs.groth16.fullProve(data, '/CryptoRumble/static/zk/candy_crush_demo.wasm', zkeyFile);
        end(res);
        break;
      }
      default:
        throw new Error('unknow action');
    }
  } catch (error) {
    cb?.({ requestId, from: to, data: null, error });
  }
};

const aCode = 97; // 'a'.charCodeAt(0);
const codeLength = 26; // 'z'.charCodeAt(0) - aCode + 1;
const zkeyLast = ('a'.charCodeAt(0) - aCode) * codeLength + 'p'.charCodeAt(0) - aCode; // ap
const zkeyList: string[] = [];
let i = 0;
while (i <= zkeyLast) {
  const n1 = Math.floor(i / codeLength);
  const n2 = i % codeLength;
  zkeyList.push(`${String.fromCharCode(n1 + aCode)}${String.fromCharCode(n2 + aCode)}`);
  i++;
}
async function getBigFileUrl2(url: string) {
  let index = 0;
  const results: any[] = new Array(zkeyList.length).fill(null);
  let computed = 0;
  await new Promise<any>((end) => {
    asyncPool(4, async () => {
      const xhr = new XMLHttpRequest();
      const curIndex = index++;
      if (!zkeyList[curIndex]) return false;
      xhr.open('GET', `${url}${zkeyList[curIndex]}`, true);
      xhr.responseType = 'arraybuffer';
      const res = await new Promise<any>((resolve, reject) => {
        try {
          xhr.onload = () => resolve(xhr.response);
          xhr.send();
        } catch (err: any) {
          reject(new Error(err));
        }
      });
      results[curIndex] = res;
      computed++;
      // end
      if (computed >= zkeyList.length) end(null);
      return true;
    });
  });
  const sortedBuffers = results.map((item) => new Uint8Array(item));
  const fullFile = concatenate(sortedBuffers);
  return getFileUrl(fullFile);
}

export {};

async function asyncPool(poolLimit: number, iteratorFn: () => Promise<boolean>) {
  const run = async (): Promise<any> => {
    const res = await iteratorFn();
    if (!res) return;
    return run();
  };
  for (let i = 0; i < poolLimit; i++) {
    run();
  }
}

function concatenate(arrays: Uint8Array[]) {
  if (!arrays.length) return null;
  const totalLength = arrays.reduce((acc, value) => acc + value.length, 0);
  const result = new Uint8Array(totalLength);
  let length = 0;
  for (const array of arrays) {
    result.set(array, length);
    length += array.length;
  }
  return result;
}

function getFileUrl(buffers: any, mime = 'application/octet-stream') {
  const blob = new Blob([buffers], { type: mime });
  return URL.createObjectURL(blob);
}
