/* eslint-disable no-bitwise */
import AppConstants from '_src/constants/Constant';
import { ChainInfo, SupportChainIds } from '_src/constants/Contracts';
import { snarkjsGroth16fullProve } from '_src/lib/workers';
import { sleep } from '_src/utils';
import { ethers } from 'ethers';
import * as ffjavascript from 'ffjavascript';

const p = ffjavascript.Scalar.fromString('21888242871839275222246405745257275088548364400416034343698204186575808495617');
const Fr = new ffjavascript.F1Field(p);

export interface ICryptoRumbleTile {
  value: number;
  index: number;
  id: number;
  status: 'NEW' | 'LIVE' | 'DEAD';
  tempY?: number;
}
export type uint64 = number;
export type address = `0x${string}`;
export type hash = `0x${string}`;
export enum CryptoRumbleBomb {
  BombX = 10,
  BombY = 11,
  BombB = 12,
}
export const CryptoRumbleMusic = {
  Matched: [
    new Audio('/CryptoRumble/static/music/matched0.mp3'),
    new Audio('/CryptoRumble/static/music/matched1.mp3'),
    new Audio('/CryptoRumble/static/music/matched2.mp3'),
    new Audio('/CryptoRumble/static/music/matched3.mp3'),
  ],
  Bomb: new Audio('/CryptoRumble/static/music/bomb1.mp3'),
};
const CryptoRumbleMusicList: Record<string, HTMLAudioElement[]> = {};
const CryptoRumbleMusicListNum: Record<string, number> = {};
const maxCache = 8;
new Array(maxCache).fill(0).forEach(() => {
  const push = (src: string) => {
    CryptoRumbleMusicList[src] = CryptoRumbleMusicList[src] || [];
    CryptoRumbleMusicList[src].push(new Audio(src));
    CryptoRumbleMusicListNum[src] = 0;
  };
  CryptoRumbleMusic.Matched.forEach((audio) => {
    push(audio.src);
  });
  push(CryptoRumbleMusic.Bomb.src);
});
export const PlayMusic = (el: HTMLAudioElement) => {
  const index = CryptoRumbleMusicListNum[el.src]++ % maxCache;
  CryptoRumbleMusicList[el.src][index].play();
};
export const CryptoRumbleBombs = [CryptoRumbleBomb.BombB, CryptoRumbleBomb.BombX, CryptoRumbleBomb.BombY];
export interface ICryptoRumbleAction {
  index: number;
  action: number;
}
interface MatchActionDataComm {
  Combo: number;
  Swap?: {
    fromBoard: number[][];
    fromStep: number;
    fromSeed: string;
    move: ICryptoRumbleAction;
    afterMoveBoard: number[][];
  };
}
export type CryptoRumbleMatchAction = null | { action: 'Match'; data: MatchActionDataComm } | { action: 'Fall'; data: MatchActionDataComm } | { action: 'Swap'; data: ICryptoRumbleAction };

const GameSize = AppConstants.GameCryptoRumbleWidth;
export interface ICryptoRumbleGame {
  moves: ICryptoRumbleAction[];
  step: number;
  pendingAction: CryptoRumbleMatchAction;
  board: ICryptoRumbleTile[];
  player: address;
  prevNonce: string;
  curNonce: string;
  chainId: SupportChainIds;
  maxStep: number;
  auto?: boolean;
  targetTiles: Record<number, number>;
  uploadedProof: number;
  solidity?: {
    gameId: string;
  };
  score: number;
  scoreList: number[];
  dataSnapshot: Record<
    number,
    {
      fromBoard: number[][];
      fromSeed: string;
      fromStep: number;
      afterSeed: string;
      afterMoveBoard: number[][];
      afterStep: number;
      toBoard: number[][];
      scorePacked: string;
      scoreList: number[];
    }
  >;
  end?: boolean;
  proofs: Record<number, number>;
}

