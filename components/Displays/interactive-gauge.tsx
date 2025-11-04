"use client";
import { formatUSD } from "@/lib/format";
import { useEffect, useRef, useState } from "react";
import { useDrag } from "react-use-gesture";

function DialButton({
  color,
  x,
  y,
  radius,
  position,
  onClick,
  diabled,
}: {
  color?: string;
  x: number;
  y: number;
  radius: number;
  position: number;
  onClick?: () => void;
  diabled?: boolean;
}) {
  return (
    <svg
      className={diabled ? "pointer-events-none" : "cursor-pointer"}
      onClick={onClick}
      x={x + radius * Math.cos((Math.PI / 180) * position) - 8}
      y={y + radius * Math.sin((Math.PI / 180) * position) - 8}
      width="16"
      height="16"
      viewBox="-8 -8 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        width="16"
        height="16"
        rx="2"
        ry="2"
        transform="rotate(45, 8, 8)"
        fill={color ? color : "#2C2C2E"}
      />
    </svg>
  );
}

interface CircularGaugeProps {
  setNumPad: () => void;
  amount: string;
  updateAmount: (amt: string) => void;
  maxAmount: bigint;
}

export default function CircularGauge({
  setNumPad,
  amount,
  updateAmount,
  maxAmount,
}: CircularGaugeProps) {
  const [size, setSize] = useState(350);
  const [angle, setAngle] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const knobRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const updateSize = () => {
      setSize(window.innerWidth < 500 ? window.innerWidth < 400 ?  window.innerWidth * 0.85 : 350 : 450);
    };
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, [size]);

  useEffect(() => {
    if (Number(amount) < 0.001) {
      setAngle(0);
    } else {
      const maxAmountNum = Number(formatUSD(maxAmount));
      const amountNum = Number(amount);
      const newPercent = Math.min((amountNum / maxAmountNum) * 100, 100);
      setAngle(newPercent * 3.6);
    }
  }, [amount, maxAmount]);

  function updateAngle(newAngle: number) {
    const maxAmountNum = Number(formatUSD(maxAmount));
    const newAmount =(( Math.min(
      Number(((maxAmountNum * newAngle) / 360).toFixed(2)),
      maxAmountNum
    ) * 100)/100.1)
    .toFixed(2);
    setAngle(newAngle);
    updateAmount(newAmount);
  }

  const radius = size * 0.4;
  const centerX = size / 2;
  const centerY = size / 2;
  const knobSize = size * 0.04;

  const calculatePosition = (angle: number) => {
    const radians = (angle - 90) * (Math.PI / 180);
    return {
      x: centerX + radius * Math.cos(radians),
      y: centerY + radius * Math.sin(radians),
    };
  };

  const bind = useDrag(({ event, first, xy: [x, y] }) => {
    event.preventDefault();
    event.stopPropagation();

    if (!first && svgRef.current) {
      // Get SVG element's bounding rectangle
      const svgRect = svgRef.current.getBoundingClientRect();

      // Calculate coordinates relative to SVG
      const relativeX = x - svgRect.left;
      const relativeY = y - svgRect.top;

      // Calculate vector from center to pointer
      const dx = relativeX - centerX;
      const dy = relativeY - centerY;

      // Calculate angle in degrees (0 is at right, 90 is at bottom)
      let newAngle = Math.atan2(dy, dx) * (180 / Math.PI);

      // Convert to our gauge's coordinate system (0 is at top)
      newAngle = (newAngle + 90 + 360) % 360;

      // Snap to cardinal directions
      if (newAngle > 358) newAngle = 360;
      if (newAngle > 179 && newAngle < 181) newAngle = 180;
      if (newAngle > 269 && newAngle < 271) newAngle = 270;

      const maxAmountNum = Number(formatUSD(maxAmount));
      const newAmount = Math.min(
        Number(((maxAmountNum * newAngle) / 360).toFixed(2)),
        maxAmountNum
      ).toFixed(2);

      setAngle(newAngle);
      updateAmount(newAmount);
    }
  });

  const knobPos = calculatePosition(angle);

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          <linearGradient
            id="circleGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#7D0BF4" />
            <stop offset="50%" stopColor="#1A26E7" />
            <stop offset="100%" stopColor="#0D4BEF" />
          </linearGradient>
        </defs>

        <defs>
          <linearGradient
            id="trackGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#9B3CFF" />
            <stop offset="100%" stopColor="#2D67FF" />
          </linearGradient>
        </defs>

        {/* Outer Border Circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          stroke="#1C1C1E"
          strokeWidth={1.1 * size * 0.07}
          fill="none"
        />
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          stroke="black"
          strokeWidth={size * 0.07}
          fill="none"
        />

        {/* Gauge Progress Arc */}
        <path
          d={
            angle === 360
              ? `M ${centerX} ${centerY - radius} 
         A ${radius} ${radius} 0 1 1 ${centerX} ${centerY + radius}
         A ${radius} ${radius} 0 1 1 ${centerX} ${centerY - radius}`
              : `M ${calculatePosition(0).x} ${calculatePosition(0).y} 
         A ${radius} ${radius} 0 ${angle > 180 ? 1 : 0} 1 ${knobPos.x} ${
                  knobPos.y
                }`
          }
          stroke="url(#trackGradient)"
          strokeWidth={size * 0.07}
          fill="none"
        />

        {/* startknob */}
        <circle
          ref={knobRef}
          cx={centerX + radius * Math.cos((Math.PI / 180) * -90)}
          cy={centerY + radius * Math.sin((Math.PI / 180) * -90)}
          r={knobSize}
          fill="black"
          stroke="black"
          strokeWidth={size * 0.005}
        />

        {/* percent markers */}

        <DialButton
          x={centerX}
          y={centerY}
          radius={radius}
          position={-90}
          onClick={() => updateAngle(360)}
        />
        <DialButton
          x={centerX}
          y={centerY}
          radius={radius}
          position={0}
          onClick={() => updateAngle(90)}
        />
        <DialButton
          x={centerX}
          y={centerY}
          radius={radius}
          position={90}
          onClick={() => updateAngle(180)}
        />
        <DialButton
          x={centerX}
          y={centerY}
          radius={radius}
          position={180}
          onClick={() => updateAngle(270)}
        />

        {/* Knob */}
        <circle
          ref={knobRef}
          cx={knobPos.x}
          cy={knobPos.y}
          r={knobSize}
          fill="url(#circleGradient)"
          stroke="black"
          strokeWidth={size * 0.005}
          {...bind()}
          className="cursor-pointer"
        />
        {angle === 360 ? (
          <DialButton
            color="white"
            x={centerX}
            y={centerY}
            radius={radius}
            position={-90}
            diabled
          />
        ) : null}

        {/* Centered Value */}
        <text
          x="50%"
          y="50%"
          fill="white"
          fontSize={size * 0.1}
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="middle"
          onClick={() => setNumPad()}
        >
          ${amount}
        </text>
      </svg>
    </div>
  );
}
