import React, { CSSProperties, useEffect, useMemo, useState } from 'react';
import { atom, useRecoilState } from 'recoil';
import { localStorageEffect } from '../libs';

/**
 * Gold Points Balance
 */
export const GamePointBalanceState = atom({
  key: 'GamePointBalanceState',
  default: '',
});

export const ZypherHeaderWalletKeyState = atom({
  key: 'ZypherHeaderWalletKeyState',
  default: 1,
});

export const RechargeGamePointWarnState = atom({
  key: 'RechargeGamePointWarnState',
  default: {} as Record<string, boolean>, // address => boolean
  effects: [localStorageEffect('RechargeGamePointWarnState')],
});
