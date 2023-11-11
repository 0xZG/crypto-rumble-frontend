import { CaseReducer, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ethers } from 'ethers';

export interface ERC20ApproveConfirmParams {
  ERC20: `0x${string}`;
  Decimals: number;
  Amount: ethers.BigNumber;
  To: `0x${string}`;
  Name: string;
  resolve?: (value: any) => any;
  reject?: () => any;
}

const initialState = {
  modalSessions: false,
  modalHow2Play: false,
  modalGameStart: false,
  modalGameUpdate: false,
  modalGameResultId: '',
  modalGameResultIdOption: { gt256Must: false },
  modalGameSeasonReward: false,
  modalGamePlaybackId: '',

  modalERC20ApproveConfirm: null as null | ERC20ApproveConfirmParams,

  // modalRaise: null as null | FeTableStatusStruct,
};
export type ChooseInitialState = typeof initialState;

const Update: CaseReducer<typeof initialState, PayloadAction<Partial<typeof initialState>>> = (state, action) => {
  Object.assign(state, action.payload);
};

const chooseSlice = createSlice({
  name: 'choose',
  initialState,
  reducers: {
    Update,
  },
});

export default chooseSlice;
