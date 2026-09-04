import React from 'react';
import {
  ArrowLeft,
  PlusCircle,
  ShoppingCart,
  Smile,
  Car,
  Utensils,
  Zap,
  Tag,
} from 'lucide-react';
import { BudgetCategoryItem, ScreenType } from '../../types';
import { fmt } from '../../format';

interface BudgetsScreenProps {
  categories: BudgetCategoryItem[];
  onNavigate: (screen: ScreenType) => void;
  onOpenAddModal: () => void;
  onSelectCategory: (cat: BudgetCategoryItem) => void;
}

export const BudgetsScreen: React.FC<BudgetsScreenProps> = ({
  categories,
  onNavigate,
  onOpenAddModal,
  onSelectCategory,
}) => {
  const totalBudget = categories.reduce((sum, item) => sum + item.total, 0);
  const totalSpent = categories.reduce((sum, item) => sum + item.spent, 0);
  const overallPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const getCategoryIcon = (type: BudgetCategoryItem['iconType'], color: BudgetCategoryItem['color']) => {
    const iconColor =
      color === 'green'
        ? 'text-emerald-500'
        : color === 'amber'
        ? 'text-amber-500'
        : color === 'cyan'
        ? 'text-cyan-500'
        : color === 'rose'
        ? 'text-rose-500'
        : 'text-indigo-500';

    switch (type) {
      case 'groceries':
        return <ShoppingCart className={`w-6 h-6 ${iconColor}`} />;
      case 'entertainment':
        return <Smile className={`w-6 h-6 ${iconColor}`} />;
      case 'transportation':
        return <Car className={`w-6 h-6 ${iconColor}`} />;
      case 'dining':
        return <Utensils className={`w-6 h-6 ${iconColor}`} />;
      case 'utilities':
        return <Zap className={`w-6 h-6 ${iconColor}`} />;
      default:
        return <Tag className={`w-6 h-6 ${iconColor}`} />;
    }
  };

  const getProgressBarColor = (color: BudgetCategoryItem['color']) => {
    switch (color) {
      case 'green':
        return 'bg-emerald-500';
      case 'amber':
        return 'bg-amber-500';
      case 'cyan':
        return 'bg-cyan-500';
      case 'rose':
        return 'bg-rose-500';
      default:
        return 'bg-blue-600';
    }
  };

  return (
    <div id="budgets-screen" className="flex-1 flex flex-col bg-[#fafbfc] px-5 py-4 overflow-y-auto pb-6">
      {/* Header */}
      <div className="flex items-center justify-between relative mb-5">
        <button
          id="btn-back-budgets"
          onClick={() => onNavigate('overview')}
          className="p-1 rounded-full text-gray-600 hover:text-gray-900 transition-colors"
          title="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Budgets</h1>
        <div className="w-6" /> {/* spacer */}
      </div>

      {/* Overview Card */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3 px-0.5">Overview</h2>
        <div className="bg-white rounded-2xl p-5 border border-gray-100/90 shadow-[0_2px_10px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[16px] font-bold text-gray-900 leading-snug">Total Budget</p>
              <p className="text-xs text-gray-400 font-medium mt-0.5">Monthly allocation</p>
            </div>
            <p className="text-lg font-bold text-gray-900 tracking-tight">
              {fmt(totalBudget)}
            </p>
          </div>

          <div className="pt-2 border-t border-gray-100/80 flex items-center justify-between">
            <div>
              <p className="text-[16px] font-bold text-gray-900 leading-snug">Total Spent</p>
              <p className="text-xs text-gray-400 font-medium mt-0.5">This month so far</p>
            </div>
            <p className="text-lg font-bold text-red-500 tracking-tight">
              {fmt(totalSpent)}
            </p>
          </div>

          {/* Progress bar */}
          <div className="pt-1">
            <div className="w-full bg-blue-50/80 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-[#2563eb] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(overallPercentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 font-medium text-right mt-2">
              {overallPercentage}% of budget spent
            </p>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="mb-6 flex-1">
        <div className="flex items-center justify-between mb-3 px-0.5">
          <h2 className="text-lg font-bold text-gray-900">Categories</h2>
          <button
            onClick={() => {}}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            View All
          </button>
        </div>

        <div className="space-y-3.5">
          {categories.map((cat) => {
            const percentage = cat.total > 0 ? Math.round((cat.spent / cat.total) * 100) : 0;
            return (
              <div
                key={cat.id}
                id={`budget-cat-${cat.id}`}
                onClick={() => onSelectCategory(cat)}
                className="bg-white rounded-2xl p-4.5 border border-gray-100/90 shadow-[0_2px_8px_rgba(0,0,0,0.02)] cursor-pointer hover:border-gray-200 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-2.5">
                  <div>
                    <h3 className="text-[16px] font-bold text-gray-900">{cat.name}</h3>
                    <p className="text-sm text-gray-400 font-medium mt-0.5">
                      {fmt(cat.spent)} / {fmt(cat.total)}
                    </p>
                  </div>
                  <div className="p-1">
                    {getCategoryIcon(cat.iconType, cat.color)}
                  </div>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`${getProgressBarColor(cat.color)} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 font-medium text-right mt-1.5">
                  {percentage}% spent
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Button: + Add New Budget */}
      <div className="pt-2 sticky bottom-0 bg-[#fafbfc]/90 backdrop-blur-xs pb-1">
        <button
          id="btn-add-new-budget"
          onClick={onOpenAddModal}
          className="w-full bg-[#1d6fe9] hover:bg-blue-600 active:bg-blue-700 text-white font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer"
        >
          <PlusCircle className="w-5 h-5" />
          <span className="text-[15px]">Add New Budget</span>
        </button>
      </div>
    </div>
  );
};
