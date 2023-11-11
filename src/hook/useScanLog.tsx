import { useMemo } from 'react';
import axios from 'axios';
import { sleep } from '_src/utils';
import { useQueryFn } from './useQueryFn';

const cache: Record<string, Promise<any>> = {};
const lastScanTime: Record<string, number> = JSON.parse(localStorage.getItem('lastScanTime') || '{}');
export const RequestScanApi = async (root: string, url: string) => {
  if (root in cache) {
    await cache[root];
    await sleep(6000);
  } else {
    if (root in lastScanTime && lastScanTime[root] > Date.now()) {
      await sleep(lastScanTime[root] - Date.now());
    }
  }
  const reqUrl = `${root}${url}`;
  cache[root] = axios.get(reqUrl);
  lastScanTime[root] = Date.now() + 6000;
  (async () => {
    await cache[root];
    delete cache[root];
  })();
  return cache[root];
};

export const useScanLogs = (root: string, queryUrl: string) => {
  const query = useQueryFn([root, queryUrl] as const, async ([root, queryUrl]) => {
    const res = await RequestScanApi(root, queryUrl);
    return res.data as {
      status: string;
      message: string;
      result: Array<{
        blockHash: `0x${string}`;
        blockNumber: `0x${string}`;
        data: `0x${string}`;
        gasPrice: `0x${string}`;
        gasUsed: `0x${string}`;
        logIndex: `0x${string}`;
        timeStamp: `0x${string}`;
        topics: `0x${string}`[];
        transactionHash: `0x${string}`;
        transactionIndex: `0x${string}`;
      }>;
    };
  });
  return query;
};
