"use client";
import HollowThemePill from "@/components/Buttons/hollow-theme-pill";
import ThemePill from "@/components/Buttons/theme-pill";
import { useMorphoPosition } from "@/hooks/useMorphoPosition";
import { useWLDBalance } from "@/hooks/useWLDBalance";
import { useWLDPrice } from "@/hooks/useWLDPrice";
import { formatWLD } from "@/lib/format";
import { useState } from "react";

export enum InputType {
  Deposit,
  Withdraw,
}

function InputAmount({
  input = "",
  closeInput,
  updateAmount,
  inputType = InputType.Withdraw,
}: {
  input?: string;
  closeInput: () => void;
  updateAmount: (amt: string) => void;
  inputType: InputType;
}) {
  const [selected, setSelected] = useState(0);
  const position = useMorphoPosition();
  const { data: wldBalance } = useWLDBalance();
  const { data: wldPrice } = useWLDPrice();

  function handleSelect(percent: number) {
    let changeAmount: number;
    if (inputType === InputType.Withdraw) {
      // TODO: Update this to a better method later
      changeAmount =
        Number(formatWLD(((position?.withdrawableCollateral || 0n) * BigInt(Math.floor(percent * 10))) / 1001n)); // 0.1 because we want to leave 0.1% buffer for price fluctuations and potential liquidation
      // console.log("changeAmount withdraw:: ", changeAmount);
      // console.log("position?.withdrawableCollateral:: ", position?.withdrawableCollateral);
      } else {
      changeAmount = Number(formatWLD(((wldBalance || 0n) * BigInt(Math.floor(percent))) / 101n));
    }
    setSelected(percent);
    updateAmount(changeAmount.toFixed(4).toString());
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

  const wldBalanceInUSD = (
    (Number(wldPrice || 0n) / 10e23) *
    Number(input)
  ).toFixed(2);
  return (
    <div className="flex flex-col w-screen overflow-hidden h-auto gap-8 justify-center">
      <span className="flex flex-col justify-center font-['PolySans'] text-white w-screen gap-1">
        {/* <h4 className=" text-7xl z-50">$</h4> */}
        <input
          type="text"
          maxLength={10}
          value={inputType === InputType.Withdraw ? `${selected}%` : input}
          onChange={(e) => {
            const value = e.target.value;
            // Only allow numbers and one decimal point
            if (/^\d*\.?\d{0,4}$/.test(value)) {
              updateAmount(value);
            }
          }}
          inputMode={inputType === InputType.Withdraw ? "numeric" : "decimal"}
          pattern={inputType === InputType.Withdraw ? "^[0-9]*$" : "^\d*\.?\d{0,2}$"}
          placeholder={inputType === InputType.Withdraw ? "0%" : "$0.00"}
          readOnly={inputType === InputType.Withdraw}
          className="focus:outline-none text-7xl text-center w-screen bg-transparent"
        />
        {inputType === InputType.Deposit && <p className="flex justify-center items-center font-sans text-center w-full text-[#AEAEB2] text-[13px]">
          ${wldBalanceInUSD} USD
        </p>}
      </span>

      <div className="flex w-full">
        <span className="grid grid-cols-4 w-full gap-2 p-5">
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