export const defaultCryptoRumbleGame: ICryptoRumbleGame = {
  moves: [],
  pendingAction: null,
  board: [],
  step: 0,
  scoreList: new Array(AppConstants.NormalTileValues.length).fill(0),
  player: ethers.constants.AddressZero,
  prevNonce: '0',
  curNonce: '0',
  chainId: 5611,
  score: 0,
  dataSnapshot: {},
  proofs: {},
  maxStep: 30,
  targetTiles: {},
  uploadedProof: 0,
};
export const rustIntMod = ethers.BigNumber.from('21888242871839275222246405745257275088548364400416034343698204186575808495617');
let gid = 10000;
const maxGridNum = GameSize * GameSize;
const grids = new Array(GameSize).fill(0).map((_, i) => i);

let proofRequestId = 1000;
export const ProofRequestMap = new Map<number, Promise<{ data: any; error: Error }>>();

export const initCryptoRumbleGame = async (player: `0x${string}`, chainId: SupportChainIds): Promise<ICryptoRumbleGame> => {
  console.log('initCryptoRumbleGame', player);
  return initCryptoRumbleGameJust(player, chainId);
};

const defaultBoard = [
  [5, 3, 5, 4, 5, 3, 5, 5],
  [3, 5, 3, 4, 4, 3, 3, 5],
  [2, 1, 1, 2, 3, 2, 2, 1],
  [3, 1, 4, 1, 2, 5, 3, 1],
  [2, 5, 3, 2, 1, 2, 2, 5],
  [3, 1, 2, 4, 2, 1, 2, 1],
  [3, 1, 4, 4, 2, 2, 1, 1],
  [2, 4, 2, 2, 4, 3, 3, 2],
].reduce((s, a) => s.concat(a), []);

const defaultBoard2 = [
  [2, 5, 2, 3, 2, 5, 2, 2],
  [5, 12, 5, 11, 3, 12, 5, 2],
  [4, 10, 10, 4, 5, 4, 4, 10],
  [5, 10, 3, 10, 4, 2, 5, 10],
  [4, 2, 5, 4, 10, 4, 4, 2],
  [5, 10, 4, 3, 11, 10, 4, 10],
  [5, 10, 3, 3, 4, 12, 10, 10],
  [4, 3, 4, 4, 3, 5, 5, 4],
].reduce((s, a) => s.concat(a), []);

export const initCryptoRumbleGameJust = (player: `0x${string}`, chainId: SupportChainIds): ICryptoRumbleGame => {
  const beginTime = Date.now();
  // let nonce = ethers.utils.solidityKeccak256(['uint256', 'address'], [beginTime, player]);
  // nonce = ethers.BigNumber.from(nonce).mod(rustIntMod).toString();
  const nonce = (BigInt('0xca5fbc370281d59130139f25ee3c64b769808fdec3b26051aa09ee2ca0555447') % rustIntMod.toBigInt()).toString();
  let board = defaultBoard.map((value, index) => ({ value, index, id: index, status: 'NEW' as const }));
  if (player === ethers.constants.AddressZero) {
    board = defaultBoard2.map((value, index) => ({ value, index, id: index, status: 'NEW' }));
  }
  const current: ICryptoRumbleGame = {
    moves: [],
    pendingAction: null,
    step: 0,
    scoreList: new Array(AppConstants.NormalTileValues.length).fill(0),
    board,
    score: 0,
    player,
    prevNonce: nonce,
    curNonce: nonce,
    uploadedProof: 0,
    chainId,
    proofs: {},
    // solidity: { gameId: '0' },
    dataSnapshot: {},
    maxStep: 30,
    targetTiles: {
      1: 200,
      2: 200,
      3: 200,
      // 4: 20,
    },
  };
  // if (AppConstants.CryptoRumbleNewGameHack) current.solidity = { gameId: '0' };
  console.log('initCryptoRumbleGame', player, nonce);
  return current;
};

