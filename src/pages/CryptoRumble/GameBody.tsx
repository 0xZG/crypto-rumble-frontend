import React, { CSSProperties, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { AppButton } from '_components/Com/AppButton';
import { ProofRequestMap, cloneCryptoRumbleGame, defaultBoardPacked, initCryptoRumbleGame, rustIntMod } from '_src/types/CryptoGame';
import { useAccount } from 'wagmi';
import { useAppSelector } from '_src/store/hooks';
import AppConstants, { GlobalVar } from '_src/constants/Constant';
import gameSlice from '_src/store/game/reducer';
import { ethers } from 'ethers';
import classNames from 'classnames';
import { NumberRun } from '_components/NumberRun';
import { ReactComponent as CompleteSvg } from '_assets/svg/complete.svg';
import { ChainInfo } from '_src/constants/Contracts';
import { useWalletHandler } from '_src/hook/useGameContract';
import { snarkjsGroth16fullProveMounted } from '_src/lib/workers';
import { CryptoRumbleGameBodyTiles } from './GameBodyTiles';

interface PageIndexProps {
  style?: React.CSSProperties;
}

export const CryptoRumbleGameBody: React.FC<PageIndexProps> = (props) => {
  const acc = useAccount();
  const chain = useAppSelector((s) => s.game.Chain);
  const game = useAppSelector((s) => s.game.GameCR);
  const wallet = useWalletHandler();
  useEffect(() => {
    (async () => {
      const game = await initCryptoRumbleGame(ethers.constants.AddressZero, chain.id);
      GlobalVar.dispatch(gameSlice.actions.Update({ GameCR: game }));
    })();
  }, [acc.address]);

  const uploading = useMemo(() => {
    const conf = ChainInfo[game.chainId];
    const moveLength = game.moves.length;
    if (moveLength < conf.MaxStepPerProof) return false;
    // if (game.end) return moveLength;
    // if ((moveLength / conf.MaxStepPerProof) % 2 !== 0) return false;
    let nextProofMoveLength = conf.MaxStepPerProof * game.uploadedProof + conf.MaxProofPerTx * conf.MaxStepPerProof;
    if (game.end && !game.pendingAction) nextProofMoveLength = game.moves.length;
    if (game.end && !game.pendingAction && moveLength <= conf.MaxStepPerProof * game.uploadedProof) return -1;
    if (moveLength < nextProofMoveLength) return false;
    const req = ProofRequestMap.get(game.proofs[nextProofMoveLength]);
    if (!req) return false;
    return nextProofMoveLength;
  }, [game.end, game.pendingAction, game.moves.length, game.uploadedProof]);
  return (
    <PageIndexStyle style={props.style}>
      <div className="header">
        <div
          className="score"
          onClick={async () => {
            const newGame = cloneCryptoRumbleGame(game);
            newGame.auto = true;
            GlobalVar.dispatch(gameSlice.actions.Update({ GameCR: newGame }));
          }}
        >
          Score: <NumberRun from={0} to={game.score} duration={300} fixed={0} />
        </div>
        <div className="task">
          <div className="moves">
            <div className="text">MOVES</div>
            <div className="val">{game.maxStep - game.step}</div>
          </div>
          <div className="detail">
            {game.scoreList.map((score, index) => {
              const id = index + 1;
              const max = game.targetTiles[id];
              if (!max) return null;
              return (
                <div key={id}>
                  <div className={classNames('sprites-tiles-v1', `tiles-v1-${id}`)}></div>
                  {score >= max ? (
                    <CompleteSvg />
                  ) : (
                    <div className="value">
                      <NumberRun from={0} fixed={0} to={score} duration={300} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="board">
        {uploading && uploading > 0 && (
          <div className="modal">
            <AppButton
              onClick={async () => {
                if (!wallet) return;
                const conf = ChainInfo[game.chainId];
                const data: any[] = [];
                const minIndex = conf.MaxStepPerProof * game.uploadedProof;
                const maxIndex = conf.MaxStepPerProof * conf.MaxProofPerTx + minIndex;
                let currentIndex = (1 + game.uploadedProof) * conf.MaxStepPerProof;
                const endIndex = game.moves.length;
                console.log(game);
                while (currentIndex <= maxIndex) {
                  if (currentIndex >= endIndex) currentIndex = endIndex;
                  const req = ProofRequestMap.get(game.proofs[currentIndex]);
                  if (!req) {
                    data.push(null);
                    if (currentIndex === endIndex) break;
                    currentIndex += conf.MaxStepPerProof;
                    continue;
                  }
                  const res = await req;
                  const { proof, publicSignals } = res.data;
                  // const snap0 = game.dataSnapshot[uploading - (uploading % conf.MaxStepPerProof || conf.MaxStepPerProof)];
                  data.push({
                    _pA: proof.pi_a.slice(0, 2),
                    _pB: [proof.pi_b[0].slice(0).reverse(), proof.pi_b[1].slice(0).reverse()] as any,
                    _pC: proof.pi_c.slice(0, 2),
                    _pubSignals: publicSignals,
                  });
                  if (currentIndex === game.moves.length) break;
                  currentIndex += conf.MaxStepPerProof;
                }
                console.log(data);
                const { request, result } = await wallet.of('GameHub').simulate.uploadScores(['CryptoRumble', data.filter((i) => !!i), []], {
                  account: wallet.walletClient.account.address,
                });
                await wallet.write(request);
                const newGame = cloneCryptoRumbleGame(game);
                newGame.uploadedProof += data.length;
                GlobalVar.dispatch(gameSlice.actions.Update({ GameCR: newGame }));
              }}
            >
              Upload zkProof
            </AppButton>
          </div>
        )}
        {(!game.solidity || uploading === -1) && (
          <div className="modal">
            <AppButton
              onClick={async () => {
                snarkjsGroth16fullProveMounted();
                if (!wallet) return;
                if (!AppConstants.CryptoRumbleSeedStatic) {
                  const res = await ethers.utils.fetchJson(
                    `http://localhost:3000/generateRandom?publicKey=9ad65ea66868b0843090846471e10598303f9aa63d949661359bb8d9b44696fcf16fe5600ebcc09448f1224d735beceac20e6eacd4fe0a0e6f9fc2aa3f42ba42`,
                  );
                  console.log(res);
                }
                const data = {
                  applicationAddress: '0xC159a329F5Fa867327fcC9c8c9256aE41b7CDE76',
                  messageHash: '0xbdabfbcc70c90ccef175121181e0ba03692f095220e0c619a22e6260bbe9295a',
                  signature: '0xce4c49e40d407bcb82a6579d5b3825562bbf11a8dc5df9673615e18a62f36f701cae055651040678503e4a8b5adcb4821fb737f286690b062f8a385581693265',
                  v: 1 + 27,
                  expectedRandom: '0xca5fbc370281d59130139f25ee3c64b769808fdec3b26051aa09ee2ca0555447',
                } as const;
                console.log('defaultBoardPacked', defaultBoardPacked);
                if (!AppConstants.CryptoRumbleNewGameHack) {
                  const { request } = await wallet.of('GameHub').simulate.newGame(['CryptoRumble', [1n, defaultBoardPacked], data], {
                    account: wallet.walletClient.account.address,
                  });
                  await wallet.write(request as any);
                }
                const game = await initCryptoRumbleGame(wallet.walletClient.account.address, chain.id);
                game.solidity = { gameId: '0' };
                game.curNonce = (BigInt(data.expectedRandom) % rustIntMod.toBigInt()).toString();
                GlobalVar.dispatch(gameSlice.actions.Update({ GameCR: game }));
              }}
            >
              New Game
            </AppButton>
          </div>
        )}
        <CryptoRumbleGameBodyTiles />
      </div>
    </PageIndexStyle>
  );
};

const PageIndexStyle = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  width: 612px;
  height: 740px;
  > .header {
    display: flex;
    flex-wrap: wrap;
    width: 450px;
    height: 128px;
    border-radius: 24px 24px 0px 0px;
    overflow: hidden;
    background: linear-gradient(180deg, #f3c17a 0%, #f5d09b 53.82%, #f6dca3 87.25%, #edc58d 100%);
    box-shadow: 0.5px 0.5px 0px 0px #ffeccf inset, 0px -1px 4px 0px rgba(239, 174, 145, 0.3) inset, 0px 2px 4px 0px rgba(246, 238, 193, 0.3) inset, 0px 4px 8px 0px rgba(92, 58, 44, 0.5);
    > .score {
      height: 26px;
      background-color: #c67c5a;
      box-shadow: 0px -0.5px 0px 0px #945132 inset;
      color: #f8ecc1;
      font-size: 16px;
      line-height: 26px;
      text-align: center;
      width: 100%;
    }
    > .task {
      width: 100%;
      display: flex;
      height: 100px;
      gap: 24px;
      justify-content: center;
      align-items: center;
      > .moves {
        width: 54px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: center;
        color: #895341;
        font-size: 16px;
        text-shadow: 1px 1px 1px #2e2e32;

        > .val {
          font-size: 40px;
        }
      }
      > .detail {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 324px;
        height: 76px;
        box-sizing: border-box;
        padding: 8px 16px;
        border-radius: 16px;
        border: 1px solid #cda363;
        background: linear-gradient(180deg, #f6eac0 0%, #f7ebc0 48.79%, #f8edc1 100.11%);
        box-shadow: 0px -2px 4px 0px rgba(176, 106, 54, 0.64) inset;
        gap: 20px;
        > div {
          width: 60px;
          height: 60px;
          position: relative;
          > .sprites-tiles-v1 {
            transform: scale(0.8);
            transform-origin: top left;
          }
          > svg {
            position: absolute;
            bottom: 0;
            right: -4px;
            z-index: 2;
          }
          > .value {
            position: absolute;
            bottom: 0;
            right: -4px;
            color: #fff;
            text-shadow: 0 0 2px #5e3325, 0 0 2px #633526;
            font-size: 24px;
            z-index: 2;
          }
        }
      }
    }
  }
  > .board {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 612px;
    height: 612px;
    border: 6px solid #fef8e3;
    border-radius: 20px;
    background-color: #2e2e32;
    position: relative;
    > .modal {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      bottom: 0;
      right: 0;
      backdrop-filter: blur(2px);
    }
  }
`;
