
import React from 'react';
import { Bell, HelpCircle } from 'lucide-react';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="bg-white shadow-sm p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        
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
    </header>
  );
};

export default Header;
