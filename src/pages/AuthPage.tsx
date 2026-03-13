import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === 'login') {
      const { error } = await signIn(email, password);
      setLoading(false);
      if (error) toast({ title: 'Login failed', description: error.message, variant: 'destructive' });
    } else {
      const { error } = await signUp(email, password, name);
      setLoading(false);
      if (error) toast({ title: 'Signup failed', description: error.message, variant: 'destructive' });
      else toast({ title: 'Check your email', description: 'We sent you a confirmation link.' });
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:flex-1 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/5" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-accent/5 blur-3xl" />
        <div className="relative z-10 max-w-md px-12 space-y-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">EduForFree</h1>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Education should be accessible to everyone. Start learning today with our comprehensive course library.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-accent" />
            <span>Free forever. No hidden costs.</span>
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 lg:max-w-lg flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">EduForFree</h1>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
            <p className="text-sm text-muted-foreground">
              {mode === 'login' ? 'Sign in to continue learning' : 'Join our free learning platform'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Display Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="h-11 bg-surface border-border/50 focus:border-primary/50" />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="h-11 bg-surface border-border/50 focus:border-primary/50" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" className="h-11 bg-surface border-border/50 focus:border-primary/50" />
            </div>
            <Button type="submit" className="w-full h-11 gap-2 font-medium" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <span className="text-primary font-medium">{mode === 'login' ? 'Sign up' : 'Sign in'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
