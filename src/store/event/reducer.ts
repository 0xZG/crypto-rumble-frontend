import { CaseReducer, createSlice, PayloadAction } from '@reduxjs/toolkit';
import mitt from 'mitt';

export const appEvent = mitt();

const initialState = {
  None: 0,

  LastSeasonRewarded: 0,
};
export type EventInitialState = typeof initialState;
// type CaseAction<T extends keyof EventInitialState> = CaseReducer<typeof initialState, PayloadAction<EventInitialState[T]>>;
const emit: CaseReducer<typeof initialState, PayloadAction<(keyof EventInitialState)[]>> = (state, action) => {
  action.payload.forEach((key) => {
    state[key] = Date.now();
  });
};

const emitSync: CaseReducer<typeof initialState, PayloadAction<[keyof EventInitialState, null | ((res: any) => any)]>> = (state, action) => {
  const [key, value] = [action.payload[0], Date.now()];
  const evtkey = `${key}-${value}`;
  state[key] = value;
  if (!action.payload[1]) return;
  const watch = (res: any) => {
    action.payload[1]?.(res);
    appEvent.off(evtkey, watch);
  };
  appEvent.on(evtkey, watch);
};

const eventSlice = createSlice({
  name: 'event',
  initialState,
  reducers: {
    emit,
    emitSync,
  },
});

export default eventSlice;
