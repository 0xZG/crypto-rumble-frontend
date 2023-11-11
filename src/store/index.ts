import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query/react';
import { load, save } from 'redux-localstorage-simple';
import cacheSlice from './cache/reducer';
import eventSlice from './event/reducer';
import chooseSlice from './choose/reducer';
import userSlice from './user/reducer';
import gameSlice from './game/reducer';

const PERSISTED_KEYS: string[] = ['user', 'cache'];

const appKey = `2048`;

const AppStore = configureStore({
  reducer: {
    user: userSlice.reducer,
    event: eventSlice.reducer,
    cache: cacheSlice.reducer,
    choose: chooseSlice.reducer,
    game: gameSlice.reducer,
  },
  middleware: (gdm) =>
    gdm({
      thunk: true,
      serializableCheck: {
        ignoredActions: ['event/emitSync'],
      },
    }).concat(save({ namespace: appKey, states: PERSISTED_KEYS, debounce: 1000 })),
  preloadedState: load({ namespace: appKey, states: PERSISTED_KEYS }),
});

setupListeners(AppStore.dispatch);
// AppStore.dispatch(userSlice.actions.initJwtInfo({}));

export default AppStore;

export type AppState = ReturnType<typeof AppStore.getState>;
export type AppDispatch = typeof AppStore.dispatch;
