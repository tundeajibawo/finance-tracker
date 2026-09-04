import React from 'react';
import { Home, ListOrdered, Landmark, PieChart, Settings } from 'lucide-react';
import { ScreenType } from '../types';

interface BottomNavBarProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentScreen, onNavigate }) => {
  const tabs: { id: ScreenType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'overview', label: 'Home', icon: Home },
    { id: 'transactions', label: 'Transactions', icon: ListOrdered },
    { id: 'accounts', label: 'Accounts', icon: Landmark },
    { id: 'budgets', label: 'Budget', icon: PieChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      aria-label="Main Navigation"
      className="max-w-md w-full mx-auto bg-white border-t border-gray-100 px-3 py-2 flex items-center justify-around z-30 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentScreen === tab.id;

        return (
          <button
            key={tab.id}
            id={`nav-tab-${tab.id}`}
            onClick={() => onNavigate(tab.id)}
            className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-all duration-200 ${
              isActive
                ? 'bg-blue-50 text-blue-600 font-semibold'
                : 'text-gray-400 hover:text-gray-600 font-medium'
            }`}
          >
            <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 text-blue-600' : 'text-gray-400'}`} />
            <span className={`text-[11px] mt-1 tracking-tight leading-none ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
