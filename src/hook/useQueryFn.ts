import { useEffect, useState } from 'react';

const cachePromise: Record<string, Promise<any>> = {};

export const useQueryFn = <T, R = any>(keys: R, fn: (keys: R) => Promise<T>) => {
  const [data, _data] = useState<{
    data: T | null;
    status: 'idle' | 'loading' | 'success' | 'error';
    isLoading: boolean;
  }>({ data: null, isLoading: true, status: 'idle' });

  useEffect(() => {
    _data((v) => ({ data: v.data, isLoading: true, status: 'loading' }));
    const key = (keys as any).map((k: any) => String(k)).join('-');
    if (!cachePromise[key]) cachePromise[key] = fn(keys);
    cachePromise[key]
      .then((res) => {
        _data({ data: res, isLoading: false, status: 'success' });
      })
      .catch((err) => {
        _data({ data: null, isLoading: false, status: 'error' });
      });
  }, keys as any);
  return data;
};
