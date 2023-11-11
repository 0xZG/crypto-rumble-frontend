import { CloseOutlined, LoadingOutlined } from '@ant-design/icons';
import { Modal, message, notification } from 'antd';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAccount, useContractReads, useNetwork, useWalletClient } from 'wagmi';
import classNames from 'classnames';
import { useRecoilState } from 'recoil';
import { getContract, waitForTransaction } from '@wagmi/core';
import { ethers } from 'ethers';
import { GPTokenRechargeItem, ZypherConstants } from './InitZypherConstants';
import { RechargeGamePointWarnState } from './state';
import { NumStrFmtDot, errorParse, fmtNumStr } from './libs';
import { useGamePointBalance } from './hook/GamePointBalance';

let setModalOpen: React.Dispatch<React.SetStateAction<boolean>> | null = null;
let lastResolve: (value: boolean | PromiseLike<boolean>) => void;

export const openGamePointBuyModal = async () => {
  return new Promise<boolean>((resolve, reject) => {
    if (!setModalOpen) return reject(new Error('un mounted'));
    lastResolve = resolve;
    setModalOpen(true);
  });
};

export const closeGamePointBuyModal = (updated: boolean) => {
  if (!setModalOpen) throw new Error('un mounted');
  setModalOpen(false);
  // if (!lastResolve) throw new Error('not lastResolve');
  lastResolve?.(updated);
};

export const GamePointBuyModal: React.FC<{}> = (props) => {
  const [modalOpen, temp] = useState(false);
  useEffect(() => {
    setModalOpen = temp;
    return () => {
      setModalOpen = null;
    };
  }, []);

  if (!modalOpen) return null;
  return <GamePointBuyModalContent />;
};
const zero2ModalStyles: Parameters<typeof Modal>['0']['styles'] = {
  mask: {
    backdropFilter: 'blur(3px)',
    WebkitBackdropFilter: 'blur(3px)',
  },
};
const ModalStyle: React.CSSProperties = { pointerEvents: 'inherit' };

