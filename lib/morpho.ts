import { Market, MarketId, MathLib } from "@morpho-org/blue-sdk";
import "@morpho-org/blue-sdk-viem/lib/augment/Market";
import { SendTransactionInput } from "@worldcoin/minikit-js";
import {
  Address,
  encodeFunctionData,
  erc20Abi,
  PublicClient,
  Transport,
} from "viem";
import { worldchain } from "viem/chains";
import { MORPHO_BUNDLER_ABI } from "./morpho-bundler-abi";
import {
  MORPHO_BORROW_ABI,
  MORPHO_ERC20_TRANSFER_ABI,
  MORPHO_REPAY_ABI,
  MORPHO_SUPPLY_COLLATERAL_ABI,
  MORPHO_WITHDRAW_COLLATERAL_ABI,
} from "./morpho-general-adapter-abi";
import { MORPHO_ABI, MORPHO_IRM_ABI } from "./morpho-abi";

export const MORPHO_GENERAL_ADAPTER_ADDRESS =
  "0x30fa9a3cf56931aceea42e28d35519a97d90aa67";

export const MORPHO_BUNDLER_ADDRESS =
  "0x3d07bf2ffb23248034bf704f3a4786f1ffe2a448";

export const MORPHO_BLUE_ADDRESS = "0xE741BC7c34758b4caE05062794E8Ae24978AF432";

export const ORACLE_PRICE_SCALE = 10n ** 36n;

export const WAD = 10n ** 18n;

// Maximum LTV - has to stay below LLTV else liquidation occurs, this parameter
// "caps" the maximum loan for any user
export const LTV = BigInt("500000000000000000"); // 50%

export const LLTV = BigInt("770000000000000000"); // 77%

export const U256_MAX =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";

export const DEFAULT_SLIPPAGE_TOLERANCE = 300000000000000n;

export interface MorphoPosition {
  borrowedAmount: bigint;
  collateralAmount: bigint;
  healthFactor: number;
  maxBorrowableAmount: bigint;
}

/**
 * All of the methods work on the WLD/USDCe market, with predefined market
 * configuration.
 * LLTV at 77%, LTV at 72% - same as the Morpho app.
 */
export class Morpho {
  constructor(
    private publicClient: PublicClient<Transport, typeof worldchain>
  ) {}

  public marketConfig = {
    loanToken: "0x79a02482a880bce3f13e09da970dc34db4cd24d1",
    collateralToken: "0x2cfc85d8e48f8eab294be644d9e25c3030863003",
    oracle: "0x8006a014e828a458545e6613c4b35cd64b5143d5",
    irm: "0x34e99d604751a72cf8d0cfdf87069292d82de472",
    lltv: LLTV,
  } as const;

  public marketId =
    "0xba0ae12a5cdbf9a458566be68055f30c859771612950b5e43428a51becc6f6e9" as `0x${string}`;

  /**
   * Important: Liquidation occurs when a borrower's Loan-To-Value (LTV) exceeds
   * the Liquidation Loan-To-Value (LLTV) threshold.
   *
   * This method uses the 72%/77% LTV/LLTV same as the Morpho app. It might make
   * sense to provide a more gentle max borrowable amount, or send the users
   * notifications if the threshold approached ~75% - the half mark.
   *
   * @param collateralAmount - The amount of collateral to borrow against
   * @returns The maximum amount of loan tokens that can be borrowed
   */
  async getMaxBorrowableAmount(collateralAmount: bigint): Promise<bigint> {
    const price = await this.getWLDPrice();

    // Calculate collateral value in loan token units
    // COLLATERAL_VALUE_IN_LOAN_TOKEN = COLLATERAL_AMOUNT * ORACLE_PRICE / ORACLE_PRICE_SCALE
    const collateralValueInLoanToken =
      (collateralAmount * price) / ORACLE_PRICE_SCALE;

    // Calculate max borrowable amount based on MAX_LTV (72%)
    // MAX_BORROWABLE = COLLATERAL_VALUE_IN_LOAN_TOKEN * MAX_LTV / WAD
    const maxBorrowableAmount = (collateralValueInLoanToken * LTV) / WAD;

    return maxBorrowableAmount;
  }

  async getMaxSharePriceE27() {
    const market = await Market.fetch(
      this.marketId as MarketId,
      this.publicClient
    );
    return market.toBorrowAssets(
      MathLib.wToRay(MathLib.WAD + DEFAULT_SLIPPAGE_TOLERANCE)
    );
  }

  /**
   * Calculates the required collateral amount for a given borrow amount.
   * This is the inverse of getMaxBorrowableAmount.
   *
   * @param borrowAmount - The amount of loan tokens to borrow
   * @returns The required amount of WLD collateral
   */
  async getRequiredCollateralAmount(borrowAmount: bigint): Promise<bigint> {
    const price = await this.getWLDPrice();

    // Reverse the calculation from getMaxBorrowableAmount
    // borrowAmount = (collateralAmount * price / ORACLE_PRICE_SCALE) * MAX_LTV / WAD
    // Solving for collateralAmount:
    // collateralAmount = (borrowAmount * WAD * ORACLE_PRICE_SCALE) / (price * MAX_LTV)
    const requiredCollateralAmount =
      (borrowAmount * WAD * ORACLE_PRICE_SCALE) / (price * LTV);

    return requiredCollateralAmount;
  }

