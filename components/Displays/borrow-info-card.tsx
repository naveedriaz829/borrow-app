"use client";
import Image from "next/image";
import DollarSign from "@/components/icons/dollarsign.png";
import { FaDiamond } from "react-icons/fa6";
import { useMaxBorrowAmount } from "@/hooks/useMaxBorrowAmount";
import { useWLDPrice } from "@/hooks/useWLDPrice";
import type { AccrualPosition } from "@morpho-org/blue-sdk";
import { formatUSD } from "@/lib/format";
import { useTranslation } from "react-i18next";

export default function BorrowCard({ position, isInput = false, percent, isBorrowing = false, updateMax }: { position: AccrualPosition | undefined, isInput?: boolean, percent?: number, isBorrowing?: boolean, updateMax?: (string: string) => void }) {
  const { t } = useTranslation();
  const { maxBorrowAmountWLDUI, maxBorrowAmountUSDUI } = useMaxBorrowAmount();
  const { data: wldPrice } = useWLDPrice();

  const isLoading = !wldPrice;
  const usdDisplay = isLoading ? t('common.loading') : maxBorrowAmountUSDUI;
  const wldDisplay = isLoading ? t('common.loading') : maxBorrowAmountWLDUI;

  return (
    <span className={`font-sans flex flex-col items-center rounded-2xl w-full ${isBorrowing ? "" : "border border-[#3A3A3C] border-opacity-50"}`}>
      {!isBorrowing ? <span className="flex justify-between px-[15px] py-[calc(2vh)] text-[clamp(12px,3.7vw,15px)] font-light w-full rounded-t-2xl">
        <div className="flex gap-2 items-center">
          {percent == 0 ? (
            <>
              <FaDiamond size={8} color="#AEAEB2" />
            </>
          ) : (
            <FaDiamond size={8} color="#8D71FF" />
          )}

          <p>{t('dashboard.borrow.borrowed')}</p>
          <p className="text-secondary-gray">{percent}.0%</p>
        </div>
        <p>{formatUSD(position?.borrowAssets ?? 0n)} {t('dashboard.borrow.currency.usd')}</p>
      </span>: null}

      <span className={`font-sans flex items-start justify-between bg-[#1C1C1E] text-white rounded-b-2xl w-full px-[15px] py-[calc(1.7vh)] ${isBorrowing ? "rounded-t-2xl border-t-[0.5px] border-[#3A3A3C]" : ""}`}>
        <div className="flex flex-col text-secondary-white text-[clamp(12px,3.7vw,15px)]">
          {t('dashboard.borrow.title')} {position?.borrowAssets && position.borrowAssets > 0n ? t('dashboard.borrow.more') : ""} {t('dashboard.borrow.upTo')}
          {position?.borrowAssets && position.borrowAssets > 0n && isInput ? (
            <button onClick={() => updateMax?.(usdDisplay)} className="text-[#8D71FF] text-start text-[clamp(12px,3.7vw,15px)]">
              {t('dashboard.borrow.max')}
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-1">
          <div className="flex flex-col">
            <span className=" text-secondary-white text-[clamp(13px,4.2vw,17px)]">
              ${usdDisplay} {t('dashboard.borrow.currency.usd')}
            </span>
            <span className="text-[#AEAEB2] text-end text-[clamp(12px,3.7vw,13px)]">
              {wldDisplay} {t('dashboard.borrow.currency.wld')}
            </span>
          </div>
          <div>
            <Image
              src={DollarSign}
              alt="WLD"
              height={35}
              width={35}
              className="w-[clamp(25px,8.7vw,35px)] h-[clamp(25px,8.7vw,35px)]"
            />
          </div>
        </div>
      </span>
    </span>
  );
}