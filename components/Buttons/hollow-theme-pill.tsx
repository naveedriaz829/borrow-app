export default function HollowThemePill({text, handleClick = undefined }:{text: string, handleClick?: React.MouseEventHandler<HTMLButtonElement> | undefined}) {
  return (
    <button 
        onClick={handleClick}
        className="font-medium bg-theme-1 rounded-full w-full h-[6vh] flex items-center justify-center">
        <div className="bg-theme-gray bg-dash-gray w-full m-1 h-5/6 rounded-full items-center flex justify-center">
            {text}
        </div>
    </button>
  )
}
