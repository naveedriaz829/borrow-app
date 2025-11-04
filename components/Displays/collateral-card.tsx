"use client";
import { useMemo, useState } from "react";
import { FaDiamond } from "react-icons/fa6";
import Deposit from "./Modals/deposit";
import Withdraw from "./Modals/withdraw";
import Image from "next/image";
import InfoCollateral from "../InfoModals/collateral-info";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { usePositionHealth } from "@/hooks/usePositionHealth";
import { formatWLD } from "@/lib/format";
import { AccrualPosition } from "@morpho-org/blue-sdk";
import { useTransactionState } from "@/contexts/TransactionContext";
import { useTranslation } from "react-i18next";

export default function CollateralCard({
  position,
}: {
  position?: AccrualPosition;
}) {
  const { t } = useTranslation();
  const [openDeposit, setOpenDeposit] = useState<boolean>(false);
  const [openWithdraw, setOpenWithdraw] = useState<boolean>(false);
  const { healthPercentage, collateralPercentage, borrowPercentage } =
    usePositionHealth(position);
  const [openInfo, setOpenInfo] = useState<boolean>(false);
  const { updateTxnID } = useTransactionState();
  const wldDisplay = useMemo(() => (formatWLD(position?.collateral ?? 0n)).slice(0, -2), [position?.collateral]);

  // Get diamond color based on position health
  const getDiamondColor = useMemo(() => {
    if (healthPercentage >= 80) return "#5CFFAB"; // Green - Safe (LTV <= 72%)
    if (healthPercentage > 50) return "#FEA85D"; // Orange - Moderate risk (approaching liquidation)
    if (healthPercentage > 0) return "#FF7073"; // Red - High risk (close to liquidation)
    return "#48484A"; // Gray - Liquidated
  }, [healthPercentage]);

  return (
    <span className="relative font-sans flex flex-col items-center border border-[#3A3A3C] border-opacity-50 rounded-2xl w-full">
      {openDeposit ? (
        <Deposit closeDeposit={() => setOpenDeposit(false)} />
      ) : null}
      {openWithdraw ? (
        <Withdraw closeWithdraw={() => setOpenWithdraw(false)} />
      ) : null}
      <InfoCollateral trigger={setOpenInfo} isVisible={openInfo} />
      <span className="flex flex-col px-[15px] py-[calc(2vh)] text-[clamp(12px,3.7vw,15px)] font-light w-full rounded-t-2xl">
        <div className="flex justify-between w-full">
          <div className="flex gap-2 items-center">
            <FaDiamond size={8} color={getDiamondColor} />
            <p>{t('dashboard.collateral.healthScore')}</p>
            <p className="text-[#AEAEB2]">{healthPercentage}</p>
            <button onClick={() => setOpenInfo(true)}>
              <IoIosInformationCircleOutline size={16} color="#AEAEB2" />
            </button>
          </div>
          <p>{wldDisplay} {t('dashboard.collateral.currency.wld')}</p>
        </div>
        <p className="w-full text-end text-[#AEAEB2] text-[clamp(12px,3.7vw,13px)]">{t('dashboard.collateral.title')}</p>
      </span>

      <span
        className={`font-sans flex items-start justify-evenly font-medium text-[clamp(12px,3.7vw,13px)] bg-[#191919] rounded-b-2xl w-full text-[${getDiamondColor}]`}
      >
        <button
          onClick={() => {
            setOpenDeposit(true);
            updateTxnID("");
          }}
          className="flex justify-center items-center w-full py-[calc(1.7vh)]"
        >
          <p>{t('dashboard.collateral.deposit')}</p>
        </button>
        <button
          onClick={() => {
            setOpenWithdraw(true);
            updateTxnID("");
          }}
          className="flex border-l border-black justify-center items-center w-full py-[calc(1.7vh)]"
        >
          <p>{t('dashboard.collateral.withdraw')}</p>
        </button>
      </span>
    </span>
  );
}
