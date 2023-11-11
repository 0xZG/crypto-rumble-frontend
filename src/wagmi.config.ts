import { lineaTestnet, mantleTestnet, opBNBTestnet, polygonZkEvmTestnet, scrollSepolia } from 'wagmi/chains';
import { configureChains, createConfig } from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { publicProvider } from 'wagmi/providers/public';
import { MockConnector } from '@wagmi/core/connectors/mock';
import { createWalletClient, http, defineChain } from 'viem';
import { ethers } from 'ethers';
import { privateKeyToAccount } from 'viem/accounts';
import { bitgetWallet, metaMaskWallet, okxWallet, tokenPocketWallet, walletConnectWallet } from '@rainbow-me/rainbowkit/wallets';
import { Chain, connectorsForWallets } from '@rainbow-me/rainbowkit';
import { SupportNetworks } from './constants/Contracts';

const { chains, publicClient, webSocketPublicClient } = configureChains(SupportNetworks, [publicProvider()]);
const projectId = 'bc467c124a7a7a8ce06a41ef40b1b842';

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [metaMaskWallet({ projectId, chains }), walletConnectWallet({ projectId, chains })],
  },
  {
    groupName: 'More',
    wallets: [bitgetWallet({ projectId, chains }), okxWallet({ projectId, chains }), tokenPocketWallet({ projectId, chains })],
  },
]);
export { chains };
export const wagmiClient = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
  connectors,
  // connectors: [
  //   // new MockConnector({
  //   //   chains,
  //   //   options: {
  //   //     walletClient: createWalletClient({
  //   //       account: privateKeyToAccount(ethers.Wallet.fromMnemonic(''.replace(/-/g, ' ')).privateKey as `0x${string}`),
  //   //       transport: http(opBNBTestnet.rpcUrls.default.http[0]),
  //   //       chain: opBNBTestnet,
  //   //     }),
  //   //   },
  //   // }),
  //   new MetaMaskConnector({
  //     chains,
  //     options: {
  //       shimDisconnect: true,
  //     },
  //   }),
  // ],
});
