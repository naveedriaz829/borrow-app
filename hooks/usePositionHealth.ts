import { calculateBorrowedPercentage, calculatePositionHealth } from "@/lib/ltv";
import type { AccrualPosition } from "@morpho-org/blue-sdk";
import { useMemo } from "react";
import { useWLDPrice } from "./useWLDPrice";

export function usePositionHealth(position?: AccrualPosition) {
  const { data: wldPrice } = useWLDPrice();
  // console.log("position usePositionHealth:: ", position);
  // console.log("wldPrice usePositionHealth:: ", wldPrice);

  // console.log("position.borrowAssets usePositionHealth:: ", position?.borrowAssets);
  // console.log("position.collateral usePositionHealth:: ", position?.collateral);

  const positionHealth = useMemo(() => {
    if (!position || !wldPrice) {
      return 100; // No position = healthy
    }

    // If no borrowed amount, position is healthy
    if (!position.borrowAssets || position.borrowAssets < 10000n) {
      return 100;
    }

    // If no collateral but has borrowing, position is liquidated
    if (!position.collateral || position.collateral < 10000n) {
      return 0;
    }

    return calculatePositionHealth({
      borrowedAmount: position.borrowAssets,
      collateralAmount: position.collateral,
      wldPrice,
    });
  }, [position?.borrowAssets, position?.collateral, wldPrice]);

  const collateralPercentage = useMemo(() => {
    if (!position) return 0;
    if (position.supplyAssets < 10000n) return 0;
    if (position.collateral < 10000n) return 0;

    // Convert to number before multiplication to avoid bigint type error
    return Number(position.collateral) / Number(position.supplyAssets) * 100;
  }, [position, position?.collateral, position?.supplyAssets]);

  const borrowPercentage = useMemo(() => {
    if (!position) return 0;
    if (position.collateral < 10000n) return 0;
    if (position.borrowAssets < 10000n) return 0;

    return calculateBorrowedPercentage({
      borrowedAmount: position.borrowAssets,
      collateralAmount: position.collateral,
      wldPrice: wldPrice ?? 0n,
    });
  }, [position?.borrowAssets, position?.collateral]);


  return {
    healthPercentage: Math.round(positionHealth),
    collateralPercentage: Math.round(collateralPercentage),
    borrowPercentage: Math.round(Number(borrowPercentage)),
  };
}
