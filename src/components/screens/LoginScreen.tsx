import React, { useState } from 'react';
import { Wallet } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onSwitchToRegister: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = email.includes('@') && password.length >= 6;

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    // ponytail: read DOM values — browser autofill doesn't fire React onChange
    const el = e.currentTarget.elements as typeof e.currentTarget.elements & {
      email: HTMLInputElement;
      password: HTMLInputElement;
    };
    const em = el.email.value.trim();
    const pw = el.password.value;
    setEmail(em);
    setPassword(pw);
    if (!em.includes('@') || pw.length < 6) {
      setError('Enter a valid email and a password of at least 6 characters');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onLogin(em, pw);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f1f5f9] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 shadow-xl w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
            <Wallet className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Every Naira</h1>
          <p className="text-sm text-gray-500 mt-1.5">Sign in to manage your money</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-[15px] focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-[15px] focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
            />
          </div>

          {error && <p className="text-xs font-medium text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-xl text-[15px] font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            Sign In
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-7">
          Don't have an account?{' '}
          <button onClick={onSwitchToRegister} className="font-bold text-blue-600 hover:text-blue-700 cursor-pointer">
            Register
          </button>
        </p>
      </div>
    </div>
  );
};