  /**
   * This method gets the price of WLD from the oracle for the WLD/USDCe market.
   */
  getWLDPrice(): Promise<bigint> {
    return this.publicClient.readContract({
      address: this.marketConfig.oracle,
      abi: [
        {
          type: "function",
          name: "price",
          inputs: [],
          outputs: [{ type: "uint256" }],
          stateMutability: "view",
        },
      ],
      functionName: "price",
      args: [],
    });
  }

  getAuthorizationStatus(onBehalf: Address): Promise<boolean> {
    console.log("getAuthorizationStatus....");
    return this.publicClient.readContract({
      address: MORPHO_BLUE_ADDRESS,
      abi: MORPHO_ABI,
      functionName: "isAuthorized",
      args: [onBehalf, MORPHO_GENERAL_ADAPTER_ADDRESS],
    }) as Promise<boolean>;
  }

  getMarketConfig(): Array<string> {
    return [
      this.marketConfig.loanToken,
      this.marketConfig.collateralToken,
      this.marketConfig.oracle,
      this.marketConfig.irm,
      this.marketConfig.lltv.toString(),
    ];
  }
  
  /**
   * Gets the current borrow rate from the IRM contract
   * @returns The current borrow rate as a bigint
   */
  async getBorrowRate(): Promise<bigint> {
    const market = await Market.fetch(
      this.marketId as MarketId,
      this.publicClient
    );
    
    return this.publicClient.readContract({
      address: this.marketConfig.irm,
      abi: MORPHO_IRM_ABI,
      functionName: "borrowRateView",
      args: [
        {
          loanToken: this.marketConfig.loanToken,
          collateralToken: this.marketConfig.collateralToken,
          oracle: this.marketConfig.oracle,
          irm: this.marketConfig.irm,
          lltv: this.marketConfig.lltv
        },
        {
          totalSupplyAssets: market.totalSupplyAssets,
          totalSupplyShares: market.totalSupplyShares,
          totalBorrowAssets: market.totalBorrowAssets,
          totalBorrowShares: market.totalBorrowShares,
          lastUpdate: market.lastUpdate,
          fee: market.fee
        }
      ]
    });
  }

  async borrow(
    collateralAmount: bigint,
    borrowAmount: bigint,
    onBehalf: Address
  ): Promise<SendTransactionInput> {
    const isAuthorized = await this.getAuthorizationStatus(onBehalf);
    console.log("borrow isAuthorized....", isAuthorized);
    const input = [
      {
        abi: erc20Abi,
        address: this.marketConfig.collateralToken,
        args: [MORPHO_GENERAL_ADAPTER_ADDRESS, collateralAmount.toString()],
        functionName: "transfer",
      },
      {
        abi: MORPHO_BUNDLER_ABI,
        address: MORPHO_BUNDLER_ADDRESS,
        args: [
          this.createBorrowBundle(collateralAmount, borrowAmount, onBehalf),
        ],
        functionName: "multicall",
        value: "0x0",
      },
    ];

    if (!isAuthorized) {
      return {
        transaction: [
          {
            abi: MORPHO_ABI,
            address: MORPHO_BLUE_ADDRESS,
            args: [MORPHO_GENERAL_ADAPTER_ADDRESS, true],
            functionName: "setAuthorization",
          },
          ...input,
        ],
      };
    } else {
      return {
        transaction: input,
      };
    }
  }

  createBorrowBundle(
    collateralAmount: bigint,
    borrowAmount: bigint,
    onBehalf: Address
  ) {
    const borrowInput = {
      to: MORPHO_GENERAL_ADAPTER_ADDRESS,
      data: encodeFunctionData({
        abi: MORPHO_BORROW_ABI,
        functionName: "morphoBorrow",
        args: [
          this.getMarketConfig(),
          borrowAmount.toString(),
          0n.toString(),
          0n.toString(),
          onBehalf,
        ],
      }),
      value: "0x0",
      skipRevert: false,
      callbackHash:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
    }

    if (collateralAmount === 0n) {
      return [borrowInput];
    }
    
    return [
      {
        to: MORPHO_GENERAL_ADAPTER_ADDRESS,
        data: encodeFunctionData({
          abi: MORPHO_SUPPLY_COLLATERAL_ABI,
          functionName: "morphoSupplyCollateral",
          args: [
            this.getMarketConfig(),
            collateralAmount.toString(),
            onBehalf,
            "0x",
          ],
        }),
        value: "0x0",
        skipRevert: false,
        callbackHash:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
      },
      borrowInput,
    ];
  }

