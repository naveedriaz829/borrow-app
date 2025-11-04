"use client";
import React, { useState, useEffect, useRef } from "react";

export default function CircularGaugeDisplay({percent}:{percent: number}) {
  const size = 62
  const angle = Math.round((percent / 100) * 360)
  const gaugeRef = useRef(null);

  const radius = size * 0.4; 
  const centerX = size / 2;
  const centerY = size / 2;
  const knobSize = size * 0.05; 

  const calculatePosition = (angle: number) => {
    const radians = (angle - 90) * (Math.PI / 180);
    return {
      x: centerX + radius * Math.cos(radians),
      y: centerY + radius * Math.sin(radians),
    };
  };

  const knobPos = calculatePosition(angle);

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg
        ref={gaugeRef}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5D07B7" />
            <stop offset="50%" stopColor="#131DBB" />
            <stop offset="100%" stopColor="#073BC3" />
          </linearGradient>
        </defs>

        <defs>
          <linearGradient id="trackGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9B3CFF" />
            <stop offset="100%" stopColor="#2D67FF" />
          </linearGradient>
        </defs>

        {/* Outer Border Circle */}
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
                A ${radius} ${radius} 0 ${angle > 180 ? 1 : 0} 1 ${knobPos.x} ${knobPos.y}`
          }
          stroke="url(#trackGradient)"
          strokeWidth={size * 0.07}
          fill="none"
        />

        {/* Knob */}
        <circle
          ref={gaugeRef}
          cx={knobPos.x}
          cy={knobPos.y}
          r={knobSize}
          fill="url(#circleGradient)"
          stroke="black"
          strokeWidth={size * 0.01}
        //   {...bind()}
          className="cursor-pointer"
        />

        {/* Centered Value */}
          <text
            x="50%"
            y="50%"
            fill="white"
            fontSize={size * 0.2}
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            USD
          </text>
      </svg>
    </div>
  );
}
