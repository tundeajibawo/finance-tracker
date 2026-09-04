import React, { useState } from 'react';
import { X, PieChart } from 'lucide-react';
import { BudgetCategoryItem } from '../../types';

interface AddBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (budget: Omit<BudgetCategoryItem, 'id'>) => void;
}

export const AddBudgetModal: React.FC<AddBudgetModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [total, setTotal] = useState('');
  const [spent, setSpent] = useState('');
  const [iconType, setIconType] = useState<BudgetCategoryItem['iconType']>('groceries');
  const [color, setColor] = useState<BudgetCategoryItem['color']>('green');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !total) return;

    onAdd({
      name: name.trim(),
      total: parseFloat(total) || 0,
      spent: parseFloat(spent) || 0,
      iconType,
      color,
    });

    setName('');
    setTotal('');
    setSpent('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Add New Budget</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Category Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Health & Fitness"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Total Budget (₦)
              </label>
              <input
                type="number"
                step="1"
                required
                placeholder="500"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Already Spent (₦)
              </label>
              <input
                type="number"
                step="1"
                placeholder="0"
                value={spent}
                onChange={(e) => setSpent(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Icon
              </label>
              <select
                value={iconType}
                onChange={(e) => setIconType(e.target.value as BudgetCategoryItem['iconType'])}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="groceries">Groceries (Cart)</option>
                <option value="entertainment">Entertainment (Smiley)</option>
                <option value="transportation">Transportation (Car)</option>
                <option value="dining">Dining Out (Utensils)</option>
                <option value="utilities">Utilities (Zap)</option>
                <option value="other">Other (Tag)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Color Accent
              </label>
              <select
                value={color}
                onChange={(e) => setColor(e.target.value as BudgetCategoryItem['color'])}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="green">Emerald Green</option>
                <option value="amber">Warm Amber</option>
                <option value="cyan">Cyan Blue</option>
                <option value="rose">Rose Red</option>
                <option value="indigo">Indigo</option>
              </select>
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3 bg-[#1d6fe9] hover:bg-blue-600 active:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md transition-colors cursor-pointer"
            >
              Add Budget Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
