const IGameHub = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "player",
        "type": "address"
      }
    ],
    "name": "maxScore",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "uint256[]",
        "name": "params",
        "type": "uint256[]"
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
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "game",
        "type": "address"
      }
    ],
    "name": "registerGame",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      }
    ],
    "name": "top10",
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
        "internalType": "struct IGameHub.GameScore[10]",
        "name": "",
        "type": "tuple[10]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
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
      }
    ],
    "name": "uploadScores",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
export { IGameHub };
