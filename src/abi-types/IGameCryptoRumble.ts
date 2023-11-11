const IGameCryptoRumble = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "score",
        "type": "uint256"
      }
    ],
    "name": "GameOver",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      }
    ],
    "name": "NewGame",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "nonce",
        "type": "uint256"
      }
    ],
    "name": "NewNonce",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256[]",
        "name": "params",
        "type": "uint256[]"
      },
      {
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "components": [
          {
            "internalType": "address",
            "name": "applicationAddress",
            "type": "address"
          },
          {
            "internalType": "bytes32",
            "name": "messageHash",
            "type": "bytes32"
          },
          {
            "internalType": "bytes",
            "name": "signature",
            "type": "bytes"
          },
          {
            "internalType": "uint8",
            "name": "v",
            "type": "uint8"
          },
          {
            "internalType": "bytes32",
            "name": "expectedRandom",
            "type": "bytes32"
          }
        ],
        "internalType": "struct IVRF.VR",
        "name": "vr",
        "type": "tuple"
      }
    ],
    "name": "newGame",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      }
    ],
    "name": "scores",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "player",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "score",
            "type": "uint256"
          }
        ],
        "internalType": "struct IGameHub.GameScore",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint256[2]",
            "name": "_pA",
            "type": "uint256[2]"
          },
          {
            "internalType": "uint256[2][2]",
            "name": "_pB",
            "type": "uint256[2][2]"
          },
          {
            "internalType": "uint256[2]",
            "name": "_pC",
            "type": "uint256[2]"
          },
          {
            "internalType": "uint256[12]",
            "name": "_pubSignals",
            "type": "uint256[12]"
          }
        ],
        "internalType": "struct IGameHub.VerifyData[]",
        "name": "data",
        "type": "tuple[]"
      },
      {
        "internalType": "uint256[]",
        "name": "params",
        "type": "uint256[]"
      },
      {
        "internalType": "address",
        "name": "player",
        "type": "address"
      }
    ],
    "name": "uploadScores",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
export { IGameCryptoRumble };
