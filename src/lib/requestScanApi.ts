import { sleep } from '_src/utils';
import axios from 'axios';

const cache: Record<string, Promise<any>> = {};
const RequestScanApiTimeKey = 'RequestScanApiKeyTime';
let lastReqTime = localStorage.getItem(RequestScanApiTimeKey) || 0;
export const RequestScanApi = async (root: string, url: string) => {
  if (root in cache) {
    await cache[root];
    await sleep(6000);
  } else {
    const diff = Date.now() - Number(lastReqTime);
    if (diff < 6000) await sleep(6000 - diff);
  }
  const reqUrl = `${root}${url}`;
  cache[root] = axios.get(reqUrl);
  localStorage.setItem(RequestScanApiTimeKey, String(Date.now()));
  lastReqTime = String(Date.now());

  (async () => {
    await cache[root];
    delete cache[root];
  })();
  return cache[root];
};
