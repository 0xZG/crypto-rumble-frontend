import { useEffect, useState } from 'react';

export const useTimedown = (end: number) => {
  // const [now, _now] = useState(() => Date.now());
  const [res, _res] = useState('');

  useEffect(() => {
    let running = true;
    const update = () => {
      if (!running) return;
      const now = Date.now();
      const diff = Math.max(0, end - now);
      _res(fmtTime(diff));
      if (diff === 0) return;
      requestAnimationFrame(update);
    };
    update();
    return () => {
      running = false;
    };
  }, [end]);

  return res;
};

const dayTime = 3600 * 24;
function fmtTime(time: number) {
  const diff = Math.max(0, time);
  const res = Math.floor(diff / 1000);
  const dd = Math.floor(res / dayTime).toString();
  const hh = Math.floor((res / 3600) % 24)
    .toString()
    .padStart(2, '0');
  const mm = (Math.floor(res / 60) % 60).toString().padStart(2, '0');
  const ss = (res % 60).toString().padStart(2, '0');
  const result = [hh, mm, ss].join(':');
  if (dd !== '0') return `${dd}d ${result}`;
  return result;
}
