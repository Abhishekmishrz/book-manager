'use client';

import useSWR from 'swr';
import api from '@/lib/api';
import { User } from '@/types';

const fetcher = () => api.get('/auth/me').then((r) => r.data.user);

export function useAuth() {
  const { data: user, error, isLoading, mutate } = useSWR<User>('/auth/me', fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    await mutate(res.data.user, false);
    return res.data.user;
  };

  const signup = async (name: string, email: string, password: string) => {
    const res = await api.post('/auth/signup', { name, email, password });
    await mutate(res.data.user, false);
    return res.data.user;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    await mutate(undefined, false);
  };

  const updateProfile = async (data: Partial<User> & { currentPassword?: string; newPassword?: string }) => {
    const res = await api.patch('/auth/me', data);
    await mutate(res.data.user, false);
    return res.data.user;
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    login,
    signup,
    logout,
    updateProfile,
  };
}
