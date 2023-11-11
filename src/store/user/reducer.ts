import { createSlice } from '@reduxjs/toolkit';

const initialState = {};

// const setInfo: CaseReducer<typeof initialState, PayloadAction<[string, (typeof initialState)['info']['']]>> = (state, action) => {
//   if (!state.info) state.info = {};
//   state.info[action.payload[0]] = action.payload[1];
// };

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // updateJwtInfo,
    // initJwtInfo,
    // setRef,
    // setInfo,
  },
});
export default userSlice;
