import { formatEther, formatUnits, parseUnits } from "viem";

export const formatUSD = (value: bigint) => {
  try {
    // USDC has 6 decimals
    const formatted = formatUnits(value, 6);
    return Number(formatted).toFixed(2);
  } catch {
    return "0.00";
  }
};

export const formatWLD = (value: bigint) => {
  try {
    // WLD has 18 decimals
    const formatted = formatEther(value);
    return Number(formatted).toFixed(4);
  } catch {
    return "0.00";
  }
};

export const parseUSD = (value: string): bigint => {
  try {
    // Remove any commas and handle empty strings
    const cleanValue = value.replace(/,/g, "");
    if (!cleanValue || cleanValue === ".") return 0n;

    // Convert to number and handle decimals properly
    const num = Number(cleanValue);
    if (isNaN(num)) return 0n;

    // Convert to bigint with 6 decimals for USDC
    return parseUnits(num.toString(), 6);
  } catch {
    return 0n;
  }
};
