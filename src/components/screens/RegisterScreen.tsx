import React, { useState } from 'react';
import { Wallet } from 'lucide-react';

interface RegisterScreenProps {
  onRegister: (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<void>;
  onSwitchToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onRegister, onSwitchToLogin }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.includes('@') &&
    phone.trim().length > 0 &&
    password.length >= 6;

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    // ponytail: read DOM values — browser autofill doesn't fire React onChange
    const el = e.currentTarget.elements as typeof e.currentTarget.elements & {
      'first-name': HTMLInputElement;
      'last-name': HTMLInputElement;
      'reg-email': HTMLInputElement;
      phone: HTMLInputElement;
      'reg-password': HTMLInputElement;
    };
    const data = {
      first_name: el['first-name'].value.trim(),
      last_name: el['last-name'].value.trim(),
      email: el['reg-email'].value.trim(),
      phone: el.phone.value.trim(),
      password: el['reg-password'].value,
    };
    setFirstName(data.first_name);
    setLastName(data.last_name);
    setEmail(data.email);
    setPhone(data.phone);
    setPassword(data.password);
    const ok =
      data.first_name.length > 0 &&
      data.last_name.length > 0 &&
      data.email.includes('@') &&
      data.phone.length > 0 &&
      data.password.length >= 6;
    if (!ok) {
      setError('Fill all fields; password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onRegister(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-[15px] focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow';

  return (
    <div className="min-h-screen w-full bg-[#f1f5f9] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 shadow-xl w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
            <Wallet className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
          <p className="text-sm text-gray-500 mt-1.5">Start tracking your money</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                First name
              </label>
              <input
                id="first-name"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ada"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="last-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                Last name
              </label>
              <input
                id="last-name"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Lovelace"
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              id="reg-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+234..."
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <input
              id="reg-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className={inputCls}
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
            Register
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-7">
          Already have an account?{' '}
          <button onClick={onSwitchToLogin} className="font-bold text-blue-600 hover:text-blue-700 cursor-pointer">
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};
