import React, { useState } from 'react';
import { X, Lock, Mail, AlertTriangle, Check } from 'lucide-react';
import { UserProfile } from '../../types';

interface SettingsModalsProps {
  activeModal: 'password' | 'email' | 'delete' | null;
  profile: UserProfile;
  onClose: () => void;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onResetAllData: () => void;
}

export const SettingsModals: React.FC<SettingsModalsProps> = ({
  activeModal,
  profile,
  onClose,
  onUpdateProfile,
  onResetAllData,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState(profile.email);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!activeModal) return null;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    setSuccessMsg('Password updated successfully!');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1200);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }
    onUpdateProfile({ email: newEmail.trim() });
    setSuccessMsg('Email updated successfully!');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1200);
  };

  const handleDeleteSubmit = () => {
    onResetAllData();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-gray-100 p-6">
        {/* Password Modal */}
        {activeModal === 'password' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Change Password</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {successMsg ? (
              <div className="py-6 text-center text-emerald-600 font-semibold flex flex-col items-center">
                <Check className="w-8 h-8 mb-2 bg-emerald-100 p-1.5 rounded-full" />
                <span>{successMsg}</span>
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
                {errorMsg && <p className="text-xs text-red-500 font-medium">{errorMsg}</p>}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Email Modal */}
        {activeModal === 'email' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Change Email</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {successMsg ? (
              <div className="py-6 text-center text-emerald-600 font-semibold flex flex-col items-center">
                <Check className="w-8 h-8 mb-2 bg-emerald-100 p-1.5 rounded-full" />
                <span>{successMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleEmailSubmit} className="space-y-3.5">
                {errorMsg && <p className="text-xs text-red-500 font-medium">{errorMsg}</p>}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => {
                      setNewEmail(e.target.value);
                      setErrorMsg('');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm"
                  >
                    Save Email
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Delete Account Modal */}
        {activeModal === 'delete' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2.5 text-red-600">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold">Delete Account</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              Are you sure you want to delete your account? All saved budgets, accounts, and tracked transactions will be permanently reset to factory demo state.
            </p>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-xs"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
