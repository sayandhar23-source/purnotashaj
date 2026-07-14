'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

export default function AccountSettingsForm({ onUpdated }: { onUpdated: () => void }) {
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const changeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEmail(true);
    try {
      await api.patch('/users/me/email', { newEmail, currentPassword: emailPassword });
      toast.success('Email updated.');
      onUpdated();
      setNewEmail('');
      setEmailPassword('');
    } catch (err: any) {
      toast.error(err?.message || 'Could not update email.');
    } finally {
      setSavingEmail(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    try {
      await api.patch('/users/me/password', { currentPassword, newPassword });
      toast.success('Password updated.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      toast.error(err?.message || 'Could not update password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-8 max-w-md">
      <form onSubmit={changeEmail} className="card p-6 space-y-3">
        <h3 className="font-semibold">Change Email</h3>
        <input
          type="email"
          required
          placeholder="New email"
          className="input"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
        />
        <input
          type="password"
          required
          placeholder="Current password"
          className="input"
          value={emailPassword}
          onChange={(e) => setEmailPassword(e.target.value)}
        />
        <button type="submit" disabled={savingEmail} className="btn-primary w-full">
          {savingEmail ? 'Saving...' : 'Update Email'}
        </button>
      </form>

      <form onSubmit={changePassword} className="card p-6 space-y-3">
        <h3 className="font-semibold">Change Password</h3>
        <input
          type="password"
          required
          placeholder="Current password"
          className="input"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <input
          type="password"
          required
          minLength={8}
          placeholder="New password"
          className="input"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button type="submit" disabled={savingPassword} className="btn-primary w-full">
          {savingPassword ? 'Saving...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
