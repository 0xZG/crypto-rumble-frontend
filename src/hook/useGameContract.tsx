import { IsSupportNetworkId } from '_src/constants/Contracts';
import { WagmiWalletHandler } from '_src/lib/wagmiWalletHandler';
import { useMemo } from 'react';
import { useWalletClient } from 'wagmi';

export function useWalletHandler() {
  const wc = useWalletClient();
  return useMemo(() => {
    const walletClient = wc.data;
    if (!walletClient) return null;
    if (!IsSupportNetworkId(walletClient.chain.id)) return null;
    return new WagmiWalletHandler(walletClient);
  }, [wc.data]);
}
