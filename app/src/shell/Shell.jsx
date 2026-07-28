import { useState } from 'react';
import App from '../App';
import MyInferences from './MyInferences';
import UsersList from './UsersList';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../auth/AuthContext';
import './Shell.css';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'ti-layout-dashboard' },
  { id: 'history', label: 'Minhas inferências', icon: 'ti-history' },
  { id: 'users', label: 'Usuários', icon: 'ti-users' },
];

export default function Shell() {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  const user = session?.user;
  const displayName = user?.user_metadata?.full_name || user?.email || '';
  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?';

  return (
    <div className="shell">
      <aside className={`shell-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="shell-brand">
          <div className="shell-brand-mark" />
          <div className="shell-brand-text">
            TB Multiagentes
            <span>Detecção pulmonar</span>
          </div>
        </div>

        <div className="shell-nav-label">Navegação</div>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`shell-nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            title={tab.label}
          >
            <i className={`ti ${tab.icon}`} />
            <span>{tab.label}</span>
          </button>
        ))}

        <div className="shell-spacer" />

        <button className="shell-toggle-row" onClick={() => setCollapsed((c) => !c)} title="Retrair/expandir menu">
          <i className="ti ti-chevron-left" />
          <span>Retrair menu</span>
        </button>

        <div className="shell-user">
          <div className="shell-user-avatar">{initials}</div>
          <div className="shell-user-info">
            <div className="shell-user-name">{displayName}</div>
            <div className="shell-user-email">{user?.email}</div>
          </div>
          <button className="shell-user-logout" title="Sair" onClick={() => supabase?.auth.signOut()}>
            <i className="ti ti-logout" />
          </button>
        </div>
      </aside>

      <main className="shell-main">
        {/* Kept mounted (not unmounted on tab switch) so in-progress uploads
            or chat state in the existing dashboard survive tab switches. */}
        <div style={{ display: activeTab === 'dashboard' ? 'contents' : 'none' }}>
          <App />
        </div>
        {activeTab === 'history' && <MyInferences />}
        {activeTab === 'users' && <UsersList />}
      </main>
    </div>
  );
}
