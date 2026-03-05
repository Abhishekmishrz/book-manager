'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormData = z.infer<typeof schema>;

function PasswordStrength({ password }: { password: string }) {
  const strength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : 3;
  const labels = ['', 'Weak', 'Good', 'Strong'];
  const colors = ['', 'bg-danger', 'bg-warning', 'bg-success'];

  if (!password) return null;

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? colors[strength] : 'bg-border'}`} />
        ))}
      </div>
      <p className={`text-xs ${strength === 1 ? 'text-danger' : strength === 2 ? 'text-warning' : 'text-success'}`}>
        {labels[strength]}
      </p>
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const password = watch('password', '');

  const onSubmit = async (data: FormData) => {
    try {
      setServerError('');
      await signup(data.name, data.email, data.password);
      router.push('/library');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setServerError(msg || 'Something went wrong. Try again.');
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <span className="text-2xl">📚</span>
            <span className="font-display text-xl font-semibold text-text-primary">Bookshelf</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-text-primary">Start your library</h1>
          <p className="text-text-muted">Free, personal, yours.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="card p-8 space-y-5">
          {serverError && (
            <div className="bg-danger/10 border border-danger/20 text-danger text-sm px-4 py-3 rounded-lg">
              {serverError}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-primary">Your name</label>
            <input
              {...register('name')}
              type="text"
              placeholder="Jane Doe"
              className="w-full bg-surface-2 border border-border rounded-lg px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
            />
            {errors.name && <p className="text-danger text-xs">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-primary">Email</label>
            <input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              className="w-full bg-surface-2 border border-border rounded-lg px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
            />
            {errors.email && <p className="text-danger text-xs">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-primary">Password</label>
            <input
              {...register('password')}
              type="password"
              placeholder="Min. 8 characters"
              className="w-full bg-surface-2 border border-border rounded-lg px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
            />
            <PasswordStrength password={password} />
            {errors.password && <p className="text-danger text-xs">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-accent hover:bg-accent-hover disabled:opacity-60 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-text-muted text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-accent-light hover:text-accent transition-colors font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
