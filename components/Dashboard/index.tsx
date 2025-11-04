"use client";
import Loading from "@/components/LoadApp/default-loader";
import { useMorphoPosition } from "@/hooks/useMorphoPosition";
import { usePositionHealth } from "@/hooks/usePositionHealth";
import { useUserAddress } from "@/hooks/useUser";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeButton from "../Buttons/theme-pill";
import BorrowCard from "../Displays/borrow-info-card";
import CollateralCard from "../Displays/collateral-card";
import PositionHealthIndicator from "../Displays/position-health-indicator";
import InfoPositionHealth from "../InfoModals/position-health";
import type { AccrualPosition } from "@morpho-org/blue-sdk";
import { BiGlobe } from "react-icons/bi";
import LanguageDrawer from "../Drawers/LanguageDrawer";
import { useTranslation } from "react-i18next";

function Dashboard() {
  const { t } = useTranslation();
  const [info, setInfo] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);
  const position: AccrualPosition | undefined = useMorphoPosition();
  const positionHealth = usePositionHealth(position);
  const { userAddress } = useUserAddress();
  const [isLanguageDrawerVisible, setIsLanguageDrawerVisible] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading during SSR and until client-side hydration is complete
  if (!mounted || !userAddress) {
    return <Loading />;
  }

  const triggerInfo = () => {
    setInfo(!info);
  };
  // console.log("positionHealth", positionHealth);
  // console.log("position", position);

  return (
    <div className="w-full flex flex-col h-full justify-between relative rounded-t-[20px] text-white">
      <div className="absolute z-10 right-[20.5px] top-[28px]">
        <BiGlobe onClick={() => setIsLanguageDrawerVisible(true)} className="text-white text-[24px] cursor-pointer" />
      </div>
      <span className={`w-screen h-screen absolute top-0 left-0 bg-black/50 ${isLanguageDrawerVisible ? "z-10" : "hidden"}`}></span>
      <LanguageDrawer onClose={() => setIsLanguageDrawerVisible(false)} isVisible={isLanguageDrawerVisible} />
      <InfoPositionHealth trigger={setInfo} isVisible={info} />
      <div className="w-full flex justify-center items-center">
        <span className="relative text-[clamp(13px,4.7vw,17px)] pt-[calc(3.2vh)]">
          <h1>{t('dashboard.positionHealth.title')}</h1>
          <button
          className="absolute -right-[31px] top-[calc(2.4vh)]"
          onClick={() => triggerInfo()}
        >
          <Image src="/info_icon.svg" alt="info" width={35} height={35} />
        </button>
          </span>
      </div>
      <div className="flex justify-center items-center">
        <PositionHealthIndicator
          borrowedAmt={position?.borrowAssets}
          innerPercentage={positionHealth.healthPercentage}
          outerPercentage={positionHealth.borrowPercentage}
        />
      </div>
      <div className="flex flex-col mx-6 gap-[calc(2.4vh)]">
        <CollateralCard position={position} />
        <BorrowCard position={position} percent={positionHealth.borrowPercentage} />
        <div className="flex pb-[55px] justify-center w-full">
          <span className="flex gap-2 h-[55px] w-full">
            <Link href="/Borrow" className="w-full h-full">
              <ThemeButton text={t('dashboard.borrow.title')} />
            </Link>
            {position?.borrowAssets && position.borrowAssets > 10000n ? (
              <Link href="/Repay" className="w-full h-full">
                <ThemeButton text={t('dashboard.borrow.repay')} />
              </Link>
            ) : null}
          </span>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
