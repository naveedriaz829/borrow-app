import { formatUSD } from "@/lib/format";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useMorpho } from "./useMorpho";
import { useMorphoPosition } from "./useMorphoPosition";
import { useWLDPrice } from "./useWLDPrice";

export const useMaxBorrowAmount = () => {
  const position = useMorphoPosition();
  const { ready, getMaxBorrowAmountBasedOnBalance } = useMorpho();
  const { data: wldPrice } = useWLDPrice();

  const { data: maxBorrowAmount } = useQuery({
    queryKey: ["max-borrow-amount", position?.maxBorrowableAssets?.toString(), position?.collateralValue?.toString()],
    queryFn: async () => {
      let maxBorrowAmountBasedOnBalance =
        await getMaxBorrowAmountBasedOnBalance();
      /*
      Note: 
        maxBorrowAmountBasedOnBalance is based on WLD balance of user
        maxBorrowBasedOnExistingCollateral is based on collateral of user in morpho position
        total Max borrowable is maxBorrowAmountBasedOnBalance - maxBorrowBasedOnExistingCollateral if there is already some borrowable amount left based on the current position

        Handle this calculation in calculateCollateral function
        path: app/Borrow/page/Borrow/calculateCollateral
      */
      const totalCollateralInLoanAsset = position?.collateralValue || 0n;
      const maxBorrowBasedOnExistingCollateralForLLTV = position?.maxBorrowableAssets || 0n;
      const adjustmentForLTV = (totalCollateralInLoanAsset * 27n) / 100n;
      const maxBorrowAdjustedForLTV = (maxBorrowBasedOnExistingCollateralForLLTV - adjustmentForLTV) < 0n ? 0n : maxBorrowBasedOnExistingCollateralForLLTV - adjustmentForLTV;

      const totalMaxBorrowable = maxBorrowAmountBasedOnBalance + (maxBorrowAdjustedForLTV ? maxBorrowAdjustedForLTV : 0n);
      return {maxBorrowAmountBasedOnBalance, maxBorrowAdjustedForLTV, totalMaxBorrowable};
    },
    enabled: !!position && ready,
  });

  const maxBorrowAmountWLDUI = useMemo(() => {
    if (!maxBorrowAmount) {
      return 0n;
    }
    const wldPriceUI = Number(wldPrice || 0n) / 10e23;
    return (Number(formatUSD(maxBorrowAmount.totalMaxBorrowable)) / wldPriceUI).toFixed(4);
  }, [maxBorrowAmount, wldPrice]);

  const maxBorrowAmountUSDUI = useMemo(() => {
    return formatUSD(maxBorrowAmount?.totalMaxBorrowable || 0n);
  }, [maxBorrowAmount]);

  return {
    maxBorrowAmount,
    maxBorrowAmountWLDUI,
    maxBorrowAmountUSDUI,
  };
};
