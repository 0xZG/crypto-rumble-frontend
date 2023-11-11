import { CloseOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAccount, useDisconnect, useNetwork } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ethers } from 'ethers';
import { ZypherConstants } from './InitZypherConstants';
import { useGamePointBalance } from './hook/GamePointBalance';
import { NumStrFmtDot, fmtNumStr, textMiddleEllipsis } from './libs';

let setModalOpen: React.Dispatch<React.SetStateAction<boolean>> | null = null;
let lastResolve: (value: boolean | PromiseLike<boolean>) => void;

export const openMobileAccountInfoModal = async () => {
  return new Promise<boolean>((resolve, reject) => {
    if (!setModalOpen) return reject(new Error('un mounted'));
    lastResolve = resolve;
    setModalOpen(true);
  });
};

export const closeMobileAccountInfoModal = (updated: boolean) => {
  if (!setModalOpen) throw new Error('un mounted');
  setModalOpen(false);
  // if (!lastResolve) throw new Error('not lastResolve');
  lastResolve?.(updated);
};

export const MobileAccountInfoModal: React.FC<{}> = (props) => {
  const [modalOpen, temp] = useState(false);
  useEffect(() => {
    setModalOpen = temp;
    return () => {
      setModalOpen = null;
    };
  }, []);

  if (!modalOpen) return null;
  return <MobileAccountInfoModalContent />;
};
const zero2ModalStyles: Parameters<typeof Modal>['0']['styles'] = {
  mask: {
    backdropFilter: 'blur(3px)',
    WebkitBackdropFilter: 'blur(3px)',
  },
};
const ModalStyle: React.CSSProperties = {
  pointerEvents: 'inherit',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  top: 'auto',
  height: '100vh',
  paddingBottom: 0,
  width: '100vw',
  margin: 0,
  maxWidth: '100vw',
};

const MobileAccountInfoModalContent: React.FC<{}> = (props) => {
  const network = useNetwork();
  const chain = network.chain;
  const acc = useAccount();
  const disconnect = useDisconnect();
  const { balance, setBalance, handler } = useGamePointBalance(chain?.id || -1, acc.address || ethers.constants.AddressZero);
  const [hasSuccess, setHasSuccess] = useState(false);

  const renderBody: Parameters<(typeof ConnectButton)['Custom']>['0']['children'] = ({ account, openChainModal, chain }) => {
    if (!account) return;
    if (!chain) return null;
    return (
      <div className="bar">
        <div className="chain-info" onClick={openChainModal}>
          <img src={chain.iconUrl} />
          {chain.name}
          <div className="right"></div>
        </div>

        <div className="account-info">
          <div className="acc-title">Your Wallet</div>
          <div className="account">
            <img src="https://static.zypher.game/img/avatar/default.png" />
            <span>{textMiddleEllipsis(account.address, 6, 4)}</span>
            <div
              className="right"
              onClick={() => {
                disconnect.disconnectAsync?.();
                closeMobileAccountInfoModal(false);
              }}
            >
              Disconnect
            </div>
          </div>

          <div className="balance-item">
            <img src="https://static.zypher.game/crypto/token/GP.png" style={{ borderRadius: 100 }} width={24} height={24} />
            Gold Points
            <div className="right">{fmtNumStr(balance, ZypherConstants.GPTokenDecimals)}</div>
          </div>

          <div className="balance-item chain-token">
            {account.balanceSymbol && <img src={`https://static.zypher.game/crypto/token/${account.balanceSymbol}.svg`} style={{ borderRadius: 100 }} width={24} height={24} />}
            {account.balanceSymbol}
            <div className="right">{NumStrFmtDot(account.balanceFormatted, 4)}</div>
          </div>
        </div>
      </div>
    );
  };
  return (
    <Modal
      width="100vw"
      footer={null}
      open
      transitionName=""
      style={ModalStyle}
      styles={zero2ModalStyles}
      modalRender={() => (
        <CptStyle>
          <div className="title">
            Your Wallet
            <CloseOutlined onClick={() => closeMobileAccountInfoModal(hasSuccess)} className="close" />
          </div>
          <ConnectButton.Custom>{renderBody}</ConnectButton.Custom>
        </CptStyle>
      )}
    />
  );
};

const CptStyle = styled.div`
  font-family: Poppins;
  border-radius: 20px 20px 0 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #131313;
  z-index: 1;
  position: relative;
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

  > .bar {
    padding: 20px 20px 40px;
    color: #fff;
    font-size: 16px;
    > .chain-info {
      border: 1px solid hsla(0, 0%, 100%, 0.1);
      border-radius: 10px;
      margin-bottom: 16px;
      padding: 16px;
      display: flex;
      gap: 10px;
      align-items: center;
      position: relative;
      cursor: pointer;

      > img {
        width: 24px;
        height: 24px;
      }
      > .right {
        width: 12px;
        height: 12px;
        border-radius: 10px;
        background-color: #3e7c7e;
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        right: 16px;
        &:before {
          content: ' ';
          display: block;
          background-color: #65edbc;
          width: 6px;
          height: 6px;
          border-radius: 10px;
        }
      }
    }

    > .account-info {
      border: 1px solid hsla(0, 0%, 100%, 0.1);
      border-radius: 10px;
      margin-bottom: 16px;
      padding: 16px;
      > div > .right {
        position: absolute;
        right: 0;
      }
      > .acc-title {
        color: #5f5d77;
        font-size: 14px;
        line-height: 16px;
      }
      > .account {
        padding: 12px 0px;
        border-bottom: 1px solid hsla(0, 0%, 100%, 0.1);
        display: flex;
        gap: 10px;
        align-items: center;
        position: relative;
        > img {
          width: 24px;
          height: 24px;
        }
        > .right {
          align-items: center;
          border: 1px solid #6673ff;
          border-radius: 4px;
          color: #6673ff;
          cursor: pointer;
          display: flex;
          font-family: Poppins;
          font-size: 14px;
          font-style: normal;
          font-weight: 400;
          height: 30px;
          justify-content: center;
          padding: 0 8px;
        }
      }
      > .balance-item {
        padding: 16px 0px 0;
        display: flex;
        gap: 10px;
        align-items: center;
        position: relative;
        > img {
          width: 24px;
          height: 24px;
        }
      }
    }
  }
`;
