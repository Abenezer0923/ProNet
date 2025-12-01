import { ReactNode } from 'react';

interface HomeCardProps {
  className?: string;
  icon: ReactNode;
  title: string;
  description: string;
  handleClick: () => void;
  color: string;
}

export default function HomeCard({ className, icon, title, description, handleClick, color }: HomeCardProps) {
  return (
    <div
      className={`${color} px-4 py-6 flex flex-col justify-between w-full xl:max-w-[270px] min-h-[260px] rounded-[14px] cursor-pointer transition hover:scale-105 shadow-lg`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-[10px] bg-white/25 backdrop-blur-sm">
        {icon}
      </div>
      
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <p className="text-lg font-normal text-white/80">{description}</p>
      </div>
    </div>
  );
}
