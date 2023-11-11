import { ConnectButton } from '@rainbow-me/rainbowkit';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { LoadingOutlined, PlusCircleFilled, SyncOutlined } from '@ant-design/icons';
import { useRecoilState } from 'recoil';
import { useAccount, useChainId } from 'wagmi';
import classNames from 'classnames';
import { ethers } from 'ethers';
import { ZypherHeaderWalletKeyState } from './state';
import { ZypherConstants } from './InitZypherConstants';
import { GamePointBuyModal, openGamePointBuyModal } from './GamePointModal';
import { useGamePointBalance } from './hook/GamePointBalance';
import { MobileAccountInfoModal, openMobileAccountInfoModal } from './MobileAccountInfoModal';
import { NumStrFmtDot, fmtNumStr, textMiddleEllipsis } from './libs';

export const ZypherHeader: React.FC<{
  onGPTokenUpdate?: (newVal: bigint) => any;
}> = (props) => {
  const chainId = useChainId();
  const acc = useAccount();
  const [update, setUpdate] = useRecoilState(ZypherHeaderWalletKeyState);
  const [walletKey, setWalletKey] = useState(0);
  const { balance, handler } = useGamePointBalance(chainId, acc.address || ethers.constants.AddressZero);

  /**
   * watch ZypherHeaderWalletKeyState
   */
  useEffect(() => {
    handler.refetch();
    setWalletKey((v) => ++v);
  }, [update]);

  const renderBody: Parameters<(typeof ConnectButton)['Custom']>['0']['children'] = ({ account, openAccountModal, openConnectModal, openChainModal, chain }) => {
    if (!account) return <HeaderButton onClick={openConnectModal}>Connect Wallet</HeaderButton>;
    if (!chain || chain.unsupported) return <HeaderButton onClick={openChainModal}>Wrong network</HeaderButton>;
    const walletLoading = undefined === account.balanceFormatted;
    const loading = handler.isFetching || walletLoading;
    return (
      <div className="bar">
        <div className={classNames('update', { loading })} onClick={() => !loading && setUpdate((v) => ++v)}>
          <SyncOutlined />
        </div>
        <div
          className="balance-item"
          onClick={async () => {
            const recharged = await openGamePointBuyModal();
            if (recharged) setWalletKey((v) => ++v);
          }}
        >
          <PlusCircleFilled className="add" />
          {fmtNumStr(balance, ZypherConstants.GPTokenDecimals)}
          <img src="https://static.zypher.game/crypto/token/GP.png" style={{ borderRadius: 100 }} width={24} height={24} />
        </div>

        {account.balanceFormatted && account.balanceSymbol ? (
          <div className="balance-item chain-token" onClick={openAccountModal}>
            {NumStrFmtDot(account.balanceFormatted, 4)}
            {account.balanceSymbol && <img src={`https://static.zypher.game/crypto/token/${account.balanceSymbol}.svg`} style={{ borderRadius: 100 }} width={24} height={24} />}
          </div>
        ) : (
          <div className="balance-item">
            <LoadingOutlined />
          </div>
        )}

        <div
          className="account"
          onClick={() => {
            if (window.document.body.clientWidth < 750) {
              return openMobileAccountInfoModal();
            }
            openAccountModal();
          }}
        >
          <span>{textMiddleEllipsis(account.address, 6, 4)}</span>
          <img src="https://static.zypher.game/img/avatar/default.png" />
        </div>
        <div className="chain-info" onClick={openChainModal}>
          <div></div>
          <img src={chain.iconUrl} />
        </div>
      </div>
    );
  };
  return (
    <CptStyle>
      <ConnectButton.Custom key={walletKey}>{renderBody}</ConnectButton.Custom>
      <GamePointBuyModal />
      <MobileAccountInfoModal />
    </CptStyle>
  );
};

const CptStyle = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  height: 70px;
  box-sizing: border-box;
  padding: 0 40px;
  @media screen and (max-width: 765px) {
    height: 44px;
    background-color: #131313;
    border-bottom: 1px solid hsla(0, 0%, 100%, 0.1);
    padding: 0 16px;
  }
  > .bar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 20px;
    @media screen and (max-width: 765px) {
      gap: 10px;
    }
    > .update,
    > .balance-item,
    > .account,
    > .chain-info {
      border: 1px solid rgba(90, 90, 90, 0.3);
      border-radius: 24px;
      display: flex;
      gap: 6px;
      justify-content: center;
      align-items: center;
      background-color: rgba(0, 0, 0, 0.5);
      box-shadow: rgba(0, 0, 0, 0.075) 0px 6px 10px;
      height: 40px;
      color: #fff;
      font-family: Poppins;
      font-size: 16px;
      font-style: normal;
      font-weight: 500;
      cursor: pointer;
      transition: all ease 0.2s;
      &:hover {
        opacity: 0.8;
      }
      @media screen and (max-width: 765px) {
        height: 26px;
      }
    }
    > .update {
      width: 40px;
      font-size: 26px;
      &.loading {
        animation: comRotateLoading 1s linear infinite;
        @keyframes comRotateLoading {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      }
      @media screen and (max-width: 765px) {
        font-size: 18px;
        width: 26px;
      }
    }
    > .balance-item {
      padding: 0 8px;
      position: relative;
      min-width: 40px;
      z-index: 1;
      overflow: hidden;
      > .add {
        font-size: 20px;
        color: #6773ff;
      }
      @media screen and (max-width: 765px) {
        font-size: 12px;
        padding: 0 4px;
        > .add {
          font-size: 16px;
        }
        > img {
          width: 20px;
          height: 20px;
        }
        &.chain-token {
          display: none;
        }
      }
    }
    > .account {
      padding-left: 12px;
      > img {
        width: 40px;
        height: 40px;
      }
      @media screen and (max-width: 765px) {
        padding-left: 0;
        > span {
          display: none;
        }
        > img {
          width: 26px;
          height: 26px;
        }
      }
    }
    > .chain-info {
      padding: 0 12px;
      @media screen and (max-width: 765px) {
        display: none;
      }
      > div {
        width: 12px;
        height: 12px;
        border-radius: 10px;
        background-color: #3e7c7e;
        display: flex;
        align-items: center;
        justify-content: center;
        &:before {
          content: ' ';
          display: block;
          background-color: #65edbc;
          width: 6px;
          height: 6px;
          border-radius: 10px;
        }
      }
      > img {
        width: 24px;
        height: 24px;
        border-radius: 100px;
      }
    }
  }
`;

const HeaderButton = styled.div`
  background-color: #6673ff;
  border: 1px solid #6673ff;
  border-radius: 8px;
  height: 38px;
  align-items: center;
  justify-content: center;
  display: flex;
  transition: all 0.3s;
  font-family: Poppins;
  font-weight: 600;
  padding: 0 14px;
  text-align: center;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    background-color: rgba(102, 115, 255, 0.7);
    border: 1px solid rgba(102, 115, 255, 0.7);
  }
`;