export const cloneCryptoRumbleGame = (game: ICryptoRumbleGame): ICryptoRumbleGame => {
  return {
    step: game.step,
    player: game.player,
    pendingAction: game.pendingAction,
    dataSnapshot: { ...game.dataSnapshot },
    end: game.end,
    proofs: { ...game.proofs },
    scoreList: [...game.scoreList],
    solidity: game.solidity,
    prevNonce: game.prevNonce,
    auto: game.auto,
    score: game.score,
    curNonce: game.curNonce,
    chainId: game.chainId,
    moves: game.moves.concat([]),
    board: game.board.map((i) => ({ ...i })),
    maxStep: game.maxStep,
    targetTiles: { ...game.targetTiles },
    uploadedProof: game.uploadedProof,
  };
};

export const setGameSolidity = (
  bakGame: ICryptoRumbleGame,
  data: {
    gameId: bigint;
    player: `0x${string}`;
    score: bigint;
    moves: bigint;
    startTime: bigint;
    endTime: bigint;
    board: bigint;
    prevNonce: bigint;
    curNonce: bigint;
  },
) => {
  console.log('setGameSolidity', bakGame, data);
  const game = cloneCryptoRumbleGame(bakGame);
  game.solidity = {
    gameId: data.gameId.toString(),
  };
  // game.prevNonce = game.solidity.prevNonce;
  // game.curNonce = game.solidity.curNonce;
  // if (!ethers.BigNumber.from(game.solidity.curNonce).mod(rustIntMod).eq(game.solidity.curNonce)) {
  //   alert(`neq nonce ${game.solidity.curNonce}`);
  //   throw new Error(`neq nonce ${game.solidity.curNonce}`);
  // }
  // if (game.solidity.endTime > 0) game.end = true;
  return game;
};

export const buildProof = (game: ICryptoRumbleGame) => {
  const conf = ChainInfo[game.chainId];
  const moveLength = game.moves.length;
  if (moveLength === 0) return;
  const mod = moveLength % conf.MaxStepPerProof;
  let dataSnapshotIndex = moveLength;
  if (game.end && mod > 0 && !game.pendingAction) {
    dataSnapshotIndex = moveLength;
  } else if (mod === 0) {
    dataSnapshotIndex = moveLength;
  } else {
    return;
  }
  if (dataSnapshotIndex in game.proofs) return;
  const beginIndex = dataSnapshotIndex - (dataSnapshotIndex % conf.MaxStepPerProof || conf.MaxStepPerProof);
  console.log('buildProof', game, beginIndex, dataSnapshotIndex);
  const snap0 = game.dataSnapshot[beginIndex];
  const snap1 = game.dataSnapshot[dataSnapshotIndex - 1];
  console.log('dataSnapshotIndex', beginIndex, dataSnapshotIndex);
  if (!snap0) throw new Error('snap0 empty');
  if (!snap1) throw new Error('snap1 empty');

  const bak = ProofRequestMap.get(proofRequestId) || new Promise((r) => r(null as any));
  const id = ++proofRequestId;
  const reqId = `prove_2048:{${beginIndex}-${dataSnapshotIndex}}:${id}`;
  const fromBoard = snap0.fromBoard.map((tiles) => tiles.map((v) => BigInt(v)));
  const toBoard = snap1.toBoard.map((tiles) => tiles.map((v) => BigInt(v)));
  const move = game.moves.slice(beginIndex, beginIndex + conf.MaxStepPerProof).map((v) => {
    const p0 = getCryptoRumbleXY(v.index);
    return [p0.y, p0.x, v.action];
  });
  if (move.length < conf.MaxStepPerProof) move.push(...new Array(conf.MaxStepPerProof - move.length).fill([0, 0, 0]));
  const { pos: posPacked, item: itemPacked } = packMove(move);
  let lastAfterMoveBoard = null;
  const afterMoveBoard = move.map((_, i) => {
    const index = i + beginIndex;
    const snap = game.dataSnapshot[index];
    if (snap) lastAfterMoveBoard = snap.toBoard;
    if (!snap) return lastAfterMoveBoard!;
    return snap.afterMoveBoard;
  });
  // const logss = afterMoveBoard.map((board) => packBoard(board.map((tiles) => tiles.map((v) => BigInt(v)))));
  const lastScoreList = game.dataSnapshot[beginIndex - 1]?.scoreList || new Array(100).fill(0);

  // console.log(logss.map((l) => l.toString()));
  // console.log(fromBoard, toBoard);
  const scorePacked = packScore(snap1.scoreList.map((v, i) => BigInt(v) - BigInt(lastScoreList[i]))).toString();
  const input = {
    fromSeed: BigInt(snap0.fromSeed),
    toSeed: BigInt(snap1.afterSeed),
    fromBoard,
    afterMoveBoard: afterMoveBoard.map((afts) => afts.map((tiles) => tiles.map((v) => BigInt(v)))),
    toBoard,
    step: BigInt(snap0.fromStep),
    stepAfter: BigInt(snap1.afterStep),
    boardPacked: [packBoard(fromBoard), packBoard(toBoard)],
    scorePacked,
    posPacked,
    itemPacked,
    move,
  };
  console.log('--=============time', reqId, input, snap0, snap1);
  const proof = bak.then(async () => {
    console.time(reqId);
    console.log('time', input);
    return snarkjsGroth16fullProve(input).then((res) => {
      console.timeEnd(reqId);
      console.log('timeEnd', res);
      return res;
    });
  });
  ProofRequestMap.set(id, proof);
  game.proofs[dataSnapshotIndex] = id;
  return game;
};

