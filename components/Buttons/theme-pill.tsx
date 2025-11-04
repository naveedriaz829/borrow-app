export default function ThemePill({text, handleClick = undefined, disabled = false }:{text: string, handleClick?: React.MouseEventHandler<HTMLButtonElement> | undefined, disabled?: boolean}) {
  return (
    <button 
        disabled={disabled}
        onClick={handleClick}
        className={`font-medium bg-theme-1 rounded-full w-full h-full ${disabled ? "text-[#AEAEB2]" : "text-white"}`}>
        {text}
    </button>
  )
}
