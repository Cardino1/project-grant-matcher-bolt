import { FC } from 'react';

interface LogoProps {
  className?: string;
}

export const PageX: FC<LogoProps> = ({ className = "h-8" }) => {
  return (
    <div className={`flex ${className}`}>
      <div className="bg-secondary-900 text-white font-bold p-1">P</div>
      <div className="bg-secondary-900 text-white font-bold p-1">A</div>
      <div className="bg-secondary-900 text-white font-bold p-1">G</div>
      <div className="bg-secondary-900 text-white font-bold p-1">E</div>
      <div className="bg-primary-500 text-white font-bold p-1">X</div>
    </div>
  );
};

export const LogoText: FC<LogoProps> = ({ className = "h-8" }) => {
  return (
    <div className="flex items-center">
      <PageX className={className} />
      <span className="ml-2 text-lg font-semibold text-secondary-900">ArtistMatch</span>
    </div>
  );
};

export default LogoText;