export const cryptoRumbleNext = async (game: ICryptoRumbleGame, next?: CryptoRumbleMatchAction) => {
  if (next && game.pendingAction) throw new Error('pendingAction already');
  const nextAction = next ?? game.pendingAction;
  if (!nextAction) return;
  // console.group(`---------------cryptoRumbleNext(${nextAction.action})`);
  game = cloneCryptoRumbleGame(game);
  // console.log('-----begin', game, feBoard2SolidityBoard(game.board));
  switch (nextAction.action) {
    case 'Swap':
      game = cryptoRumbleSwap(game, nextAction.data);
      break;
    case 'Match':
      if (game.pendingAction) await sleep(AppConstants.CryptoRumbleSleep);
      game = cryptoRumbleMatch(game, nextAction.data);
      break;
    case 'Fall':
      if (game.pendingAction) await sleep(AppConstants.CryptoRumbleSleep);
      game = cryptoRumbleFall(game, nextAction.data);
      break;
    default:
      throw new Error('unknow action');
  }
  console.log('move', game.moves.length);
  if (!game.pendingAction) buildProof(game);
  // console.log('-----end', game, feBoard2SolidityBoard(game.board));
  // console.groupEnd();
  return game;
};

export function packScore(scores: bigint[]) {
  let out = 0n;
  for (let i = 0; i < scores.length; i++) {
    out = out * 2048n + scores[i];
  }
  return out;
}

export function unpackScore(score: bigint) {
  let out = 0n;
  for (let i = 0; i < 5; i++) {
    out += score & 2047n;
    score >>= 11n;
  }
  return out;
}
export function packBoard(board: bigint[][]) {
  let out = 0n;
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      out = out * 8n + board[x][y];
    }
  }
  return out;
}

export function packMove(moves: number[][]) {
  let pos = 0n;
  let item = 0n;
  for (let i = 0; i < moves.length; i++) {
    const x = BigInt(moves[i][0]);
    const y = BigInt(moves[i][1]);
    const it = BigInt(moves[i][2]);
    pos = pos * 64n + x * 8n + y;
    item = item * 256n + it;
  }
  return { pos, item };
}

export const cryptoRumbleSnapshot = (game: ICryptoRumbleGame, merge: Partial<ICryptoRumbleGame['dataSnapshot'][number]>) => {
  const index = game.moves.length - 1;
  const afterMoveBoard = feBoard2SolidityBoard(game.board).map((tiles) => tiles.map((t) => Number(t)));
  // console.log(merge);
  game.dataSnapshot[index] = {
    afterSeed: game.curNonce,
    afterMoveBoard,
    fromBoard: afterMoveBoard,
    toBoard: [],
    scorePacked: '0',
    afterStep: game.step,
    fromSeed: game.curNonce,
    fromStep: game.step,
    scoreList: [...game.scoreList],
    ...merge,
  };
  // console.log(game.dataSnapshot[index], game.dataSnapshot[index].fromBoard);
  buildProof(game);
};