const GPABI = [
  {
    inputs: [
      { internalType: 'address', name: 'lobby_', type: 'address' },
      { internalType: 'uint256', name: 'infoIndex_', type: 'uint256' },
    ],
    name: 'nativeSwap',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'swapInfos',
    outputs: [
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'uint256', name: 'discount', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'swapRatios',
    outputs: [
      { internalType: 'uint8', name: 'decimals', type: 'uint8' },
      { internalType: 'uint256', name: 'ratio', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
const NATIVE_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

const GamePointBuyModalContent: React.FC<{}> = (props) => {
  const network = useNetwork();
  const walletClient = useWalletClient();
  const chain = network.chain;
  const acc = useAccount();
  const [checkData, setChackData] = useRecoilState(RechargeGamePointWarnState);
  const [choose, setChoose] = useState<null | GPTokenRechargeItem>(null);
  const [loading, setLoading] = useState(false);
  const { balance, setBalance, handler } = useGamePointBalance(chain?.id || -1, acc.address || ethers.constants.AddressZero);
  const [hasSuccess, setHasSuccess] = useState(false);

  const Contracts = ZypherConstants.Contracts[chain?.id || -1];
  const GamePointSwapAddress = Contracts?.GamePointSwap || '0x';
  const infos = useContractReads({
    contracts: [
      { address: GamePointSwapAddress, abi: GPABI, functionName: 'swapInfos', args: [1n] },
      { address: GamePointSwapAddress, abi: GPABI, functionName: 'swapInfos', args: [2n] },
      { address: GamePointSwapAddress, abi: GPABI, functionName: 'swapInfos', args: [3n] },
      { address: GamePointSwapAddress, abi: GPABI, functionName: 'swapInfos', args: [4n] },
      { address: GamePointSwapAddress, abi: GPABI, functionName: 'swapInfos', args: [5n] },
      { address: GamePointSwapAddress, abi: GPABI, functionName: 'swapInfos', args: [6n] },
      { address: GamePointSwapAddress, abi: GPABI, functionName: 'swapInfos', args: [7n] },
      { address: GamePointSwapAddress, abi: GPABI, functionName: 'swapInfos', args: [8n] },
      { address: GamePointSwapAddress, abi: GPABI, functionName: 'swapRatios', args: [NATIVE_ADDRESS] },
    ],
    enabled: Boolean(Contracts?.GamePointSwap),
    scopeKey: `GamePointSwap:${Contracts?.GamePointSwap},${chain?.id}`,
    allowFailure: false,
    select(data) {
      if (!data) return null;
      const swapRatios = data[8];
      return new Array(8).fill(0).map((_, i) => {
        const val = data[i as 1];
        const originalNeed = (val[0] * 10n ** BigInt(swapRatios[0])) / swapRatios[1];
        const Price = (originalNeed * val[1]) / 100n;
        return {
          GP: fmtNumStr(val[0], ZypherConstants.GPTokenDecimals),
          Price: fmtNumStr(Price, swapRatios[0], { fixedMax: 4, useMT: false }),
          OFF: Number(100n - val[1]),
          index: BigInt(i + 1),
        };
      });
    },
  });

  if (!chain) return null;
  if (chain.unsupported) return null;
  if (!acc.address) return null;
  // const ItemList = ZypherConstants.GPTokenRecharge[chain.id];
  // if (!ItemList) return null;
  const checked = checkData?.[acc.address];

  const submit = async (item: GPTokenRechargeItem) => {
    if (!walletClient.data) return;
    setLoading(true);
    try {
      const Contracts = ZypherConstants.Contracts[chain.id];
      if (!Contracts) throw new Error(`unsupport chainId(${chain.id})`);
      const gp = getContract({ address: Contracts.GamePointSwap, abi: GPABI, chainId: chain.id, walletClient: walletClient.data });
      const from = ZypherConstants.RechargeLogContracts[chain.id] || ethers.constants.AddressZero;
      const es = await gp.simulate.nativeSwap([from, item.index], {
        value: ethers.utils.parseUnits(item.Price, walletClient.data.chain.nativeCurrency.decimals).toBigInt(),
        account: walletClient.data.account.address,
      });
      const hash = await walletClient.data.writeContract(es.request);
      await waitForTransaction({ hash, chainId: chain.id });
      message.success('Recharge successful');
      handler.refetch();
      setChoose(null);
      setHasSuccess(true);
      closeGamePointBuyModal(true);
    } catch (err: any) {
      notification.error({ message: 'Recharge Points', description: errorParse(err) });
    } finally {
      setLoading(false);
    }
  };
  const renderBody = () => {
    if (loading) {
      return (
        <div className="loading">
          <LoadingOutlined className="LoadingOutlined" />
          Confirming the Transaction
        </div>
      );
    }
    if (choose) {
      return (
        <div className="tips">
          <p>💡Discover Zypher&apos;s core with $Gold Points! Essential to our ecosystem, $GP bridges NFTs, in-game assets, and offers a unified gaming experience. Please note:</p>
          <p>
            <em />
            <i>Once purchased, $GP is non-refundable.</i>
            <br />
            <em />
            <i>$GP cannot be transferred to another player&apos;s account.</i>
          </p>
          <p>📘 For more on $GP&apos;s utility, please refer to this section.</p>
          <p
            className="check"
            onClick={() => {
              setChackData((v) => {
                return { ...v, [acc.address!]: !checked };
              });
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="12" height="12" stroke="white" strokeWidth="2" />
              {checked ? (
                <path
                  d="M14 2.18182C14 2.18182 11.92 2.90909 9.49333 5.81818C7.24 8.45455 6.72 9.54545 5.85333 11C5.76667 10.9091 4.46667 8.27273 1 6.36364L2.82 4.54545C2.82 4.54545 4.46667 5.72727 5.59333 7.90909C5.59333 7.90909 8.45333 3.27273 14 1V2.18182Z"
                  fill="#65EDBC"
                />
              ) : null}
            </svg>
            Don&apos;t show this reminder anymore.
          </p>
          <div className="submit" onClick={() => submit(choose)}>
            Ok
          </div>
        </div>
      );
    }
    return (
      <div className="body">
        <div className="balance">
          Balance: <span>{fmtNumStr(balance, ZypherConstants.GPTokenDecimals)}</span>
          <img src="https://static.zypher.game/crypto/token/GP.png" style={{ borderRadius: 100 }} width={20} height={20} />
        </div>
        <div className="items">
          {infos.data?.map((item, index) => (
            <div
              className={classNames('item', { off: Boolean(item.OFF) })}
              key={item.GP}
              onClick={() => {
                if (choose) return;
                if (checked) {
                  submit(item);
                } else {
                  setChoose(item);
                }
              }}
            >
              <div className="val">{item.GP}</div>
              <img src={`https://static.zypher.game/img/points/points_${Number(item.index)}.png`} width="70%" />
              <div className="price">
                {NumStrFmtDot(item.Price, 4)}
                <img src={`https://static.zypher.game/crypto/token/${chain.nativeCurrency.symbol}.svg`} style={{ borderRadius: 100 }} width={16} height={16} />
              </div>
              <div className="off-img">
                <img src="https://static.zypher.game/img/points/discord.svg" />
                <div>
                  {item.OFF}%<br />
                  OFF
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  return (
    <Modal
      width={604}
      open
      style={ModalStyle}
      styles={zero2ModalStyles}
      modalRender={() => (
        <CptStyle>
          <div className="title">
            Recharge Points
            {!loading && (
              <CloseOutlined
                onClick={() => {
                  if (choose) return setChoose(null);
                  closeGamePointBuyModal(hasSuccess);
                }}
                className="close"
              />
            )}
          </div>
          {renderBody()}
        </CptStyle>
      )}
      footer={null}
      centered
    />
  );
};

const CptStyle = styled.div`
  font-family: Poppins;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #131313;
  z-index: 1;
  position: relative;
  min-height: 504px;
  @media screen and (max-width: 604px) {
    width: 100vw;
    margin-left: -16px;
    box-sizing: border-box;
  }
  > .title {
    align-items: center;
    border-radius: 20px 20px 0px 0px;
    background: rgba(255, 255, 255, 0.04);
    display: flex;
    height: 62px;
    justify-content: space-between;
    padding: 20px 32px;
    position: relative;
    color: #fff;
    font-size: 16px;
    justify-content: center;
    font-weight: 500;
    position: relative;
    > .close {
      position: absolute;
      right: 20px;
      top: 18px;
      font-size: 24px;
      cursor: pointer;
    }
  }
  > .loading {
    display: flex;
    color: rgba(255, 255, 255, 0.6);
    font-family: Poppins;
    font-size: 14px;
    font-weight: 500;
    flex-direction: column;
    gap: 64px;
    align-items: center;
    justify-content: center;
    height: 400px;
    > .LoadingOutlined {
      font-size: 64px;
    }
  }
  > .tips {
    padding: 30px 40px 40px;
    color: #fff;
    @media screen and (max-width: 604px) {
      padding: 30px 16px 20px;
    }
    > .submit {
      width: 100%;
      height: 48px;
      border-radius: 12px;
      background: #6673ff;
      color: #fff;
      font-size: 16px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      user-select: none;
    }
    p {
      font-size: 14px;
      font-weight: 400;
      line-height: 24px;
      margin-bottom: 30px;
      i {
        font-style: normal;
      }
      &.check {
        align-items: center;
        display: flex;
        gap: 8px;
        cursor: pointer;
        user-select: none;
      }
    }
    em {
      background-color: #fff;
      border-radius: 50%;
      display: inline-block;
      height: 4px;
      margin-right: 8px;
      margin-top: 10px;
      vertical-align: top;
      width: 4px;
    }
  }
  > .body {
    padding: 20px;
    min-height: 400px;
    @media screen and (max-width: 604px) {
      padding: 20px 4px;
    }
    > .balance {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      color: rgba(255, 255, 255, 0.6);
      gap: 4px;
      > span {
        color: rgba(255, 255, 255, 1);
      }
    }
    > .items {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-evenly;
      padding: 20px 0;
      gap: 24px 4px;
      > .item {
        width: 120px;
        height: 160px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background-color: rgba(255, 255, 255, 0.04);
        position: relative;
        cursor: pointer;

        transition: all ease 0.2s;
        &:hover {
          transform: scale(1.05);
        }
        > .off-img {
          position: absolute;
          right: -28px;
          top: -20px;
          display: none;
          transform: rotate(31deg);
          > img {
            display: block;
          }
          > div {
            position: absolute;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            z-index: 2;
            color: #fff;
            font-size: 14px;
            line-height: 11px;
            top: 0;
            left: 0;
            text-align: center;
          }
        }

        > .val {
          color: #f5a027;
          text-align: center;
          font-size: 14px;
          font-weight: 400;
          padding: 20px 0;
          position: absolute;
          width: 100%;
        }
        > img {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          margin: auto;
        }
        > .price {
          height: 30px;
          border-radius: 0px 0px 9px 9px;
          background: #6673ff;
          width: 100%;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          position: absolute;
          bottom: 0;
        }
        &.off {
          > .price {
            background-color: #ff5751;
          }
          > .off-img {
            display: block;
          }
        }
        @media screen and (max-width: 604px) {
          width: 110px;
          height: 140px;
          > .val {
            padding: 10px 0;
          }
        }
      }
    }
  }
`;
