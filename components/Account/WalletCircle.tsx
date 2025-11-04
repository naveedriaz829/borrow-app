export default function GradientWalletCircle({ address, width, height }: { address: string, width: string, height: string }) {
    const color1 = `#${address.slice(2, 8)}`;
    const color2 = `#${address.slice(8, 14)}`;
  
    return (
      <svg width={width} height={height} viewBox="0 0 100 100">
        <defs>
          <radialGradient id="grad1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color1} />
            <stop offset="100%" stopColor={color2} />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="45" fill="url(#grad1)" />
      </svg>
    );
  }
  