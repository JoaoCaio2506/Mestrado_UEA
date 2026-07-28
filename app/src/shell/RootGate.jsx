import { useAuth } from '../auth/AuthContext';
import AuthPage from '../auth/AuthPage';
import Shell from './Shell';

export default function RootGate() {
  const { session, loading } = useAuth();

  if (loading) return null;
  if (!session) return <AuthPage />;
  return <Shell />;
}
