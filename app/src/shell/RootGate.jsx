import { useAuth } from '../auth/AuthContext';
import AuthPage from '../auth/AuthPage';
import ResetPasswordPage from '../auth/ResetPasswordPage';
import Shell from './Shell';

export default function RootGate() {
  const { session, loading, passwordRecovery } = useAuth();

  if (loading) return null;
  if (passwordRecovery) return <ResetPasswordPage />;
  if (!session) return <AuthPage />;
  return <Shell />;
}
