'use client';

import AdminLayout from '@/components/AdminLayout';
import AccountSettingsForm from '@/components/AccountSettingsForm';
import { useAuth } from '@/lib/auth-context';

export default function AdminSettingsPage() {
  const { refreshUser } = useAuth();

  return (
    <AdminLayout>
      <h1 className="text-2xl font-serif font-semibold mb-8">Account Settings</h1>
      <p className="text-sm text-gray-500 mb-6 max-w-md">
        Update the email or password for this admin account.
      </p>
      <AccountSettingsForm onUpdated={refreshUser} />
    </AdminLayout>
  );
}
