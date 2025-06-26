import React from 'react';
import { Bell, HelpCircle, BookOpen } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
interface HeaderProps {
  title: string;
}
const Header: React.FC<HeaderProps> = ({
  title
}) => {
  const isMobile = useIsMobile();
  return <header className="bg-white shadow-sm p-4">
      <div className="flex justify-between items-center">
        {isMobile ?
      // Mobile: Show AulagIA logo and tagline
      <div className="flex items-center space-x-3">
            <div className="bg-primary-500 text-white p-2 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="logo-text text-primary-600 text-2xl font-medium">AulagIA</h1>
              <p className="text-gray-500 font-normal -mt-2 my-0 text-xs">Sua aula com toque mágico</p>
            </div>
          </div> :
      // Desktop: Show page title
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>}
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
              <Bell size={20} />
            </button>
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500"></span>
          </div>
          
          <div className="relative">
            <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
              <HelpCircle size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>;
};
export default Header;