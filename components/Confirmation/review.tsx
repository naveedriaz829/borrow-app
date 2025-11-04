"use client";
import { BiChevronLeft } from "react-icons/bi";
import SwipeButton from "../Buttons/swipe-button";
import { useBorrowAPY } from "@/hooks/useBorrowAPY";
import { useTranslation } from "react-i18next";

function Review({
  amount,
  onBack,
  swipeText,
  onConfirm,
  isRepay = false,
  collateralAmount,
  collateralSymbol = "WLD",
}: {
  amount: string;
  onBack: () => void;
  swipeText: string;
  onConfirm: () => void;
  isRepay?: boolean;
  collateralAmount?: string;
  collateralSymbol?: string;
}) {
  const { t } = useTranslation();
  const { data: borrowAPY } = useBorrowAPY();
  const apyPercent = borrowAPY ? (Number(borrowAPY) * 100).toFixed(2) : "0.00";
  // console.log("borrowAPY: ", borrowAPY);
  return (
    <div className="absolute flex flex-col justify-between bg-clip-border bg-dash-gray w-full h-full">
      <span className="relative">
        <button className="absolute p-6 top-[13px]" onClick={onBack}>
          <BiChevronLeft size={30} />
        </button>
        <h3 className="text-center font-['PolySans'] text-2xl py-10">
          {t('review.title')}
        </h3>
      </span>
      <div
        className={`flex flex-col ${isRepay ? "" : "h-full justify-between"}`}
      >
        <span
          className={`text-center mx-12 flex flex-col gap-2 ${
            isRepay ? "" : "pt-10"
          }`}
        >
          <h2 className="font-['PolySans'] text-[clamp(16px,5.5vw,24px)] leading-snug">
            <span className="bg-gradient-to-br from-[#9B3CFF] to-[#2D67FF] bg-clip-text text-transparent">
              {t('review.about.youAreAbout')} {isRepay ? t('review.about.toRepay') : t('review.about.toBorrow')}
            </span>
          </h2>
          <h2 className="font-['PolySans'] text-white font-bold text-[clamp(24px,9vw,40px)] leading-tight">
            ${amount} USD
          </h2>
          {isRepay ? null : (
          <h2 className="font-['PolySans'] text-[clamp(16px,5.5vw,24px)] leading-snug">
              <span className="bg-gradient-to-br from-[#9B3CFF] to-[#2D67FF] bg-clip-text text-transparent">
                {t('review.about.byUsing')}
              </span>{' '}
              <br></br>
              <span className="font-['PolySans'] text-white font-bold text-[clamp(24px,9vw,40px)] leading-tight">
                {collateralAmount ? `${collateralAmount} ${collateralSymbol}` : t('review.loading')}
              </span>{' '}
              <br></br>
              <span className="bg-gradient-to-br from-[#9B3CFF] to-[#2D67FF] bg-clip-text text-transparent">
                {t('review.about.asCollateral')}
              </span>
            </h2>
          )}
        </span>
        {isRepay ? null : (
          <span className="mx-6 border-t border-[#2C2C2E] font-light text-[15px] text-[#AEAEB2] flex justify-between py-4">
            <p>{t('review.apy')}</p>
            <p>{apyPercent}%</p>
          </span>
        )}
      </div>
      <div className="h-1/6 flex flex-col">
        <span className="w-full h-[1px] bg-gradient-to-r from-[#7D0BF4] via-[#1A26E7] to-[#0D4BEF]"></span>
        <span className="bg-theme-2 h-full flex justify-center items-start">
          <div className="mt-[15px] mb-[52px] w-full px-[24px]">
            <SwipeButton text={swipeText} onConfirm={onConfirm} />
          </div>
        </span>
      </div>
    </div>
  );
}

export default Review;