export const getCryptoRumbleXY = (p: ICryptoRumbleTile | number) => {
  const index = typeof p === 'number' ? p : p.index;
  return {
    x: index % GameSize,
    y: Math.floor(index / GameSize),
  };
};

export const cryptoRumbleSwap = (game: ICryptoRumbleGame, move: ICryptoRumbleAction) => {
  // console.log('-----cryptoRumbleSwap', move);
  if (game.end) return game;
  cryptoRumbleBoardFilter(game);
  const board = getBoardMap(game);
  const p0 = board.get(move.index);
  if (!p0) throw new Error('unkonw index');

  const fromBoard = feBoard2SolidityBoard(game.board).map((tiles) => tiles.map((v) => Number(v)));
  const fromStep = game.step;
  const fromSeed = game.curNonce;
  // game.moves.push(move);
  game.step++;
  // console.log('game step', game.step);
  if (game.step >= game.maxStep) game.end = true;
  // swap
  if ([1, 2].includes(move.action)) {
    let p1Index = -1;
    if (move.action === 2) {
      p1Index = p0.index + 1;
      if (p1Index % GameSize === 0) throw new Error('overflow');
    } else if (move.action === 1) {
      p1Index = p0.index + GameSize;
      if (p1Index >= maxGridNum) throw new Error('overflow');
    }
    const p1 = board.get(p1Index);
    if (p1) {
      [p0.index, p1.index] = [p1.index, p0.index];
      // console.log('swap', p0, p1);
    }
    delete p0.tempY;
    delete p1?.tempY;
    game.pendingAction = {
      action: 'Match',
      data: {
        Combo: 1,
        Swap: {
          afterMoveBoard: feBoard2SolidityBoard(game.board).map((tiles) => tiles.map((v) => Number(v))),
          fromBoard,
          fromStep,
          fromSeed,
          move,
        },
      },
    };
    // cryptoRumbleSnapshot(game, { fromBoard, fromStep, fromSeed });
    return game;
  }
  return game;
};

const getBoardMap = (game: ICryptoRumbleGame) => {
  const map = new Map<number, ICryptoRumbleTile>();
  game.board.forEach((tile) => {
    if (tile.status === 'DEAD') return;
    map.set(tile.index, tile);
  });
  return map;
};

