import { useState } from 'react';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '@/lib/auth';

export function LoginView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError((e as Error).message || 'Googleログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('メールとパスワードを入力してください');
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email.trim(), password);
      } else {
        await signInWithEmail(email.trim(), password);
      }
    } catch (e) {
      setError((e as Error).message || '認証に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-12">
      <div className="flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-xl font-black uppercase tracking-wider text-foreground">
            総負荷量トラック
          </h1>
          <p className="mt-1 text-xs text-muted">ログインしてデータを同期</p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="flex items-center justify-center gap-3 rounded-2xl border border-border bg-surface px-6 py-4 text-sm font-semibold text-foreground transition hover:bg-surface-raised disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <svg className="size-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          Google でログイン
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs text-muted">
            <span className="bg-background px-2">または</span>
          </div>
        </div>

        <form onSubmit={handleEmail} className="flex flex-col gap-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              type="email"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted focus:border-neon focus:outline-none"
              autoComplete="email"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              type="password"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted focus:border-neon focus:outline-none"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-neon py-3 text-sm font-bold uppercase tracking-wider text-background shadow-[0_0_20px_rgba(204,255,0,0.2)] hover:shadow-[0_0_28px_rgba(204,255,0,0.3)] disabled:opacity-50"
          >
            {isSignUp ? 'アカウント作成' : 'ログイン'}
          </button>
          <button
            type="button"
            onClick={() => setIsSignUp((v) => !v)}
            className="text-center text-xs text-muted underline hover:text-foreground"
          >
            {isSignUp ? 'すでにアカウントがある場合はログイン' : 'アカウントを作成'}
          </button>
        </form>
      </div>
    </div>
  );
}
