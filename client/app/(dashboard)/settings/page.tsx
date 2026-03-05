'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import api from '@/lib/api';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  avatar: z.string().optional(),
  readingGoal: z.number().min(1).max(500),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(8, 'Min 8 characters'),
});

type ProfileData = z.infer<typeof profileSchema>;
type PasswordData = z.infer<typeof passwordSchema>;

function SettingsContent() {
  const { user, updateProfile, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const profileForm = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '', avatar: user?.avatar || '', readingGoal: user?.readingGoal || 12 },
  });

  const passwordForm = useForm<PasswordData>({ resolver: zodResolver(passwordSchema) });

  const handleProfile = async (data: ProfileData) => {
    try {
      await updateProfile(data);
      toast('Profile updated!', 'success');
    } catch {
      toast('Failed to update profile', 'error');
    }
  };

  const handlePassword = async (data: PasswordData) => {
    try {
      await updateProfile(data);
      toast('Password changed!', 'success');
      passwordForm.reset();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast(msg || 'Failed to change password', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete('/auth/me');
      await logout();
      router.push('/');
    } catch {
      toast('Failed to delete account', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="px-6 py-8 max-w-2xl mx-auto space-y-8">
      <h1 className="font-display text-3xl font-bold text-text-primary">Settings</h1>

      {/* Profile */}
      <div className="card p-6 space-y-5">
        <h2 className="font-semibold text-text-primary text-lg">Profile</h2>
        <form onSubmit={profileForm.handleSubmit(handleProfile)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-primary">Display Name</label>
            <input
              {...profileForm.register('name')}
              className="w-full bg-surface-2 border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors"
            />
            {profileForm.formState.errors.name && <p className="text-danger text-xs">{profileForm.formState.errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-primary">Avatar URL</label>
            <input
              {...profileForm.register('avatar')}
              placeholder="https://..."
              className="w-full bg-surface-2 border border-border rounded-lg px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-primary">Annual Reading Goal</label>
            <input
              {...profileForm.register('readingGoal', { valueAsNumber: true })}
              type="number"
              min="1" max="500"
              className="w-full bg-surface-2 border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors"
            />
            <p className="text-text-muted text-xs">How many books do you want to read this year?</p>
          </div>

          <Button type="submit" disabled={profileForm.formState.isSubmitting}>
            {profileForm.formState.isSubmitting ? 'Saving...' : 'Save Profile'}
          </Button>
        </form>
      </div>

      {/* Change Password */}
      <div className="card p-6 space-y-5">
        <h2 className="font-semibold text-text-primary text-lg">Change Password</h2>
        <form onSubmit={passwordForm.handleSubmit(handlePassword)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-primary">Current Password</label>
            <input
              {...passwordForm.register('currentPassword')}
              type="password"
              className="w-full bg-surface-2 border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors"
            />
            {passwordForm.formState.errors.currentPassword && <p className="text-danger text-xs">{passwordForm.formState.errors.currentPassword.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-primary">New Password</label>
            <input
              {...passwordForm.register('newPassword')}
              type="password"
              className="w-full bg-surface-2 border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors"
            />
            {passwordForm.formState.errors.newPassword && <p className="text-danger text-xs">{passwordForm.formState.errors.newPassword.message}</p>}
          </div>
          <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
            {passwordForm.formState.isSubmitting ? 'Changing...' : 'Change Password'}
          </Button>
        </form>
      </div>

      {/* Danger zone */}
      <div className="card border-danger/20 p-6 space-y-4">
        <h2 className="font-semibold text-danger text-lg">Danger Zone</h2>
        <p className="text-text-muted text-sm">Permanently delete your account and all your books. This cannot be undone.</p>
        <Button variant="danger" onClick={() => setDeleteConfirm(true)}>Delete Account</Button>
      </div>

      <Modal open={deleteConfirm} onClose={() => setDeleteConfirm(false)}>
        <div className="p-6 text-center space-y-4">
          <span className="text-5xl">⚠️</span>
          <h2 className="font-display text-xl font-bold text-text-primary">Delete your account?</h2>
          <p className="text-text-muted text-sm">All your books, reviews, and data will be permanently erased. There&apos;s no going back.</p>
          <div className="flex gap-3 justify-center pt-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Yes, delete everything'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ToastProvider>
      <SettingsContent />
    </ToastProvider>
  );
}