export const cryptoRumbleMatch = (game: ICryptoRumbleGame, data: MatchActionDataComm) => {
  // console.group('-----cryptoRumbleMatch', game);
  cryptoRumbleBoardFilter(game);
  const board = getBoardMap(game);
  let matchX: ICryptoRumbleTile[] = [];
  let matchY: ICryptoRumbleTile[] = [];
  const fromBoard = feBoard2SolidityBoard(game.board).map((tiles) => tiles.map((v) => Number(v)));
  const fromStep = game.step;
  const fromSeed = game.curNonce;
  const clearMatchX = () => {
    if (matchX.length >= 3) matchList.push(matchX);
    matchX = [];
  };
  const clearMatchY = () => {
    if (matchY.length >= 3) matchList.push(matchY);
    matchY = [];
  };
  const matchList: ICryptoRumbleTile[][] = [];
  grids.forEach((i) => {
    grids.forEach((j) => {
      {
        const indexWidth = i * GameSize + j;
        const tile = board.get(indexWidth);
        if (!tile || !AppConstants.NormalTileValues.includes(tile.value)) {
          clearMatchX();
        } else {
          if (matchX.length !== 0 && matchX[0].value !== tile.value) {
            clearMatchX();
          }
          matchX.push(tile);
        }
      }
      {
        const indexHeight = j * GameSize + i;
        const tile = board.get(indexHeight);
        if (!tile || !AppConstants.NormalTileValues.includes(tile.value)) {
          clearMatchY();
        } else {
          if (matchY.length !== 0 && matchY[0].value !== tile.value) {
            clearMatchY();
          }
          matchY.push(tile);
        }
      }
    });
    clearMatchX();
    clearMatchY();
  });

  matchList.forEach((tiles) => {
    tiles.forEach((tile) => {
      if (tile.status === 'DEAD') {
        return;
      }
      tile.status = 'DEAD';
      game.scoreList[tile.value - 1]++;
    });
  });
  const toBoard = cryptoRumbleRandom(game);
  if (data.Swap) {
    game.moves.push(data.Swap.move);
    cryptoRumbleSnapshot(game, { fromStep: data.Swap.fromStep, toBoard, afterMoveBoard: data.Swap.afterMoveBoard, fromSeed: data.Swap.fromSeed, fromBoard: data.Swap.fromBoard });
    PlayMusic(CryptoRumbleMusic.Matched[Math.min(CryptoRumbleMusic.Matched.length - 1, data.Combo - 1)]);
    game.pendingAction = { action: 'Match', data: { Combo: 2 } };
  } else {
    if (matchList.length > 0) {
      game.moves.push({ index: 0, action: 0 });
      cryptoRumbleSnapshot(game, { fromStep, fromSeed, fromBoard, afterMoveBoard: fromBoard, toBoard });
      PlayMusic(CryptoRumbleMusic.Matched[Math.min(CryptoRumbleMusic.Matched.length - 1, data.Combo - 1)]);
      game.pendingAction = { action: 'Fall', data };
    } else {
      game.pendingAction = null;
    }
  }

  // console.log('matchList', matchList, game);
  // console.groupEnd();
  game.score = game.scoreList.reduce((s, a) => s + a, 0);
  return game;
};

export const cryptoRumbleFall = (game: ICryptoRumbleGame, data: MatchActionDataComm) => {
  game.board.forEach((tile) => {
    delete tile.tempY;
    // if (tile.status === 'DEAD') return;
  });
  game.pendingAction = { action: 'Match', data: { Combo: data.Combo + 1 } };
  return game;
};

function slideN(tiles: bigint[], n: number, seed: bigint) {
  const out = new Array(n).fill(0n);
  const doSlide = tiles[0] === 0n ? 1n : 0n;

  for (let i = 0; i < n - 1; i++) {
    out[i] = (tiles[i + 1] - tiles[i]) * doSlide + tiles[i];
  }

  const newTile = Fr.mod(seed, BigInt(AppConstants.NormalTileValues.length)) + 1n;
  const newSeed = Fr.div(seed, BigInt(AppConstants.NormalTileValues.length));

  out[n - 1] = (newTile - tiles[n - 1]) * doSlide + tiles[n - 1];
  return { tiles: out, seed: (newSeed - seed) * doSlide + seed };
}

function slideColumn(column: bigint[], seed: bigint) {
  const { tiles: s1, seed: sd1 } = slideN([column[7]], 1, seed);
  const { tiles: s2, seed: sd2 } = slideN([column[6], s1[0]], 2, sd1);
  const { tiles: s3, seed: sd3 } = slideN([column[5], s2[0], s2[1]], 3, sd2);
  const { tiles: s4, seed: sd4 } = slideN([column[4], s3[0], s3[1], s3[2]], 4, sd3);
  const { tiles: s5, seed: sd5 } = slideN([column[3], s4[0], s4[1], s4[2], s4[3]], 5, sd4);
  const { tiles: s6, seed: sd6 } = slideN([column[2], s5[0], s5[1], s5[2], s5[3], s5[4]], 6, sd5);
  const { tiles: s7, seed: sd7 } = slideN([column[1], s6[0], s6[1], s6[2], s6[3], s6[4], s6[5]], 7, sd6);
  const { tiles: s8, seed: sd8 } = slideN([column[0], s7[0], s7[1], s7[2], s7[3], s7[4], s7[5], s7[6]], 8, sd7);

  return { tiles: s8, seed: sd8 };
}

