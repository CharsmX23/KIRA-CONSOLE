import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { supabase, UserProfile } from '../lib/supabase';

interface LoginScreenProps {
  onLogin: (profile: UserProfile) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(email: string, password: string) {
    console.log('[KIRA step 1] Login submitted for:', email);
    setLoading(true);
    setErrorMsg(null);

    // Clear any stale session before every attempt
    Object.keys(localStorage).filter(k => k.startsWith('sb-')).forEach(k => localStorage.removeItem(k));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      console.log('[KIRA step 2] signInWithPassword →', error ? `ERROR: ${error.message}` : `OK user_id=${data.user.id}`);

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      console.log('[KIRA step 3] Fetching profile for user_id:', data.user.id);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, role, badge_number, division')
        .eq('id', data.user.id)
        .maybeSingle();
      console.log('[KIRA step 4] Profile fetch →', profileError ? `ERROR: ${profileError.message}` : profileData ? `OK role=${profileData.role}` : 'NULL (no row)');

      if (profileError) {
        setErrorMsg(`Profile error: ${profileError.message}`);
        setLoading(false);
        return;
      }

      if (!profileData) {
        setErrorMsg('No officer profile found for this account.');
        setLoading(false);
        return;
      }

      console.log('[KIRA step 5] Login complete — transitioning to app as', profileData.full_name, '/', profileData.role);
      onLogin(profileData as UserProfile);
      setLoading(false);

    } catch (err: any) {
      console.error('[KIRA login] Unexpected catch:', err?.message);
      setErrorMsg(err?.message || 'Unexpected error occurred');
      setLoading(false);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    handleLogin(email, password);
  };

  const inputBorder = (hasError: boolean) =>
    `1px solid ${hasError ? '#C24A4A' : '#1E2D3D'}`;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#060A12', overflow: 'hidden', position: 'relative',
    }}>
      {/* Subtle grid background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(30,45,69,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(30,45,69,0.3) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      {/* Login card */}
      <div style={{
        position: 'relative', zIndex: 1,
        background: '#0D1117', border: '1px solid #1E2D3D', borderRadius: 12,
        padding: '44px 44px 36px', width: 420, boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <img src="/ksp_emblem_transparent.png" alt="KSP" style={{ height: 64, marginBottom: 16 }} />
          <div style={{
            fontSize: 22, fontWeight: 800, color: '#4D9EF5',
            fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', marginBottom: 6,
          }}>
            KIRA CONSOLE
          </div>
          <div style={{ fontSize: 11, color: '#64748B', letterSpacing: '0.08em', fontFamily: "'JetBrains Mono', monospace" }}>
            KARNATAKA INTELLIGENCE &amp; RECORDS ANALYSIS SYSTEM
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2ECC71', display: 'inline-block' }} className="blink" />
            <span style={{ fontSize: 10, color: '#86EFAC', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, letterSpacing: '0.12em' }}>
              SYSTEM ONLINE
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#64748B', letterSpacing: '0.12em', fontWeight: 600, marginBottom: 6 }}>
              OFFICER EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="username"
              style={{
                width: '100%', boxSizing: 'border-box',
                background: '#131920', border: inputBorder(!!errorMsg),
                borderRadius: 6, padding: '11px 14px',
                color: '#E8EDF2', fontSize: 14, outline: 'none', fontFamily: 'inherit',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => { if (!errorMsg) e.currentTarget.style.borderColor = '#243447'; }}
              onBlur={e => { if (!errorMsg) e.currentTarget.style.borderColor = '#1E2D3D'; }}
            />
          </div>

          {/* Password with visibility toggle */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#64748B', letterSpacing: '0.12em', fontWeight: 600, marginBottom: 6 }}>
              PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: '#131920', border: inputBorder(!!errorMsg),
                  borderRadius: 6, padding: '11px 40px 11px 14px',
                  color: '#E8EDF2', fontSize: 14, outline: 'none', fontFamily: 'inherit',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => { if (!errorMsg) e.currentTarget.style.borderColor = '#243447'; }}
                onBlur={e => { if (!errorMsg) e.currentTarget.style.borderColor = '#1E2D3D'; }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#7A7A80', padding: 4, display: 'flex', alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {errorMsg && (
            <div style={{
              background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)',
              borderRadius: 6, padding: '10px 14px', marginBottom: 16,
              fontSize: 13, color: '#FCA5A5', lineHeight: 1.5,
            }}>
              {errorMsg}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !email || !password}
            style={{
              width: '100%', padding: '12px',
              background: loading ? 'rgba(77,158,245,0.3)' : 'rgba(77,158,245,0.2)',
              border: '1px solid rgba(77,158,245,0.5)', borderRadius: 6,
              color: loading ? '#8B9EB5' : '#4D9EF5',
              fontSize: 13, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
              letterSpacing: '0.1em', cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {loading ? 'AUTHENTICATING…' : 'SIGN IN TO KIRA'}
          </button>
        </form>

        {/* Footer */}
        <div style={{ marginTop: 28, textAlign: 'center', fontSize: 10, color: '#4A4A4E', letterSpacing: '0.03em' }}>
          Authorized personnel only · Karnataka State Police
        </div>
      </div>
    </div>
  );
}
