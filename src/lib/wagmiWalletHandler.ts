import { GetPublicClientResult, GetWalletClientResult, getContract, getPublicClient, waitForTransaction } from 'wagmi/actions';
import { Abi } from 'viem';
import { PublicClient } from 'wagmi';
import { ChainInfo, ContractsAbi, SupportChainIds } from '_src/constants/Contracts';
import { sleep } from '_src/utils';
import { hash } from '_src/types/CryptoGame';

type Contracts = (typeof ChainInfo)[SupportChainIds]['Contracts'];

export class WagmiWalletHandler {
  walletClient: NonNullable<GetWalletClientResult>;

  publicClient: GetPublicClientResult<PublicClient>;

  chainId: SupportChainIds;

  constructor(walletClient: NonNullable<GetWalletClientResult>) {
    this.chainId = walletClient.chain.id as SupportChainIds;
    this.walletClient = walletClient;
    this.publicClient = getPublicClient({ chainId: this.chainId });
  }

  at<T extends Abi>(abi: T, address: `0x${string}`) {
    return getContract({ address, abi, chainId: this.chainId, walletClient: this.walletClient });
  }

  of<T extends keyof Contracts>(name: T, address?: `0x${string}`) {
    address = address || ChainInfo[this.chainId].Contracts[name];
    const abi = ContractsAbi[name];
    return this.at(abi, address);
  }

  async write(args: Parameters<NonNullable<GetWalletClientResult>['writeContract']>[0], confirmations = 1, timeout = 0) {
    const hash = await this.walletClient.writeContract(args);
    const receipt = await this.wait(hash, confirmations, timeout);
    return { hash, receipt };
  }

  wait(hash: hash, confirmations = 1, timeout = 0) {
    return waitForTransaction({ chainId: this.chainId, hash, confirmations, timeout });
  }

  async waitReceeipt(hash: hash, times = 100) {
    let rec = await this.publicClient.getTransactionReceipt({ hash }).catch((e) => Promise.resolve(null));
    while (!rec && times > 0) {
      rec = await this.publicClient.getTransactionReceipt({ hash }).catch((e) => Promise.resolve(null));
      await sleep(1000);
    }
    return rec;
  }
}
