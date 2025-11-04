import { IoWarningOutline } from "react-icons/io5";

interface ErrorCardProps {
  title: string;
  message: string;
}

const ErrorCard = ({ title, message }: ErrorCardProps) => {
  return (
    <span className="flex h-[86px] mx-[24px] bg-gradient-to-br from-[#7D0BF4] via-[#1A26E7] to-[#0D4BEF] rounded-[20px]">
      <div className="flex h-full items-center justify-start bg-gradient-to-br from-[#4B0792] via-[#0E1696] to-[#0734A9] w-full mt-[0.5px] rounded-[20px]">
        <span className="pl-[20px] flex items-start justify-start h-auto">
          <div className="flex flex-col h-full pr-[12px]">
            <IoWarningOutline size={24} color="#FF6961" />
          </div>
          <br></br>
          <div className="flex flex-col text-start">
            <h2 className="font-['PolySans'] text-white text-[17px]">
              {title}
            </h2>
            <p className="text-[#7AB7FD] text-[15px]">
              {message}
            </p>
          </div>
        </span>
      </div>
    </span>
  );
};

export default ErrorCard; 