import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { erc20ABI, useContractReads } from 'wagmi';
import { GamePointBalanceState } from '../state';
import { ZypherConstants } from '../InitZypherConstants';

export const useGamePointBalance = (chainId: number, address: `0x${string}`) => {
  const [balance, setBalance] = useRecoilState(GamePointBalanceState);
  const Contracts = ZypherConstants.Contracts[chainId];
  const handler = useContractReads({
    contracts: [{ address: Contracts?.GamePoint, abi: erc20ABI, functionName: 'balanceOf', args: [address] }],
    enabled: Boolean(Contracts?.GamePoint && address),
    scopeKey: `GamePointBalance:${Contracts?.GamePoint},${chainId},${address}`,
    allowFailure: false,
    select(data) {
      if (!data) return null;
      return {
        balanceOf: data[0] || BigInt(0),
      };
    },
  });

  useEffect(() => {
    console.log('GamePointBalance balanceOf');
    if (!handler.data) return;
    setBalance(handler.data?.balanceOf.toString());
  }, [handler.data?.balanceOf]);

  return { balance, setBalance, handler };
};