  createRepayBundle(
    loanAmount: string,
    onBehalf: Address,
    maxSharePriceE27: string
  ) {
    return [
      {
        to: MORPHO_GENERAL_ADAPTER_ADDRESS,
        data: encodeFunctionData({
          abi: MORPHO_REPAY_ABI,
          functionName: "morphoRepay",
          args: [
            this.getMarketConfig(), // marketParams
            loanAmount.toString(), // assets
            0n.toString(), // shares
            maxSharePriceE27,
            onBehalf,
            "0x", // data
          ],
        }),
        value: "0x0",
        skipRevert: false,
        callbackHash:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
      },
      {
        to: MORPHO_GENERAL_ADAPTER_ADDRESS,
        data: encodeFunctionData({
          abi: MORPHO_ERC20_TRANSFER_ABI,
          functionName: "erc20Transfer",
          args: [this.marketConfig.loanToken, onBehalf, U256_MAX],
        }),
        value: "0x0",
        skipRevert: true,
        callbackHash:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
      },
    ];
  }

  createSupplyCollateralBundle(collateralAmount: string, onBehalf: Address) {
    return [
      {
        to: MORPHO_GENERAL_ADAPTER_ADDRESS,
        data: encodeFunctionData({
          abi: MORPHO_SUPPLY_COLLATERAL_ABI,
          functionName: "morphoSupplyCollateral",
          args: [this.getMarketConfig(), collateralAmount, onBehalf, "0x"],
        }),
        value: "0x0",
        skipRevert: false,
        callbackHash:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
      },
    ];
  }

  // TODO handle frictional
  createWithdrawCollateralBundle(collateralAmount: string, onBehalf: Address) {
    return [
      {
        to: MORPHO_GENERAL_ADAPTER_ADDRESS,
        data: encodeFunctionData({
          abi: MORPHO_WITHDRAW_COLLATERAL_ABI,
          functionName: "morphoWithdrawCollateral",
          args: [this.getMarketConfig(), collateralAmount, onBehalf],
        }),
        value: "0x0",
        skipRevert: false,
        callbackHash:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
      },
      {
        to: MORPHO_GENERAL_ADAPTER_ADDRESS,
        data: encodeFunctionData({
          abi: MORPHO_ERC20_TRANSFER_ABI,
          functionName: "erc20Transfer",
          args: [this.marketConfig.loanToken, onBehalf, U256_MAX],
        }),
        value: "0x0",
        skipRevert: true,
        callbackHash:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
      },
    ];
  }

  async repay(
    loanAmount: string,
    onBehalf: Address
  ): Promise<SendTransactionInput> {
    const maxSharePriceE27 = await this.getMaxSharePriceE27();
    return {
      transaction: [
        {
          abi: erc20Abi,
          address: this.marketConfig.loanToken,
          args: [MORPHO_GENERAL_ADAPTER_ADDRESS, loanAmount],
          functionName: "transfer",
        },
        {
          abi: MORPHO_BUNDLER_ABI,
          address: MORPHO_BUNDLER_ADDRESS,
          args: [
            this.createRepayBundle(
              loanAmount,
              onBehalf,
              maxSharePriceE27.toString()
            ),
          ],
          functionName: "multicall",
          value: "0x0",
        },
      ],
    };
  }

  supplyCollateral(
    collateralAmount: string,
    onBehalf: Address
  ): SendTransactionInput {
    return {
      transaction: [
        {
          abi: erc20Abi,
          address: this.marketConfig.collateralToken,
          args: [MORPHO_GENERAL_ADAPTER_ADDRESS, collateralAmount.toString()],
          functionName: "transfer",
        },
        {
          abi: MORPHO_BUNDLER_ABI,
          address: MORPHO_BUNDLER_ADDRESS,
          args: [this.createSupplyCollateralBundle(collateralAmount, onBehalf)],
          functionName: "multicall",
          value: "0x0",
        },
      ],
    };
  }

  async withdrawCollateral(
    collateralAmount: string,
    onBehalf: Address
  ): Promise<SendTransactionInput> {
    const isAuthorized = await this.getAuthorizationStatus(onBehalf);
    const input = [
      {
        abi: MORPHO_BUNDLER_ABI,
        address: MORPHO_BUNDLER_ADDRESS,
        args: [
          this.createWithdrawCollateralBundle(collateralAmount, onBehalf),
        ],
        functionName: "multicall",
        value: "0x0",
      },
    ];

    if (!isAuthorized) {
      return {
        transaction: [
          {
            abi: MORPHO_ABI,
            address: MORPHO_BLUE_ADDRESS,
            args: [MORPHO_GENERAL_ADAPTER_ADDRESS, true],
            functionName: "setAuthorization",
          },
          ...input,
        ],
      };
    } else {
      return {
        transaction: input,
      };
    }
  }
  createCollateralBundle(collateralAmount: bigint, onBehalf: Address) {
    return [
      {
        to: MORPHO_GENERAL_ADAPTER_ADDRESS,
        data: encodeFunctionData({
          abi: MORPHO_SUPPLY_COLLATERAL_ABI,
          functionName: "morphoSupplyCollateral",
          args: [
            this.getMarketConfig(),
            collateralAmount.toString(),
            onBehalf,
            "0x",
          ],
        }),
        value: "0x0",
        skipRevert: false,
        callbackHash:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
      },
    ];
  }
}
