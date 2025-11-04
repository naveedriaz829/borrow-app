import { LLTV, LTV } from "./morpho";

const WAD = 10n ** 18n;
const ORACLE_PRICE_SCALE = 10n ** 36n;

export interface LTVCalculationParams {
  borrowedAmount: bigint;
  collateralAmount: bigint;
  wldPrice: bigint;
}

/**
 * Calculates the current Loan-to-Value ratio of a position
 *
 * @param params - Object containing borrowed amount, collateral amount, and WLD price
 * @returns Current LTV as a bigint with 18 decimals (e.g., 720000000000000000n = 72%)
 */
export function calculateCurrentLTV(params: LTVCalculationParams): bigint {
  const { borrowedAmount, collateralAmount, wldPrice } = params;

  // If no borrowed amount, LTV is 0
  if (borrowedAmount === 0n) {
    return 0n;
  }

  // If no collateral, LTV is infinite (liquidated)
  if (collateralAmount === 0n) {
    return LLTV; // Return LLTV to indicate liquidation
  }

  // Calculate collateral value in loan token units
  // COLLATERAL_VALUE_IN_LOAN_TOKEN = COLLATERAL_AMOUNT * ORACLE_PRICE / ORACLE_PRICE_SCALE
  const collateralValueInLoanToken =
    (collateralAmount * wldPrice) / ORACLE_PRICE_SCALE;

  // Calculate current LTV
  // CURRENT_LTV = BORROWED_AMOUNT * WAD / COLLATERAL_VALUE_IN_LOAN_TOKEN
  const currentLTV = (borrowedAmount * WAD) / collateralValueInLoanToken;

  return currentLTV;
}

/**
 * Calculates the position health based on Morpho's LTV thresholds
 *
 * @param params - Object containing borrowed amount, collateral amount, and WLD price
 * @returns Position health as a number between 0 and 100
 *          - 100 = Healthy (LTV <= 72%)
 *          - 0-100 = Deteriorating health as LTV approaches 77%
 *          - 0 = Liquidated (LTV >= 77%)
 */
export function calculatePositionHealth(params: LTVCalculationParams): number {
  const currentLTV = calculateCurrentLTV(params);

  // If current LTV is at or above LLTV (77%), position is liquidated
  if (currentLTV >= LLTV) {
    return 0;
  }

  // If current LTV is at or below LTV (50%), position is healthy
  if (currentLTV <= LTV) {
    return 100;
  }

  // Between LTV (50%) and LLTV (77%): health deteriorates from 100% to 0%
  // Health = (LLTV - currentLTV) / (LLTV - LTV) * 100
  const healthRatio = ((LLTV - currentLTV) * WAD) / (LLTV - LTV);
  const healthPercentage = Number((healthRatio * 100n) / WAD);

  return Math.max(0, Math.min(100, healthPercentage));
}

/**
 * Calculates the percentage of borrowed amount relative to the total LTV range
 *
 * @param params - Object containing borrowed amount, collateral amount, and WLD price
 * @returns Borrowed percentage as a number between 0 and 100
 */
export function calculateBorrowedPercentage(
  params: LTVCalculationParams
): number {
  const currentLTV = calculateCurrentLTV(params);

  const borrowedPercentage = Number((currentLTV * 100n) / WAD);
  console.log("borrowedPercentage: ", borrowedPercentage);
  return Math.max(0, Math.min(100, borrowedPercentage));
}