export const cryptoRumbleRandom = (game: ICryptoRumbleGame) => {
  // console.log('-----cryptoRumbleRandom');
  const rowEmpty = grids.map(() => 0);
  let board = getBoardMap(game);
  game.board.forEach((item) => {
    const p = getCryptoRumbleXY(item);
    item.tempY = GameSize - p.x - 1;
    if (item.status === 'DEAD') {
      rowEmpty[p.y]++;
    }
  });
  grids.forEach((_, y) => {
    let dx = -1;
    const deadCount = rowEmpty[y];
    let liveCount = GameSize - deadCount;
    grids.forEach((_, x) => {
      const nowIndex = y * GameSize + x;
      if (liveCount > 0) {
        liveCount--;
        dx++;
        let index = y * GameSize + dx;
        let tile = board.get(index);
        while (!tile && dx < GameSize) {
          dx++;
          index = y * GameSize + dx;
          tile = board.get(index);
          // console.log(y, x, tile, dx);
        }
        if (!tile) throw new Error('unkonw tile');
        board.delete(tile.index);
        tile.index = nowIndex;
      } else {
        const p = getCryptoRumbleXY(nowIndex);
        // console.log('-----push tile', nowIndex, p.x + rowEmpty[y]);
        game.board.push({
          value: 0,
          index: nowIndex,
          id: ++gid,
          status: 'NEW',
          tempY: p.x + deadCount,
        });
      }
    });
  });
  // console.log('game.board.', game.board);
  const solidity = feBoard2SolidityBoard(game.board);
  // console.log('feBoard2SolidityBoard', solidity);
  const solidityBoard = solidityBoardFall(solidity);
  // console.log('solidityBoardFall', solidityBoard);
  const newSolidityBoard = solidityBoard.concat([]);
  grids.forEach((index) => {
    const res = slideColumn(solidityBoard[index], BigInt(game.curNonce));
    game.curNonce = res.seed.toString();
    newSolidityBoard[index] = res.tiles;
  });
  // console.log('newSolidityBoard', newSolidityBoard);
  const newBoard = solidityBoard2FeBoard(newSolidityBoard);
  // console.log('newBoard', newBoard);

  board = getBoardMap(game);
  grids.forEach((y) => {
    let x = -1;
    grids.forEach((nx) => {
      x++;
      let times = GameSize * 2;
      let tile = board.get(y * GameSize + x);
      while (!tile && times > 0) {
        times--;
        x++;
        tile = board.get(y * GameSize + x);
      }
      if (!tile) {
        throw new Error('unkonw tile');
      }
      tile.value = newBoard[y][x];
    });
  });
  return newBoard;
};

export const feBoard2SolidityBoard = (board: ICryptoRumbleTile[]) => {
  const solidityBoard = grids.map(() => grids.map(() => 0n));
  board.forEach((tile) => {
    if (tile.status === 'DEAD') return;
    const x = tile.index % GameSize;
    const y = Math.floor(tile.index / GameSize);
    solidityBoard[y][x] = BigInt(tile.value);
  });
  return solidityBoard;
};
const solidityBoardFall = (solidityBoard: bigint[][]) => {
  return solidityBoard.map((line) => {
    let index = -1;
    return grids.map(() => {
      index++;
      while (index < GameSize && line[index] === 0n) index++;
      return line[index] || 0n;
    });
  });
};
export const solidityBoard2FeBoard = (solidityBoard: bigint[][]) => {
  const feBoard = grids.map(() => grids.map(() => 0));
  solidityBoard.forEach((tiles, y) => {
    tiles.forEach((value, x) => {
      feBoard[y][x] = Number(value);
    });
  });
  return feBoard;
};

export const cryptoRumbleBoardFilter = (game: ICryptoRumbleGame) => {
  game.board = game.board.filter((i) => {
    if (i.status === 'DEAD') return false;
    i.status = 'LIVE';
    return true;
  });
};

const solidityDefaultBoard = feBoard2SolidityBoard(defaultBoard.map((value, index) => ({ value, index, id: index, status: 'NEW' })));

export const defaultBoardPacked = packBoard(solidityDefaultBoard);
