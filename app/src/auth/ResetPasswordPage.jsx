import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import BrandMark from '../components/BrandMark';
import './AuthPage.css';

export default function ResetPasswordPage() {
  const { clearPasswordRecovery } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDone(true);
  };

  return (
    <div className="auth-stage">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-mark">
          <BrandMark />
        </div>
        <h1 className="auth-title">Definir nova senha</h1>
        <p className="auth-sub">Escolha uma nova senha para continuar acessando sua conta.</p>

        {done ? (
          <>
            <p className="auth-error auth-success">Senha atualizada com sucesso.</p>
            <button
              type="button"
              className="auth-btn-primary"
              onClick={() => clearPasswordRecovery()}
            >
              Ir para o painel
            </button>
          </>
        ) : (
          <>
            <div className="auth-field">
              <label htmlFor="reset-pass">Nova senha</label>
              <div className="auth-input-wrap">
                <input
                  id="reset-pass"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="auth-eye-toggle"
                  tabIndex={-1}
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  <i className={`ti ${showPassword ? 'ti-eye-off' : 'ti-eye'}`} />
                </button>
              </div>
            </div>
            <div className="auth-field">
              <label htmlFor="reset-pass-confirm">Confirmar nova senha</label>
              <div className="auth-input-wrap">
                <input
                  id="reset-pass-confirm"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button className="auth-btn-primary" type="submit" disabled={busy}>
              {busy ? 'Salvando…' : 'Salvar nova senha'}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
