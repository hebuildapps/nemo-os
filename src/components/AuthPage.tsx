import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff } from 'lucide-react';

const AuthPage: React.FC = () => {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    if (!email || !password) { setError('Email and password required'); return; }
    if (isSignUp && !name) { setError('Name required'); return; }
    setLoading(true);

    if (isSignUp) {
      const { error } = await signUp(email, password, name);
      if (error) setError(error);
      else setSuccess('Account created! Check your email to confirm, then sign in.');
    } else {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error);
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full bg-background flex items-center justify-center">
      <div className="bg-surface border-2 border-border p-[36px] w-[470px] max-w-[95vw]">
        <div className="font-pixel text-[12px] mb-[6px] leading-[1.6]">NEMO OS</div>
        <div className="text-[12px] text-muted-foreground mb-[24px] leading-[1.5]">
          {isSignUp ? 'Create your account to start prepping.' : 'Sign in to your prep station.'}
        </div>

        {error && (
          <div className="font-pixel text-[7px] text-nemo-red mb-[10px] p-2 border border-nemo-red bg-nemo-red/5">⚠ {error}</div>
        )}
        {success && (
          <div className="font-pixel text-[7px] text-nemo-green mb-[10px] p-2 border border-nemo-green bg-nemo-green/5">✓ {success}</div>
        )}

        {isSignUp && (
          <>
            <label className="font-pixel text-[7px] text-muted-foreground block mb-[5px]">YOUR NAME</label>
            <input
              value={name} onChange={e => setName(e.target.value)} maxLength={20}
              placeholder="Enter name..."
              className="w-full p-[9px_11px] border-[1.5px] border-border bg-surface2 font-mono text-[12px] mb-[14px] text-foreground outline-none focus:border-primary"
            />
          </>
        )}

        <label className="font-pixel text-[7px] text-muted-foreground block mb-[5px]">EMAIL</label>
        <input
          type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full p-[9px_11px] border-[1.5px] border-border bg-surface2 font-mono text-[12px] mb-[14px] text-foreground outline-none focus:border-primary"
        />

        <label className="font-pixel text-[7px] text-muted-foreground block mb-[5px]">PASSWORD</label>
        <div className="relative mb-[14px]">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full p-[9px_11px] pr-[36px] border-[1.5px] border-border bg-surface2 font-mono text-[12px] text-foreground outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-[8px] top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="font-pixel text-[9px] p-[13px] w-full bg-primary text-primary-foreground border-none cursor-pointer mt-[6px] transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {loading ? 'PROCESSING...' : isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
        </button>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="font-pixel text-[8px] p-[12px] w-full bg-transparent text-foreground border-[1.5px] border-border cursor-pointer mt-[7px] hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
        >
          CONTINUE WITH GOOGLE
        </button>

        <button
          onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess(''); }}
          className="font-pixel text-[7px] p-[9px] w-full bg-transparent text-muted-foreground border-[1.5px] border-border cursor-pointer mt-[7px] hover:border-primary hover:text-primary transition-colors"
        >
          {isSignUp ? 'ALREADY HAVE AN ACCOUNT? SIGN IN' : 'NEW HERE? CREATE ACCOUNT'}
        </button>
      </div>
    </div>
  );
};

export default AuthPage;
