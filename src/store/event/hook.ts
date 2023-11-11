import { useCallback, useEffect, useState } from 'react';
import { GlobalVar } from '_src/constants/Constant';
import { useAppSelector } from '../hooks';
import eventSlice, { EventInitialState, appEvent } from './reducer';

export const useEvent = (event: keyof EventInitialState, fn: (key: number) => any) => {
  const state = useAppSelector((s) => s.event[event]);
  const [initState] = useState(state);
  useEffect(() => {
    if (initState === state) return;
    console.log('useEvent', event, state);
    const req = fn(state);
    if (req instanceof Promise) {
      req
        .then((res) => {
          appEvent.emit(`${event}-${state}`, res);
        })
        .catch((e) => {
          appEvent.emit(`${event}-${state}`, null);
        });
    } else {
      appEvent.emit(`${event}-${state}`, req);
    }
  }, [state]);
  return null;
};

export const emitAppEvent = (event: keyof EventInitialState, awaitIt = false) => {
  if (!awaitIt) {
    GlobalVar.dispatch(eventSlice.actions.emitSync([event, null]));
    return;
  }
  return new Promise((resolve) => {
    GlobalVar.dispatch(eventSlice.actions.emitSync([event, resolve]));
  });
};
