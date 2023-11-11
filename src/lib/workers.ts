import { HackWorkerMessageWatch, HackWorkerOnMessage } from './snarkjs';

// const snarkjsWorker = new Worker(new URL('_src/workers/snarkjs.ts', import.meta.url));
// snarkjsWorker.onmessage = (e) => {
//   // console.error('snarkjsWorker onmessage', e);
//   if (!e.data) return;
//   if (typeof e.data !== 'object') return;
//   const { requestId, from, data, error } = e.data;
//   if (from !== 'snarkjs') return;
//   if (!requestId) return;
//   const cb = cacheMap.get(requestId);
//   if (!cb) return;
//   cb({ data, error });
//   cacheMap.delete(requestId);
// };

HackWorkerMessageWatch((e: any) => {
  if (typeof e !== 'object') return;
  const { requestId, from, data, error } = e;
  if (from !== 'snarkjs') return;
  if (!requestId) return;
  const cb = cacheMap.get(requestId);
  if (!cb) return;
  cb({ data, error });
  cacheMap.delete(requestId);
});

let id = 0;
const cacheMap = new Map<number, (data: any) => any>();

export const snarkjsGroth16fullProve = (data: any): Promise<{ data: any; error: Error }> => {
  const requestId = ++id;
  return new Promise((resolve) => {
    cacheMap.set(requestId, resolve);
    // snarkjsWorker.postMessage({ to: 'snarkjs', requestId, action: 'Groth16fullProve', data });
    HackWorkerOnMessage({ to: 'snarkjs', requestId, action: 'Groth16fullProve', data });
  });
};

export const snarkjsGroth16fullProveMounted = (): Promise<{ data: any; error: Error }> => {
  const requestId = ++id;
  return new Promise((resolve) => {
    cacheMap.set(requestId, resolve);
    // snarkjsWorker.postMessage({ to: 'snarkjs', requestId, action: 'Groth16fullProveMounted', data: null });
    HackWorkerOnMessage({ to: 'snarkjs', requestId, action: 'Groth16fullProveMounted', data: null });
  });
};
