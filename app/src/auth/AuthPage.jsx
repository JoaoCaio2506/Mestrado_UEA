import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import './AuthPage.css';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" width="18" height="18">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.3 2.7l6-6C33.8 6.5 29.2 4.5 24 4.5 12.7 4.5 3.5 13.7 3.5 25S12.7 45.5 24 45.5 44.5 36.3 44.5 25c0-1.6-.2-3.1-.9-4.5Z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 16 18.9 13 24 13c2.8 0 5.3 1 7.3 2.7l6-6C33.8 6.5 29.2 4.5 24 4.5c-7.7 0-14.3 4.3-17.7 10.2Z"
      />
      <path
        fill="#4CAF50"
        d="M24 45.5c5.1 0 9.7-1.9 13.2-5.1l-6.1-5.2c-2 1.4-4.5 2.3-7.1 2.3-5.3 0-9.7-3.5-11.3-8.4l-6.5 5c3.3 6.6 10 11.4 17.8 11.4Z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.1 5.2C40.9 35.9 44.5 30.9 44.5 25c0-1.6-.2-3.1-.9-4.5Z"
      />
    </svg>
  );
}

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!supabase) {
    return (
      <div className="auth-stage">
        <div className="auth-card">
          <h1 className="auth-title">Autenticação não configurada</h1>
          <p className="auth-sub">
            Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para habilitar o login.
          </p>
        </div>
      </div>
    );
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (signInError) setError(signInError.message);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    setBusy(false);
    if (signUpError) setError(signUpError.message);
  };

  const handleGoogle = async () => {
    setError('');
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  return (
    <div className="auth-stage">
      {mode === 'login' ? (
        <form className="auth-card" onSubmit={handleLogin}>
          <div className="auth-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="#0d1f1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4Z" />
              <path d="M6 12v1a6 6 0 0 0 12 0v-1" />
              <path d="M12 19v3" />
              <path d="M8 22h8" />
            </svg>
          </div>
          <h1 className="auth-title">Entrar no sistema</h1>
          <p className="auth-sub">
            Sistema Multiagentes de Modelos Multimodais para detecção de Tuberculose Pulmonar.
          </p>

          <div className="auth-field">
            <label htmlFor="auth-email">E-mail</label>
            <input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="joao.nunes@exemplo.com"
            />
          </div>
          <div className="auth-field">
            <label htmlFor="auth-pass">Senha</label>
            <input
              id="auth-pass"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-btn-primary" type="submit" disabled={busy}>
            {busy ? 'Entrando…' : 'Entrar'}
          </button>

          <div className="auth-divider">ou continue com</div>

          <button className="auth-btn-google" type="button" onClick={handleGoogle}>
            <GoogleIcon />
            Continuar com Google
          </button>

          <p className="auth-footer">
            Não tem conta?{' '}
            <a
              onClick={() => {
                setError('');
                setMode('signup');
              }}
            >
              Cadastre-se
            </a>
          </p>
        </form>
      ) : (
        <form className="auth-card" onSubmit={handleSignup}>
          <button
            type="button"
            className="auth-back-link"
            onClick={() => {
              setError('');
              setMode('login');
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            Voltar para login
          </button>

          <h1 className="auth-title">Criar conta</h1>
          <p className="auth-sub">Sem aprovação nem burocracia — é só se cadastrar e começar a usar.</p>

          <div className="auth-field">
            <label htmlFor="auth-signup-name">Nome completo</label>
            <input
              id="auth-signup-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Maria Fernandes"
            />
          </div>
          <div className="auth-field">
            <label htmlFor="auth-signup-email">E-mail</label>
            <input
              id="auth-signup-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="maria.f@exemplo.com"
            />
          </div>
          <div className="auth-field">
            <label htmlFor="auth-signup-pass">Senha</label>
            <input
              id="auth-signup-pass"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-btn-primary" type="submit" disabled={busy}>
            {busy ? 'Criando…' : 'Criar conta'}
          </button>

          <div className="auth-divider">ou cadastre-se com</div>

          <button className="auth-btn-google" type="button" onClick={handleGoogle}>
            <GoogleIcon />
            Continuar com Google
          </button>
        </form>
      )}
    </div>
  );
}
