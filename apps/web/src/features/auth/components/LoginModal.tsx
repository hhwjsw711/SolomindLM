import { useState, useEffect } from 'react';
import { User, Mail, Lock, Loader2, Info } from 'lucide-react';
import { useAuth } from '../AuthContext';

interface LoginModalProps {
  onClose: () => void;
  authError?: string;
}

export function LoginModal({ onClose, authError }: LoginModalProps) {
  const { signIn, signUp, signInWithGoogle, isLoading: authLoading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Update local error when authError prop changes
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (isSignUp && password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setConfirmPassword('');
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError('');
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card rounded-xl shadow-2xl border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold font-sans">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary/50 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Auth Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
            <Info className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive font-serif">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground font-sans">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-background border-2 border-border rounded-xl font-serif focus:border-primary focus:outline-none transition-colors"
                placeholder="your@email.com"
                disabled={isLoading || authLoading}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground font-sans">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-background border-2 border-border rounded-xl font-serif focus:border-primary focus:outline-none transition-colors"
                placeholder={isSignUp ? 'At least 6 characters' : '••••••••'}
                disabled={isLoading || authLoading}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
              />
            </div>
          </div>

          {isSignUp && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground font-sans">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-background border-2 border-border rounded-xl font-serif focus:border-primary focus:outline-none transition-colors"
                  placeholder="••••••••"
                  disabled={isLoading || authLoading}
                  autoComplete="new-password"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || authLoading}
            className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-sans"
          >
            {isLoading || authLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isSignUp ? 'Creating account...' : 'Signing in...'}
              </>
            ) : (
              isSignUp ? 'Create Account' : 'Continue'
            )}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground font-sans">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading || authLoading}
            className="w-full py-3 bg-white text-gray-700 font-medium rounded-lg border-2 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-3 font-sans"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isLoading || authLoading ? 'Connecting...' : 'Sign in with Google'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              disabled={isLoading || authLoading}
              className="text-sm text-primary hover:text-primary/80 font-serif transition-colors"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
