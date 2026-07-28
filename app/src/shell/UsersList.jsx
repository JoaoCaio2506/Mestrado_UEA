import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import DateFilterBar from './DateFilterBar';
import Pagination from './Pagination';
import { matchesDateFilter, yearsPresentIn } from './dateFilter';
import './ShellTables.css';

const PAGE_SIZE = 10;

function initialsFor(name) {
  return (
    (name || '')
      .split(' ')
      .filter(Boolean)
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'
  );
}

function formatLastSeen(value) {
  if (!value) return 'nunca';
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `há ${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  return `há ${diffD} dia${diffD === 1 ? '' : 's'}`;
}

export default function UsersList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({ day: '', month: '', year: '' });
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data, error: fetchError } = await supabase.rpc('get_user_directory');
        if (cancelled) return;
        if (fetchError) setError(fetchError.message);
        else setRows(data || []);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Falha de rede');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const years = useMemo(() => yearsPresentIn(rows, (r) => r.last_sign_in_at), [rows]);
  const filteredRows = useMemo(
    () => rows.filter((row) => matchesDateFilter(row.last_sign_in_at, filter)),
    [rows, filter],
  );
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const pageRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  return (
    <div className="shell-page">
      <div className="shell-topbar">
        <p className="shell-eyebrow">Aba 3 de 3</p>
        <h2 className="shell-title">Usuários</h2>
        <p className="shell-sub">Quem já acessou o sistema, como entrou, e quanto usou.</p>
      </div>

      <DateFilterBar
        {...filter}
        years={years}
        onChange={(patch) => setFilter((prev) => ({ ...prev, ...patch }))}
        onClear={() => setFilter({ day: '', month: '', year: '' })}
      />

      <div className="shell-table-card">
        <div className="shell-table-toolbar">
          <span className="shell-table-count">
            {filteredRows.length} usuário{filteredRows.length === 1 ? '' : 's'}
          </span>
        </div>

        {loading ? (
          <div className="shell-table-empty">Carregando…</div>
        ) : error ? (
          <div className="shell-table-empty">Não foi possível carregar: {error}</div>
        ) : filteredRows.length === 0 ? (
          <div className="shell-table-empty">
            {rows.length === 0 ? 'Nenhum usuário ainda.' : 'Nenhum usuário encontrado para esse filtro (último acesso).'}
          </div>
        ) : (
          <>
            <div className="shell-table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>Login via</th>
                    <th>Inferências</th>
                    <th>Último acesso</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="shell-cell-user">
                          <div className="shell-avatar-sm">{initialsFor(u.full_name)}</div>
                          <div>
                            <div className="shell-cell-primary">{u.full_name || u.email}</div>
                            <div className="shell-cell-user-email">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="shell-provider-chip">
                          <i className={`ti ${u.provider === 'google' ? 'ti-brand-google' : 'ti-mail'}`} />
                          {u.provider === 'google' ? 'Google' : 'E-mail'}
                        </span>
                      </td>
                      <td className="mono shell-cell-primary">{u.inference_count}</td>
                      <td className="mono">{formatLastSeen(u.last_sign_in_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageCount={pageCount} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
