import { useAppSelector } from '_src/store/hooks';
import { decryptedZkAccount } from '_src/utils/zkAccount';
import { ethers } from 'ethers';
import { useMemo } from 'react';
import { useAccount } from 'wagmi';

// export const useZkSigner = () => {
//   const acc = useAccount();
//   const zkAccount = useAppSelector((s) => s.cache.zkAccount?.[acc.address || '']);
//   const chain = useAppSelector((s) => s.game.Chain);

//   return useMemo(() => {
//     console.log('useZkSigner');
//     if (!zkAccount) return null;
//     const zka = decryptedZkAccount(zkAccount);
//     const provider = new ethers.providers.JsonRpcProvider(chain.rpc);
//     return zka.connect(provider);
//   }, [zkAccount, chain]);
// };
