import React from 'react';
import { CheckCircle2, Mail, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Screen } from '../Screen';
import { ScreenHeader } from '../ScreenHeader';
import { UserProfile } from '../../types';

interface ProfileScreenProps {
  profile: UserProfile;
  onBack: () => void;
}

const rowsFor = (profile: UserProfile): { Icon: LucideIcon; label: string; value: string }[] => [
  { Icon: User, label: 'Name', value: profile.name || '—' },
  { Icon: Mail, label: 'Email', value: profile.email || '—' },
  { Icon: CheckCircle2, label: 'Status', value: 'Active' },
];

export function ProfileScreen({ profile, onBack }: ProfileScreenProps) {
  return (
    <Screen>
      <ScreenHeader title="Profile" onBack={onBack} />

      <div className="flex flex-col items-center mt-6 mb-7">
        <img
          src={profile.avatarUrl}
          alt={profile.name}
          className="w-24 h-24 rounded-full border-[3px] border-blue-100 object-cover mb-4"
        />
        <p className="text-[22px] font-extrabold text-gray-900">{profile.name || 'User'}</p>
        <p className="text-[13px] text-gray-500 mt-1">Your Every Naira account</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#eef0f2] shadow-[0_2px_8px_rgba(0,0,0,0.03)] overflow-hidden">
        {rowsFor(profile).map(({ Icon, label, value }, i) => (
          <div key={label} className={`flex items-center p-4 ${i > 0 ? 'border-t border-gray-100' : ''}`}>
            <span className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-blue-600" />
            </span>
            <div className="ml-3 min-w-0">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
              <p className="text-[15px] font-semibold text-gray-900 mt-0.5 truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </Screen>
  );
}
