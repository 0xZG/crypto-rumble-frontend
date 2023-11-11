import { CaseReducer, createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  CoinGeckoPrice: {} as Record<string, number>,
};
type InitialState = typeof initialState;
type CaseAction<T extends keyof InitialState> = CaseReducer<typeof initialState, PayloadAction<InitialState[T]>>;

const setCoinGeckoPrice: CaseAction<'CoinGeckoPrice'> = (state, action) => {
  state.CoinGeckoPrice = action.payload;
};

const Update: CaseReducer<typeof initialState, PayloadAction<Partial<typeof initialState>>> = (state, action) => {
  Object.assign(state, action.payload);
};
const cacheSlice = createSlice({
  name: 'cache',
  initialState,
  reducers: {
    setCoinGeckoPrice,
    Update,
  },
});

export default cacheSlice;
