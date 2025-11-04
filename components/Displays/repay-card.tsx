"use client";
import DollarSign from "@/components/icons/dollarsign.png";
import { useMorphoPosition } from "@/hooks/useMorphoPosition";
import { useUSDCBalance } from "@/hooks/useUSDCBalance";
import { formatUSD } from "@/lib/format";
import Image from "next/image";
import { useTranslation } from "react-i18next";

interface RepayCardProps {
  updateMax: (amount: string) => void;
}

export default function RepayCard({ updateMax }: RepayCardProps) {
  const { t } = useTranslation();
  const position = useMorphoPosition();

  const borrowedUSD = position?.borrowAssets ?? 0n;
  const borrowedUSDString = formatUSD(borrowedUSD);
  
  const { data  } = useUSDCBalance();
  const usdcBalance = data ?? 0n;
  const usdcBalanceString = formatUSD(usdcBalance);

  const maxAmount = borrowedUSD < usdcBalance ? borrowedUSD: usdcBalance;
  const maxAmountString = formatUSD(maxAmount);
  return (
    <div className="font-sans flex items-start justify-between bg-[#191919] text-white rounded-2xl px-4 py-2 w-full h-[64px] shadow-lg border-t border-[#3A3A3C] border-opacity-50">
      <span className="flex flex-col text-secondary-white text-[clamp(12px,3.7vw,15px)]">
        {t('repay.card.borrowedAmount')}
        <button
          onClick={() => updateMax(maxAmountString)}
          className="text-[#8D71FF] text-start text-[clamp(12px,3.7vw,15px)]"
        >
          {t('repay.card.max')}
        </button>
      </span>
      <div className="flex items-center gap-2">
        <span className=" text-secondary-white text-[clamp(13px,4.2vw,17px)]">
         <div className="flex flex-col text-end">
          ${formatUSD(borrowedUSD)} USD
          <p className="text-[clamp(12px,3.7vw,13px)] text-[#AEAEAE]">
            {t('repay.card.available')}: {usdcBalanceString} USD
          </p>
         </div>
        </span>
        
        <div>
          <Image src={DollarSign} alt="WLD" height={35} width={35} />
        </div>
      </div>
    </div>
  );
}
