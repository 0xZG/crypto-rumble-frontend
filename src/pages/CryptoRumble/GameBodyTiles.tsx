import CryptoTile from '_components/CryptoTile';
import AppConstants, { GlobalVar } from '_src/constants/Constant';
import gameSlice from '_src/store/game/reducer';
import { useAppSelector } from '_src/store/hooks';
import { CryptoRumbleBombs, ICryptoRumbleTile, ProofRequestMap, cryptoRumbleMatch, cryptoRumbleNext, cryptoRumbleSwap, feBoard2SolidityBoard, getCryptoRumbleXY } from '_src/types/CryptoGame';
import { awaitReactStateValue, getReactStateValue, sleep } from '_src/utils';
import React, { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import TilesV1Tool12 from '_assets/images/tiles-v1-tool/12-bg.png';
import { ChainInfo } from '_src/constants/Contracts';
import { useWalletHandler } from '_src/hook/useGameContract';
import { BigNumberish } from 'ethers';

interface PageIndexProps {}
const GameSize = AppConstants.GameCryptoRumbleWidth;

const moveList = [
  [4, 3, 2],
  [7, 3, 2],
  [2, 2, 1],
  [4, 3, 1],
  [4, 2, 2],
  [5, 3, 2],
  [5, 1, 2],
  [4, 0, 2],
  [2, 0, 1],
  [1, 3, 1],
  [2, 3, 1],
  [2, 2, 2],
  [4, 4, 1],
  [0, 0, 2],
  [1, 5, 1],
  [2, 5, 2],
  [6, 5, 2],
  [4, 4, 1],
  [5, 1, 1],
  [4, 2, 1],
  [1, 3, 1],
  [2, 2, 2],
  [1, 2, 1],
  [6, 5, 1],
  [5, 3, 2],
  [6, 4, 1],
  [6, 3, 1],
  [6, 4, 1],
  [3, 4, 1],
  [1, 6, 1],
].filter((v) => v[2] !== 0);

export const CryptoRumbleGameBodyTiles: React.FC<PageIndexProps> = (props) => {
  const game = useAppSelector((s) => s.game.GameCR);
  const [active, _active] = useState<null | ICryptoRumbleTile>(null);
  const pending = useRef(false);
  const wallet = useWalletHandler();
  const gameHandler = useRef(game);
  gameHandler.current = game;
  const onClick = useCallback(async (e: any, tile: ICryptoRumbleTile) => {
    console.log('Tile onClick', e, tile);
    if (gameHandler.current.pendingAction) return;
    const swapAction = async (p0: ICryptoRumbleTile, p1: ICryptoRumbleTile) => {
      await sleep(0);
      if (p0.index > p1.index) [p0, p1] = [p1, p0];
      // console.log(p1, p0);
      if (p0.value === p1.value) return;
      const data = { index: p0.index, action: p1.index - p0.index === 1 ? 2 : 1 };
      const newGame = await cryptoRumbleNext(gameHandler.current, { action: 'Swap', data });
      GlobalVar.dispatch(gameSlice.actions.Update({ GameCR: newGame }));
    };

    // if (!AppConstants.NormalTileValues.includes(tile.value)) return;
    const bak = await getReactStateValue(_active);
    console.log('Tile onClick _active', tile);
    if (bak === tile) return;
    const resetTile = async () => {
      if (CryptoRumbleBombs.includes(tile.value)) {
        const data = { index: tile.index, action: tile.value };
        const newGame = await cryptoRumbleNext(gameHandler.current, { action: 'Swap', data });
        GlobalVar.dispatch(gameSlice.actions.Update({ GameCR: newGame }));
        _active(null);
      }
      return _active(tile);
    };
    if (!bak) return resetTile();
    const diff = bak.index - tile.index;
    if (![GameSize, -GameSize, 1, -1].includes(diff)) return resetTile();
    if ([1, -1].includes(diff)) {
      if (Math.floor(bak.index / GameSize) !== Math.floor(tile.index / GameSize)) return resetTile();
    }
    // emit swap
    swapAction(bak, tile);
    return _active(null);
  }, []);

  useEffect(() => {
    // console.log('pendingAction update');
    if (game.board.length === 0) return;
    if (!game.pendingAction) {
      const conf = ChainInfo[game.chainId];
      if (game.auto && game.moves.length < (game.uploadedProof + conf.MaxProofPerTx) * conf.MaxStepPerProof) {
        const ai = moveList[game.step];
        if (!ai || !game.solidity) return;
        const data = { index: GameSize * ai[0] + ai[1], action: ai[2] };
        console.log('move ', ai);
        sleep(0).then(() => {
          cryptoRumbleNext(gameHandler.current, { action: 'Swap', data }).then((GameCR) => {
            GlobalVar.dispatch(gameSlice.actions.Update({ GameCR }));
          });
        });
      }
      return;
    }
    if (pending.current) return;
    pending.current = true;
    cryptoRumbleNext(game)
      .then((GameCR) => {
        pending.current = false;
        GlobalVar.dispatch(gameSlice.actions.Update({ GameCR }));
      })
      .catch((err) => {
        console.error(err);
        pending.current = false;
      });
  }, [game.pendingAction, game.board.length, game.solidity, game.auto, game.uploadedProof]);

  // useEffect(() => {
  //   if (!wallet) return;
  //   const conf = ChainInfo[game.chainId];
  //   if (game.moves.length < conf.MaxStepPerProof) return;
  //   if ((game.moves.length / conf.MaxStepPerProof) % 2 === 0) {
  //     const req = ProofRequestMap.get(game.proofs[game.moves.length]);
  //     if (!req) return;
  //     req.then((res) => {
  //       const { proof, publicSignals } = res.data;
  //       const snap0 = game.dataSnapshot[game.moves.length - conf.MaxStepPerProof];
  //       const data = [
  //         {
  //           _pA: proof.pi_a.slice(0, 2),
  //           _pB: [proof.pi_b[0].slice(0).reverse(), proof.pi_b[1].slice(0).reverse()] as any,
  //           _pC: proof.pi_c.slice(0, 2),
  //           _pubSignals: publicSignals,
  //         },
  //       ];
  //       wallet
  //         .of('GameHub')
  //         .simulate.uploadScores(['CryptoRumble', data, [BigInt(snap0.fromSeed)]], {
  //           account: wallet.walletClient.account.address,
  //         })
  //         .then((res) => {
  //           wallet.write(res.request);
  //         });
  //     });
  //   }
  // }, [wallet, game.end, game.pendingAction, game.moves.length]);

  return (
    <PageIndexStyle>
      {game.board.map((tile) => {
        return <CryptoTile onClick={onClick} tile={tile} key={tile.id} active={active === tile} />;
      })}
    </PageIndexStyle>
  );
};

const Size = 70;
const TileGap = 2;
const BoxPending = 12;
const Lines = new Array(GameSize).fill(0);
const Grids = new Array(GameSize * GameSize).fill(0).map((_, i) => i);
const tilesIndexStyle = `
  ${Grids.map((index) => {
    const x = (index + GameSize * 100) % GameSize;
    const y = Math.floor(index / GameSize);
    const feX = y;
    const feY = GameSize - x - 1;
    const feIndex = feY * GameSize + feX;
    return `&.tiles-index-${index} {
      left: ${BoxPending + feX * (Size + TileGap)}px;
      top: ${BoxPending + feY * (Size + TileGap)}px;
      z-index: ${feIndex};
    }`;
  }).join(' ')}

  ${Lines.map((_, i) => {
    return `&.temp-y-${i}{ top: ${BoxPending + i * (Size + TileGap)}px;}`;
  }).join(' ')}

  ${Lines.map((_, i) => {
    return `&.temp-y-${i + GameSize}{ top: ${-BoxPending - (i + 1) * (Size + TileGap)}px;}`;
  }).join(' ')}

`;
const PageIndexStyle = styled.div`
  width: ${(Size + TileGap) * GameSize - TileGap + 2 * BoxPending}px;
  height: ${(Size + TileGap) * GameSize - TileGap + 2 * BoxPending}px;
  position: relative;
  overflow: hidden;
  > div {
    cursor: pointer;
    position: absolute;
    transition: all ease 0.2s;
    border-radius: 18px;
    z-index: 2;
    width: ${Size}px;
    height: ${Size}px;

    &:hover {
      transform: scale(1.06);
    }
    &.active-true {
      z-index: 10000;
      transform: scale(1.1);
      box-shadow: #fffdc5 0px 0px 2px 2px;
      filter: drop-shadow(0px 0px 8px #fff);
      animation: dropShadow 1s infinite ease-in-out;
    }
    &.status-DEAD {
      /* z-index: 1; */
      transform: scale(0);
    }
    &.tile-value-10,
    &.tile-value-11,
    &.tile-value-12 {
      z-index: 100;
    }
    &.tile-value-10 > div,
    &.tile-value-11 > div {
      animation: tv11011 2s infinite ease-in-out;
      @keyframes tv11011 {
        0% {
          transform: scale(0.9);
        }
        50% {
          transform: scale(1);
        }
        100% {
          transform: scale(0.9);
        }
      }
    }

    &.tile-value-12::before {
      content: ' ';
      display: block;
      position: absolute;
      width: 128px;
      height: 128px;
      left: -29px;
      top: -29px;
      background-image: url(${TilesV1Tool12});
      background-repeat: no-repeat;
      animation: tv112 5s infinite linear;
      z-index: -1;
      transform-origin: 49% 50%;
      @keyframes tv112 {
        0% {
          transform: rotate(0) scale(0.8);
        }
        25% {
          transform: rotate(-90deg) scale(1);
        }
        50% {
          transform: rotate(-180deg) scale(0.8);
        }
        75% {
          transform: rotate(-270deg) scale(1);
        }
        100% {
          transform: rotate(-360deg) scale(0.8);
        }
      }
    }
    ${tilesIndexStyle}

    .sprites-tiles-v1 {
      transition: all ease 0.2s;
    }
  }
`;
