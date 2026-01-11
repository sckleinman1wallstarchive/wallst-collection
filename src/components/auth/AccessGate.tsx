import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import gateBackground from '@/assets/gate-background.png';
import { toast } from 'sonner';

interface AccessGateProps {
  children: React.ReactNode;
}

export function AccessGate({ children }: AccessGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener BEFORE checking session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      setIsLoading(false);
    });

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}`,
        });
        if (error) throw error;
        toast.success('Password reset email sent! Check your inbox.');
        setIsForgotPassword(false);
      } else if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success('Account created! You can now sign in.');
        setIsSignUp(false);
        setPassword('');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-[#f5f5f0] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Full-screen background image */}
      <img
        src={gateBackground}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-xs px-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <label 
              htmlFor="email" 
              className="block text-xs tracking-[0.2em] uppercase text-[#f5f5f0]/70 font-light"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              className="h-12 bg-transparent border-0 border-b-2 border-[#f5f5f0]/50 rounded-none px-0 text-lg font-light tracking-wide text-[#f5f5f0] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-[#f5f5f0] placeholder:text-[#f5f5f0]/40"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          {!isForgotPassword && (
            <div className="space-y-3">
              <label 
                htmlFor="password" 
                className="block text-xs tracking-[0.2em] uppercase text-[#f5f5f0]/70 font-light"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                className="h-12 bg-transparent border-0 border-b-2 border-[#f5f5f0]/50 rounded-none px-0 text-lg font-light tracking-wide text-[#f5f5f0] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-[#f5f5f0] placeholder:text-[#f5f5f0]/40"
                placeholder="•••••••"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                minLength={6}
                required
              />
            </div>
          )}

          {error && (
            <p className="text-xs tracking-wide text-red-400 font-light">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-[#f5f5f0] hover:bg-[#e5e5e0] text-[#1a1a1a] rounded-none text-xs tracking-[0.15em] uppercase font-light transition-colors duration-300 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
            ) : (
              isForgotPassword ? 'Send Reset Email' : isSignUp ? 'Create Account' : 'Sign In'
            )}
          </Button>

          {!isSignUp && !isForgotPassword && (
            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(true);
                setError(null);
              }}
              className="w-full text-center text-xs tracking-[0.1em] text-[#f5f5f0]/60 hover:text-[#f5f5f0] font-light transition-colors"
            >
              Forgot password?
            </button>
          )}
        </form>

        {/* Toggle sign up / sign in / back */}
        <button
          type="button"
          onClick={() => {
            if (isForgotPassword) {
              setIsForgotPassword(false);
            } else {
              setIsSignUp(!isSignUp);
            }
            setError(null);
          }}
          className="mt-6 w-full text-center text-xs tracking-[0.1em] text-[#f5f5f0]/60 hover:text-[#f5f5f0] font-light transition-colors"
        >
          {isForgotPassword ? 'Back to sign in' : isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
        </button>

        {/* Minimal footer */}
        <p className="mt-12 text-center text-[10px] tracking-[0.3em] uppercase text-[#f5f5f0]/50 font-light">
          Private Access
        </p>
      </div>
    </div>
  );
}
