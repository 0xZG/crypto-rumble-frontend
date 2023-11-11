import { lineaTestnet, mantleTestnet, opBNBTestnet, polygonZkEvmTestnet, scrollSepolia } from 'wagmi/chains';
import { createWalletClient, http, defineChain } from 'viem';
import { ethers } from 'ethers';
import { CryptoRumble } from '_src/abi-types/CryptoRumble';
import { GameHub } from '_src/abi-types/GameHub';
import { address } from '_src/types/CryptoGame';
import AppConstants from './Constant';

// https://www.multicall3.com/deployments
(mantleTestnet as any).contracts = {
  multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11', blockCreated: 561333 },
};

export const ComboTestnet = defineChain({
  id: 91715,
  name: 'Combo Testnet',
  network: 'Combo Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'tcBNB', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://test-rpc.combonetwork.io'] },
    public: { http: ['https://test-rpc.combonetwork.io'] },
  },
  blockExplorers: {
    default: { name: 'Nodereal', url: 'https://combotrace-testnet.nodereal.io' },
    nodereal: { name: 'Nodereal', url: 'https://combotrace-testnet.nodereal.io' },
  },
  contracts: { multicall3: { address: '0x4961661f732e995133fDAa7881481BB10e424f78', blockCreated: 16142835 } },
  testnet: true,
});

export const SupportNetworks = [opBNBTestnet, ComboTestnet];
export const ChainInfo = {
  [opBNBTestnet.id]: {
    MaxProofPerTx: AppConstants.CryptoRumbleProofPerTx,
    MaxProofPerTxChainLimit: 5,
    FreeSteps: 30,
    MaxStepPerProof: 30,
    BASE_GF_URL: 'https://opbnb-testnet-graph.zypher.game/subgraphs/name/opbnb/game2048',
    Contracts: {
      CryptoRumble: '0x0Aa4135c7FD955A1421A238343D506Ff4BF656EC' as address,
      GameHub: '0x81186bD20f466c50D71B990B2a59621B020C7d9A' as address,
      GPToken: '0xc2E571531AB5A353534b73D15c187E78DD57dCA9' as address,
    },
  },
  // [scrollSepolia.id]: {
  //   BASE_GF_URL: 'https://scroll-sepolia-graph.zypher.game/subgraphs/name/scroll/game2048',
  //   MaxProofPerTx: 1,
  //   MaxProofPerTxChainLimit: 1,
  //   FreeSteps: 30,
  //   MaxStepPerProof: 30,
  //   Contracts: {
  //     CryptoRumble: '0x4890a4C54aA8b9b0Ef55B72fdeC1c54897CfC58d' as address,
  //     GameHub: '0x004130276735901Aa3D5Fa9e87DAC8c435b9d24d' as address,
  //     GPToken: '0x13a676B348749b30c00b72b018396cda07BB9201' as address,
  //   },
  // },
  // [lineaTestnet.id]: {
  //   BASE_GF_URL: 'https://linea-goerli-graph.zypher.game/subgraphs/name/linea/game2048',
  //   MaxProofPerTx: 2,
  //   MaxProofPerTxChainLimit: 2,
  //   FreeSteps: 30,
  //   MaxStepPerProof: 30,
  //   Contracts: {
  //     CryptoRumble: '0x4890a4C54aA8b9b0Ef55B72fdeC1c54897CfC58d' as address,
  //     GameHub: '0x004130276735901Aa3D5Fa9e87DAC8c435b9d24d' as address,
  //     GPToken: '0x5275A8593ce6a967Ae6782a70F417135A44bCd27' as address,
  //   },
  // },
  // [mantleTestnet.id]: {
  //   BASE_GF_URL: 'https://mantle-testnet-graph.zypher.game/subgraphs/name/mantle/game2048',
  //   MaxProofPerTx: 2,
  //   MaxProofPerTxChainLimit: 3,
  //   FreeSteps: 30,
  //   MaxStepPerProof: 30,
  //   Contracts: {
  //     CryptoRumble: '0x4890a4C54aA8b9b0Ef55B72fdeC1c54897CfC58d' as address,
  //     GameHub: '0x004130276735901Aa3D5Fa9e87DAC8c435b9d24d' as address,
  //     GPToken: '0x9CCC1463f90782c5Cb3F39E2Cb92c670e894c1EB' as address,
  //   },
  // },
  [ComboTestnet.id]: {
    BASE_GF_URL: 'http://combo-testnet-graph.zypher.game/subgraphs/name/combo/game2048',
    MaxProofPerTx: 2,
    MaxProofPerTxChainLimit: 3,
    FreeSteps: 30,
    MaxStepPerProof: 30,
    Contracts: {
      CryptoRumble: '0x4890a4C54aA8b9b0Ef55B72fdeC1c54897CfC58d' as address,
      GameHub: '0x004130276735901Aa3D5Fa9e87DAC8c435b9d24d' as address,
      GPToken: '0x747b7713FA26ab925396DEC3037be6Cec9063493' as address,
    },
  },
} as const;

SupportNetworks.forEach((chain) => {
  (chain as any).iconUrl = `https://static.zypher.game/crypto/chain/${chain.id}.svg`;
});
export const SupportNetworkIds = SupportNetworks.map((i) => i.id);
export type SupportChainIds = (typeof SupportNetworkIds)[number];
export function IsSupportNetworkId(chainId: number): chainId is SupportChainIds {
  return SupportNetworkIds.includes(chainId as any);
}

export const ContractsAbi = { GPToken: CryptoRumble, CryptoRumble, GameHub };
