import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../auth/AuthContext';
import ImageLightbox from '../components/ImageLightbox';
import './ShellTables.css';

export default function MyInferences() {
  const { session } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

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

  const handlePreview = async (row) => {
    let src = null;
    if (row.image_path && supabase) {
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

      <div className="shell-table-card">
        <div className="shell-table-toolbar">
          <span className="shell-table-count">
            {rows.length} inferência{rows.length === 1 ? '' : 's'}
          </span>
        </div>

        {loading ? (
          <div className="shell-table-empty">Carregando…</div>
        ) : error ? (
          <div className="shell-table-empty">Não foi possível carregar: {error}</div>
        ) : rows.length === 0 ? (
          <div className="shell-table-empty">
            Nenhuma inferência ainda — faça um diagnóstico na aba Dashboard.
          </div>
        ) : (
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
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="shell-cell-primary">{row.file_name || '—'}</td>
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
        )}
      </div>

      <ImageLightbox image={previewImage} onClose={() => setPreviewImage(null)} />
    </div>
  );
}
