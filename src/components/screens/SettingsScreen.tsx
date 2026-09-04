import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Screen } from '../Screen';
import { ScreenHeader } from '../ScreenHeader';
import { UserProfile, ScreenType } from '../../types';

interface SettingsScreenProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onNavigate: (screen: ScreenType) => void;
  onChangePassword: () => void;
  onChangeEmail: () => void;
  onDeleteAccount: () => void;
  onLogout: () => void;
  onSync: () => Promise<{ ok: boolean; message: string }>;
}

function ToggleRow({
  id,
  title,
  description,
  value,
  onValueChange,
}: {
  id: string;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <div className="p-4 flex items-center justify-between">
      <div className="pr-3">
        <p className="text-[15px] font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-400 font-medium mt-0.5">{description}</p>
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={value}
        onClick={() => onValueChange(!value)}
        className={`w-13 h-7.5 shrink-0 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
          value ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`bg-white w-5.5 h-5.5 rounded-full shadow-md transition-transform ${
            value ? 'translate-x-5.5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

function ActionRow({
  id,
  label,
  onClick,
  danger,
  loading,
  first,
}: {
  id: string;
  label: string;
  onClick: () => void;
  danger?: boolean;
  loading?: boolean;
  first?: boolean;
}) {
  return (
    <button
      id={id}
      onClick={onClick}
      disabled={loading}
      className={`w-full p-4 flex items-center justify-between text-left cursor-pointer transition-colors disabled:opacity-60 ${
        first ? '' : 'border-t border-gray-100'
      } ${danger ? 'hover:bg-red-50/60' : 'hover:bg-gray-50/80'}`}
    >
      <span className={`text-[15px] font-medium ${danger ? 'text-red-600' : 'text-gray-900'}`}>{label}</span>
      {loading ? (
        <span className="w-4 h-4 rounded-full border-2 border-blue-100 border-t-blue-600 animate-spin" />
      ) : (
        <ArrowRight className={`w-4 h-4 ${danger ? 'text-red-600' : 'text-gray-400'}`} />
      )}
    </button>
  );
}

const CARD =
  'bg-white rounded-2xl border border-[#eef0f2] shadow-[0_2px_8px_rgba(0,0,0,0.03)] overflow-hidden mb-7';

export function SettingsScreen({
  profile,
  onUpdateProfile,
  onNavigate,
  onChangePassword,
  onChangeEmail,
  onDeleteAccount,
  onLogout,
  onSync,
}: SettingsScreenProps) {
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ ok: boolean; message: string } | null>(null);

  const doSync = async () => {
    setSyncing(true);
    setSyncStatus(null);
    const res = await onSync();
    setSyncing(false);
    setSyncStatus(res);
  };

  return (
    <Screen>
      <ScreenHeader title="Settings" onBack={() => onNavigate('overview')} />

      <h2 className="text-lg font-bold text-gray-900 mb-3">Sync</h2>
      <div className={CARD}>
        <ActionRow id="btn-sync" label="Sync accounts & transactions" onClick={doSync} loading={syncing} first />
        {syncStatus && (
          <p className={`px-4 pb-3 text-xs font-semibold ${syncStatus.ok ? 'text-emerald-600' : 'text-red-500'}`}>
            {syncStatus.message}
          </p>
        )}
      </div>

      <h2 className="text-lg font-bold text-gray-900 mb-3">Notifications</h2>
      <div className={CARD}>
        <ToggleRow
          id="toggle-transaction-alerts"
          title="Transaction alerts"
          description="Get notified when transactions are made"
          value={profile.transactionAlerts}
          onValueChange={(v) => onUpdateProfile({ transactionAlerts: v })}
        />
        <div className="border-t border-gray-100" />
        <ToggleRow
          id="toggle-low-balance-alerts"
          title="Low balance alerts"
          description="Get notified when your balance is low"
          value={profile.lowBalanceAlerts}
          onValueChange={(v) => onUpdateProfile({ lowBalanceAlerts: v })}
        />
      </div>

      <h2 className="text-lg font-bold text-gray-900 mb-3">Account</h2>
      <div className={CARD}>
        <ActionRow id="btn-change-password" label="Change password" onClick={onChangePassword} first />
        <ActionRow id="btn-change-email" label="Change email" onClick={onChangeEmail} />
        <ActionRow id="btn-logout" label="Log out" onClick={onLogout} />
        <ActionRow id="btn-delete-account" label="Delete account" onClick={onDeleteAccount} danger />
      </div>
    </Screen>
  );
}
