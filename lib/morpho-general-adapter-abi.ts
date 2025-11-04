export const MORPHO_BORROW_ABI = [
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "loanToken", type: "address" },
          { internalType: "address", name: "collateralToken", type: "address" },
          { internalType: "address", name: "oracle", type: "address" },
          { internalType: "address", name: "irm", type: "address" },
          { internalType: "uint256", name: "lltv", type: "uint256" },
        ],
        internalType: "struct MarketParams",
        name: "marketParams",
        type: "tuple",
      },
      { internalType: "uint256", name: "assets", type: "uint256" },
      { internalType: "uint256", name: "shares", type: "uint256" },
      { internalType: "uint256", name: "minSharePriceE27", type: "uint256" },
      { internalType: "address", name: "receiver", type: "address" },
    ],
    name: "morphoBorrow",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export const MORPHO_REPAY_ABI = [
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "loanToken", type: "address" },
          { internalType: "address", name: "collateralToken", type: "address" },
          { internalType: "address", name: "oracle", type: "address" },
          { internalType: "address", name: "irm", type: "address" },
          { internalType: "uint256", name: "lltv", type: "uint256" },
        ],
        internalType: "struct MarketParams",
        name: "marketParams",
        type: "tuple",
      },
      { internalType: "uint256", name: "assets", type: "uint256" },
      { internalType: "uint256", name: "shares", type: "uint256" },
      { internalType: "uint256", name: "maxSharePriceE27", type: "uint256" },
      { internalType: "address", name: "onBehalf", type: "address" },
      { internalType: "bytes", name: "data", type: "bytes" },
    ],
    name: "morphoRepay",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export const MORPHO_WITHDRAW_COLLATERAL_ABI = [
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "loanToken", type: "address" },
          { internalType: "address", name: "collateralToken", type: "address" },
          { internalType: "address", name: "oracle", type: "address" },
          { internalType: "address", name: "irm", type: "address" },
          { internalType: "uint256", name: "lltv", type: "uint256" },
        ],
        internalType: "struct MarketParams",
        name: "marketParams",
        type: "tuple",
      },
      { internalType: "uint256", name: "assets", type: "uint256" },
      { internalType: "address", name: "receiver", type: "address" },
    ],
    name: "morphoWithdrawCollateral",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export const MORPHO_SUPPLY_COLLATERAL_ABI = [
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "loanToken", type: "address" },
          { internalType: "address", name: "collateralToken", type: "address" },
          { internalType: "address", name: "oracle", type: "address" },
          { internalType: "address", name: "irm", type: "address" },
          { internalType: "uint256", name: "lltv", type: "uint256" },
        ],
        internalType: "struct MarketParams",
        name: "marketParams",
        type: "tuple",
      },
      { internalType: "uint256", name: "assets", type: "uint256" },
      { internalType: "address", name: "onBehalf", type: "address" },
      { internalType: "bytes", name: "data", type: "bytes" },
    ],
    name: "morphoSupplyCollateral",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export const MORPHO_ERC20_TRANSFER_ABI = [
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "address", name: "receiver", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "erc20Transfer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
