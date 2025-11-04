"use client";
import { useMaxBorrowAmount } from "@/hooks/useMaxBorrowAmount";
import { formatUSD } from "@/lib/format";
import { useState } from "react";
import HollowThemePill from "../Buttons/hollow-theme-pill";
import ThemePill from "../Buttons/theme-pill";
import CircularGaugeDisplay from "./noninteractive-gauge";

function InputAmount({
  input = "",
  closeInput,
  updateAmount,
  inputRef,
  maxAmount,
}: {
  input?: string;
  closeInput: () => void;
  updateAmount: (amt: string) => void;
  inputRef: (element: HTMLInputElement | null) => void;
  maxAmount: bigint;
}) {
  const [selected, setSelected] = useState(0);
  function handleSelect(percent: number) {
    if (!maxAmount) {
      return;
    }
    const changeAmount =
      Number(formatUSD((maxAmount * BigInt(percent * 10))/1001n)); // 0.1 because we want to leave 0.1% buffer for price fluctuations and potential liquidation
    setSelected(percent);
    updateAmount(changeAmount.toFixed(2).toString());
  }

  function ToggleButton({ percent }: { percent: number }) {
    return (
      <>
        {selected === percent ? (
          <ThemePill
            text={`${percent} %`}
            handleClick={() => handleSelect(percent)}
          />
        ) : (
          <HollowThemePill
            text={`${percent} %`}
            handleClick={() => handleSelect(percent)}
          />
        )}
      </>
    );
  }
  return (
    <div className="flex flex-col w-screen overflow-hidden h-auto gap-[calc(2vh)]">
      <span className="flex justify-center font-['PolySans'] text-white w-screen gap-1">
        {/* <h4 className=" text-7xl z-50">$</h4> */}
        <input
          ref={inputRef}
          type="text"
          maxLength={10}
          value={input}
          onChange={(e) => {
            const value = e.target.value;
            // Only allow numbers and one decimal point
            if (/^\d*\.?\d{0,2}$/.test(value)) {
              updateAmount(value);
            }
          }}
          inputMode="decimal"
          pattern="^\d*\.?\d{0,2}$"
          placeholder="$0.00"
          className="caret-transparent focus:outline-none text-7xl text-center w-screen bg-transparent"
        />
      </span>

      <button onClick={() => closeInput()}>
        <CircularGaugeDisplay percent={selected} />
      </button>

      <div className="flex w-full">
        <span className="grid grid-cols-4 w-full gap-2 p-5 text-[clamp(12px,3.7vw,15px)]">
          <ToggleButton percent={25} />
          <ToggleButton percent={50} />
          <ToggleButton percent={75} />
          <ToggleButton percent={100} />
        </span>
      </div>
    </div>
  );
}

export default InputAmount;
