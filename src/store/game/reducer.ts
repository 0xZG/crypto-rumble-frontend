import { CaseReducer, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChainInfo, SupportNetworks } from '_src/constants/Contracts';
import { ethers } from 'ethers';
import { defaultCryptoRumbleGame, ICryptoRumbleGame } from '_src/types/CryptoGame';

const initialState = {
  Chain: SupportNetworks[0],

  GameCR: defaultCryptoRumbleGame,
  AI: false,
};
export type GameInitialState = typeof initialState;

const Update: CaseReducer<typeof initialState, PayloadAction<Partial<typeof initialState>>> = (state, action) => {
  Object.assign(state, action.payload);
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    Update,
  },
});
export default gameSlice;
