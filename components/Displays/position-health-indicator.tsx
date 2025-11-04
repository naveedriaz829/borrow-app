"use client";
import Image from "next/image";
import { useTranslation } from "react-i18next";

const PositionHealthIndicator = ({
  borrowedAmt = 0n,
  innerPercentage = 0,
  outerPercentage = 100,
}: {
  borrowedAmt?: bigint;
  innerPercentage?: number;
  outerPercentage?: number;
}) => {
  const { t } = useTranslation();
  // Normalize percentages so values over 100% wrap correctly
  const normalizedInnerPercentage = innerPercentage === 100 ? 100 : innerPercentage % 100;

  const radius = 45;
  const strokeWidth = 1;
  const circumference = 2 * Math.PI * radius;
  const inner = 0.85;

  const innerOffset =
    circumference * inner -
    (normalizedInnerPercentage / 100) * (circumference * inner);
  const outerOffset = circumference - (outerPercentage / 100) * circumference;

  // console.log("borrowedAmt", borrowedAmt);
  return (
    <div className="relative size-[clamp(200px,80vw,310px)]">
      {/* Outer Circle Background */}
      <svg
        className="absolute top-0 left-0 w-full h-full"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r={radius}
          strokeWidth={strokeWidth * 1.5}
          stroke="#1C1C1E"
          fill="transparent"
        />
      </svg>
      <svg
        className="absolute top-0 left-0 w-full h-full"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r={radius}
          strokeWidth={strokeWidth}
          stroke="black"
          fill="transparent"
        />
      </svg>

      {/* Outer Circle Progress */}
      <svg
        className="absolute top-0 left-0 w-full h-full rotate-[-90deg]"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={outerOffset}
          strokeLinecap="round"
          stroke="url(#outerGradient)"
          fill="transparent"
        />
        <defs>
          <linearGradient id="outerGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9B3CFF" />
            <stop offset="100%" stopColor="#2D67FF" />
          </linearGradient>
        </defs>
      </svg>

      {/* Inner Circle Background */}
      <svg
        className="absolute top-0 left-0 w-full h-full"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r={radius * inner}
          strokeWidth={strokeWidth * 1.5}
          stroke="#1C1C1E"
          fill="transparent"
        />
      </svg>
      <svg
        className="absolute top-0 left-0 w-full h-full rotate-[-90deg]"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r={radius * inner}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference * inner}
          strokeDashoffset={0}
          strokeLinecap="round"
          stroke="black"
          fill="transparent"
        />
      </svg>

      {/* Inner Circle Progress */}
      <svg
        className="absolute top-0 left-0 w-full h-full rotate-[-90deg]"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r={radius * inner}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference * inner}
          strokeDashoffset={innerOffset}
          strokeLinecap="round"
          stroke={`url(#innerGradient)`}
          fill="transparent"
        />
        <defs>
          <linearGradient id="innerGradient" x1="0" y1="0" x2="1" y2="1">
            {normalizedInnerPercentage <= 50 ? (
              <>
                <stop offset="0%" stopColor="#FF6669" />
                <stop offset="50%" stopColor="#FB1543" />
                <stop offset="100%" stopColor="#FF6669" />
              </>
            ) : null}
            {40 < normalizedInnerPercentage &&
            normalizedInnerPercentage <= 80 ? (
              <>
                <stop offset="0%" stopColor="#FFE278" />
                <stop offset="50%" stopColor="#EF8E3A" />
                <stop offset="100%" stopColor="#FFE278" />
              </>
            ) : null}
            {80 < normalizedInnerPercentage ? (
              <>
                <stop offset="0%" stopColor="#70FFB5" />
                <stop offset="50%" stopColor="#5CFFAB" />
                <stop offset="100%" stopColor="#70FFB5" />
                <stop offset="150%" stopColor="#00ACAF" />
              </>
            ) : null}
          </linearGradient>
        </defs>
      </svg>

      {/* Percentage Label */}
      <div className="absolute inset-0 flex items-center justify-center text-xl gap-1">
        {!borrowedAmt || borrowedAmt <= 100n ? (
          <>
            <h3 className="text-[#AEAEB2] font-[PolySans] font-thin w-2/3 text-center">
              {t('positionHealth.indicator.noLoans')}
            </h3>
          </>
        ) : null}
        {borrowedAmt && borrowedAmt > 100n && 0 <= normalizedInnerPercentage && normalizedInnerPercentage <= 50 ? (
          <>
            <Image
              src="bulletpoints/risk.svg"
              alt={t('positionHealth.indicator.status.low')}
              width={17}
              height={17}
            />
            <h3 className="text-[#FF6669] font-[PolySans] font-thin">
              {t('positionHealth.indicator.status.low')}
            </h3>
          </>
        ) : null}
        {borrowedAmt && borrowedAmt > 100n && 50 < normalizedInnerPercentage && normalizedInnerPercentage <= 80 ? (
          <>
            <Image
              src="bulletpoints/caution.svg"
              alt={t('positionHealth.indicator.status.medium')}
              width={17}
              height={17}
            />
            <h3 className="text-[#FEA85D] font-[PolySans] font-thin">
              {t('positionHealth.indicator.status.medium')}
            </h3>
          </>
        ) : null}
        {borrowedAmt && borrowedAmt > 100n && 80 < normalizedInnerPercentage ? (
          <>
            <Image
              src="bulletpoints/safe.svg"
              alt={t('positionHealth.indicator.status.good')}
              width={17}
              height={17}
            />
            <h3 className="text-[#5CFFAB] font-[PolySans] font-thin">
              {t('positionHealth.indicator.status.good')}
            </h3>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default PositionHealthIndicator;
