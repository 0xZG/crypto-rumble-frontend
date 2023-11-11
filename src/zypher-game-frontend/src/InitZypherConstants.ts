export interface GPTokenRechargeItem {
  GP: string;
  Price: string;
  OFF: number;
  index: bigint;
}

export const ZypherConstants = {
  /**
   * https://github.com/zypher-game/bingo-periphery-v1/blob/main/contracts.json
   */
  Contracts: {
    // opBNB Mainnet
    204: {
      GamePointSwap: '0x4C0AB2873aE31146F275C8460EF6240298Fe973c',
      GamePoint: '0xA1d350c642E41cdD17a6dDC5cf9545964a3217f2',
    },
    // Linea
    59144: {
      GamePointSwap: '0x244aF35FDeC6A9A10BD6eA1357bC267bC4Ef6f55',
      GamePoint: '0x6ba3593101E32cEdBDE5AC9439e9187736B26A15',
    },

    // opbnb-testnet
    5611: {
      GamePointSwap: '0x66ACa3e3ecEb622A0239B8a1Bb52f1E86a5E81ca',
      GamePoint: '0xc2E571531AB5A353534b73D15c187E78DD57dCA9',
    },
    // linea-goerli
    59140: {
      GamePointSwap: '0x3B5b13A1Edb63489c35d588E8259AF7C5c6165fB',
      GamePoint: '0x5275A8593ce6a967Ae6782a70F417135A44bCd27',
    },
    // mantle-testnet
    5001: {
      GamePointSwap: '0x2657154854e0D2eE700fE75e85c6251A85E4a7e6',
      GamePoint: '0x9CCC1463f90782c5Cb3F39E2Cb92c670e894c1EB',
    },
    // scroll-sepolia
    534351: {
      GamePointSwap: '0xF0d88e2A087de09a1a0914B847dc336edA0851BB',
      GamePoint: '0x13a676B348749b30c00b72b018396cda07BB9201',
    },
    // combo
    91715: {
      GamePointSwap: '0x0B312421e03857869b4D1a458FDa066909f25d9C',
      GamePoint: '0x747b7713FA26ab925396DEC3037be6Cec9063493',
    },
  } as Record<number, undefined | { GamePointSwap: `0x${string}`; GamePoint: `0x${string}` }>,

  // default: 0x0
  RechargeLogContracts: {} as Record<number, `0x${string}`>,
  GPTokenDecimals: 18,
};

export const InitZypherConstants = (options: Partial<typeof ZypherConstants>) => {
  Object.assign(ZypherConstants, options);
};
