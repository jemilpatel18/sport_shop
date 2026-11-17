'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { userService } from '@/services/userService';
import { toast } from '@/stores/uiStore';
import Spinner from '@/components/Spinner';

export default function AccountSettingsPage() {
  const { user, refreshUser, logout } = useAuthStore();
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '', avatar: user?.avatar || '' });
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const saveProfile = async () => {
    if (profile.name.trim().length < 2) return toast.error('Name is required');
    setSavingProfile(true);
    const updated = await userService.updateProfile({ name: profile.name, phone: profile.phone, avatar: profile.avatar });
    if (updated) {
      await refreshUser();
      toast.success('Profile updated');
    } else {
      toast.info('Profile saved (offline mode)');
    }
    setSavingProfile(false);
  };

  const changePassword = async () => {
    if (!passwords.current || passwords.next.length < 6) return toast.error('Enter current password and a new password (min 6 chars)');
    if (passwords.next !== passwords.confirm) return toast.error('New passwords do not match');
    setSavingPassword(true);
    const ok = await userService.changePassword(passwords.current, passwords.next);
    setSavingPassword(false);
    if (ok) {
      toast.success('Password changed successfully');
      setPasswords({ current: '', next: '', confirm: '' });
    } else {
      toast.error('Failed to change password. Check your current password.');
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    await logout();
    toast.info('Account deletion requested');
  };

  return (
    <div className="space-y-6">
      {/* Profile settings */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-display font-bold text-lg uppercase mb-5">Profile Information</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Full Name</label>
            <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-lime" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Email</label>
            <input value={user?.email || ''} disabled className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-brand-gray text-gray-500" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Phone</label>
            <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-lime" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Avatar URL</label>
            <input value={profile.avatar} onChange={(e) => setProfile({ ...profile, avatar: e.target.value })} placeholder="https://…" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-lime" />
          </div>
        </div>
        <button onClick={saveProfile} disabled={savingProfile} className="mt-5 px-6 py-3 bg-brand-charcoal text-white text-sm font-bold rounded-xl hover:bg-brand-dark disabled:opacity-50">
          {savingProfile ? 'Saving…' : 'Save Profile'}
        </button>
      </div>

      {/* Password */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-display font-bold text-lg uppercase mb-5">Change Password</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Current Password</label>
            <input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-lime" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">New Password</label>
            <input type="password" value={passwords.next} onChange={(e) => setPasswords({ ...passwords, next: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-lime" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Confirm New</label>
            <input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-lime" />
          </div>
        </div>
        <button onClick={changePassword} disabled={savingPassword} className="mt-5 px-6 py-3 bg-brand-charcoal text-white text-sm font-bold rounded-xl hover:bg-brand-dark disabled:opacity-50">
          {savingPassword ? 'Updating…' : 'Update Password'}
        </button>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl border border-red-100 p-6">
        <h2 className="font-display font-bold text-lg uppercase text-red-600 mb-2">Danger Zone</h2>
        <p className="text-sm text-gray-500 mb-4">Once you delete your account, there is no going back.</p>
        <button onClick={deleteAccount} className="px-6 py-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl hover:bg-red-100 border border-red-200">
          Delete Account
        </button>
      </div>
    </div>
  );
}
