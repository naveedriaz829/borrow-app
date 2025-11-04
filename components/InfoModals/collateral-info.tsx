"use client";
import { IoCloseOutline } from "react-icons/io5";
import { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

export default function InfoCollateral({
  trigger,
  isVisible,
}: {
  trigger: Dispatch<SetStateAction<boolean>>;
  isVisible: boolean;
}) {
  const { t } = useTranslation();

  const handleClose = (e?: React.MouseEvent) => {
    // Prevent event propagation to avoid conflicts with drag handlers
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // Wait for animation to complete before calling trigger
    setTimeout(() => {
      trigger(false);
    }, 100);
  };

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: isVisible ? 0 : "100%" }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.1}
      onDragEnd={(event, info) => {
        if (info.offset.y > 100) {
          handleClose();
        }
      }}
      className="fixed inset-0 bg-[#161616] h-full rounded-t-[20px] z-10 font-sans w-full text-[#C7C7CC] text-[19px] font-light mx-auto flex flex-col p-6 gap-4"
    >
      <button
        className="absolute top-[15px] right-[14px] rounded-full bg-white/10 size-8 flex items-center justify-center z-20"
        onClick={handleClose}
        onTouchStart={(e) => {
          e.stopPropagation();
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
      >
        <IoCloseOutline size={20} color="white" />
      </button>
      <span className="relative h-full overflow-scroll no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Header Section */}
        <h1 className="font-['PolySans'] text-2xl font-bold py-5 text-white">
          {t("collateral.title")}
        </h1>
        <p className="text-md font-light">{t("collateral.intro")}</p>

        <div className="mt-6">
          <h3 className="font-['PolySans'] text-lg font-semibold text-white">
            {t("collateral.collateralization.title")}
          </h3>
          <p className="mt-4">
            {t("collateral.collateralization.description")}
          </p>
        </div>

        <div className="mt-6">
          <h3 className="font-['PolySans'] text-lg font-semibold text-white">
            {t("collateral.interestRates.title")}
          </h3>
          <p className="mt-4">{t("collateral.interestRates.description")}</p>
        </div>

        <div className="mt-6">
          <h3 className="font-['PolySans'] text-lg font-semibold text-white">
            {t("collateral.marginCalls.title")}
          </h3>
          <p className="mt-4">{t("collateral.marginCalls.description")}</p>
        </div>

        <div className="mt-6">
          <h3 className="font-['PolySans'] text-lg font-semibold text-white">
            {t("collateral.platformSelection.title")}
          </h3>
          <p className="mt-4">
            {t("collateral.platformSelection.description")}
          </p>
        </div>

        <div className="mt-6">
          <h3 className="font-['PolySans'] text-lg font-semibold text-white">
            {t("collateral.taxImplications.title")}
          </h3>
          <p className="mt-4">{t("collateral.taxImplications.description")}</p>
          <p className="mt-4">{t("collateral.summary")}</p>
        </div>
      </span>
    </motion.div>
  );
}
