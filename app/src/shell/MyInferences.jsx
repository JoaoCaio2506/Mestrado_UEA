import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../auth/AuthContext';
import ImageLightbox from '../components/ImageLightbox';
import DateFilterBar from './DateFilterBar';
import Pagination from './Pagination';
import { matchesDateFilter, yearsPresentIn } from './dateFilter';
import './ShellTables.css';

const PAGE_SIZE = 10;

export default function MyInferences() {
  const { session } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [thumbUrls, setThumbUrls] = useState({});
  const [filter, setFilter] = useState({ day: '', month: '', year: '' });
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!supabase || !session?.user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from('inferences')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });
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
  }, [session?.user?.id]);

  const years = useMemo(() => yearsPresentIn(rows, (r) => r.created_at), [rows]);
  const filteredRows = useMemo(
    () => rows.filter((row) => matchesDateFilter(row.created_at, filter)),
    [rows, filter],
  );
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const pageRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  useEffect(() => {
    if (!supabase) return;
    const toFetch = pageRows.filter((row) => row.image_path && !thumbUrls[row.image_path]);
    if (toFetch.length === 0) return;
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        toFetch.map(async (row) => {
          const { data } = await supabase.storage.from('inference-images').createSignedUrl(row.image_path, 600);
          return [row.image_path, data?.signedUrl || null];
        }),
      );
      if (cancelled) return;
      setThumbUrls((prev) => {
        const next = { ...prev };
        entries.forEach(([path, url]) => {
          if (url) next[path] = url;
        });
        return next;
      });
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageRows.map((r) => r.image_path).join(',')]);

  const handlePreview = async (row) => {
    let src = thumbUrls[row.image_path] || null;
    if (!src && row.image_path && supabase) {
      const { data } = await supabase.storage.from('inference-images').createSignedUrl(row.image_path, 60);
      src = data?.signedUrl || null;
    }
    setPreviewImage({ src, diag: row.diag, pct: row.pct, agentName: row.agent_name, name: row.file_name });
  };

  return (
    <div className="shell-page">
      <div className="shell-topbar">
        <p className="shell-eyebrow">Aba 2 de 3</p>
        <h2 className="shell-title">Minhas inferências</h2>
        <p className="shell-sub">
          Todo diagnóstico que <strong>você</strong> já rodou, salvo por conta.
        </p>
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
            {filteredRows.length} inferência{filteredRows.length === 1 ? '' : 's'}
          </span>
        </div>

        {loading ? (
          <div className="shell-table-empty">Carregando…</div>
        ) : error ? (
          <div className="shell-table-empty">Não foi possível carregar: {error}</div>
        ) : filteredRows.length === 0 ? (
          <div className="shell-table-empty">
            {rows.length === 0
              ? 'Nenhuma inferência ainda — faça um diagnóstico na aba Dashboard.'
              : 'Nenhuma inferência encontrada para esse filtro.'}
          </div>
        ) : (
          <>
            <div className="shell-table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Imagem</th>
                    <th>Data</th>
                    <th>Modelo</th>
                    <th>Resultado</th>
                    <th>Confiança</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <div className="shell-cell-image">
                          {row.image_path && thumbUrls[row.image_path] ? (
                            <img className="shell-thumb" src={thumbUrls[row.image_path]} alt="" />
                          ) : (
                            <div className="shell-thumb-placeholder">
                              <i className="ti ti-photo" />
                            </div>
                          )}
                          <span className="shell-cell-primary shell-cell-image-name">{row.file_name || '—'}</span>
                        </div>
                      </td>
                      <td className="mono">{new Date(row.created_at).toLocaleString('pt-BR')}</td>
                      <td className="shell-cell-primary">{row.agent_name || '—'}</td>
                      <td>
                        <span className={`shell-pill ${row.diag === 'tb' ? 'tb' : 'normal'}`}>
                          {row.diag === 'tb' ? 'Tuberculose' : 'Normal'}
                        </span>
                      </td>
                      <td className="mono shell-cell-primary">{row.pct}%</td>
                      <td>
                        <button className="shell-icon-btn" title="Ver imagem" onClick={() => handlePreview(row)}>
                          <i className="ti ti-eye" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageCount={pageCount} onChange={setPage} />
          </>
        )}
      </div>

      <ImageLightbox image={previewImage} onClose={() => setPreviewImage(null)} />
    </div>
  );
}
