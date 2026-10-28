import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, CheckCircle2, Plus } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { AdminNavTabs } from '../../components/AdminNavTabs';
import { getRunnerStatusInfo } from '../../data/initialData';

const labelStyle = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.66rem',
  fontWeight: 700,
  letterSpacing: '0.09em',
  textTransform: 'uppercase',
  color: 'var(--ink-500)',
};

const QueueRow = ({ code, codeColor, title, meta, to, action }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.9rem',
      padding: '0.8rem 0',
      borderTop: '1px solid var(--border-subtle)',
    }}
  >
    <div style={{ minWidth: 0, flex: 1 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700, color: codeColor }}>
        {code}
      </div>
      <div
        style={{
          fontWeight: 700,
          fontSize: '0.9rem',
          color: 'var(--ink-900)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          marginTop: '1px',
        }}
      >
        {title}
      </div>
      {meta && (
        <div style={{ fontSize: '0.76rem', color: 'var(--ink-500)', marginTop: '2px' }}>{meta}</div>
      )}
    </div>
    <Link
      to={to}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        fontSize: '0.77rem',
        fontWeight: 700,
        color: 'var(--ink-900)',
        textDecoration: 'none',
        border: '1px solid var(--border-color)',
        borderRadius: '999px',
        padding: '0.38rem 0.8rem',
        whiteSpace: 'nowrap',
        background: 'var(--bg-surface)',
      }}
    >
      {action} <ArrowRight size={13} />
    </Link>
  </div>
);

const EmptyLine = ({ text }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.9rem 0',
      borderTop: '1px solid var(--border-subtle)',
      color: 'var(--ink-500)',
      fontSize: '0.82rem',
    }}
  >
    <CheckCircle2 size={15} color="#10b981" /> {text}
  </div>
);

export const AdminDashboard = () => {
  const { items, claims, orders, foundReports, stats } = useData();
  const { user } = useAuth();

  const pendingItems = items.filter((i) => i.post_status === 'menunggu_review');
  const pendingClaims = claims.filter((c) => c.status === 'menunggu_admin');
  const pendingFound = (foundReports || []).filter((r) => r.status === 'menunggu_review');
  const activeOrders = orders.filter((o) => o.status !== 'selesai' && o.status !== 'dibatalkan');
  const needTotal = pendingItems.length + pendingClaims.length + pendingFound.length;

  const firstName = (user?.full_name || 'Petugas Posko').split(' ')[0];

  return (
    <div className="container pb-mobile-nav" style={{ paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      <AdminNavTabs />

      {/* Header ringkas */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ maxWidth: '620px' }}>
          <div style={labelStyle}>Posko utama &mdash; Rektorat UNNES</div>
          <h1 style={{ fontSize: '1.55rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--ink-900)', margin: '0.3rem 0 0.3rem' }}>
            Selamat bertugas, {firstName}.
          </h1>
          <p style={{ fontSize: '0.87rem', color: 'var(--ink-600)', margin: 0, lineHeight: 1.55 }}>
            {needTotal > 0
              ? `Ada ${needTotal} antrean yang menunggu keputusan. Selesaikan dari yang paling lama.`
              : 'Semua antrean bersih. Posko siap menerima laporan baru.'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.77rem',
              fontWeight: 600,
              color: 'var(--ink-600)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
              borderRadius: '999px',
              padding: '0.45rem 0.8rem',
            }}
          >
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            Siaga &middot; {needTotal} perlu tindakan
          </span>
          <Link
            to="/lapor/temuan"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'var(--ink-900)',
              color: '#fff',
              fontSize: '0.8rem',
              fontWeight: 700,
              borderRadius: '999px',
              padding: '0.55rem 1rem',
              textDecoration: 'none',
            }}
          >
            <Plus size={14} /> Catat temuan
          </Link>
        </div>
      </div>

      {/* KPI strip — satu garis, bukan 4 kartu warna */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          background: 'var(--bg-surface)',
          overflow: 'hidden',
        }}
      >
        {[
          { label: 'Laporan menunggu', value: pendingItems.length, to: '/admin/moderasi', link: 'Review sekarang', dot: '#d97706' },
          { label: 'Klaim menunggu', value: pendingClaims.length, to: '/admin/klaim', link: 'Verifikasi klaim', dot: '#4f46e5' },
          { label: 'Runner aktif', value: activeOrders.length, to: '/admin/pesanan', link: 'Atur penugasan', dot: '#059669' },
        ].map((k, i) => (
          <Link
            key={k.label}
            to={k.to}
            style={{
              padding: '1rem 1.15rem',
              textDecoration: 'none',
              borderLeft: i === 0 ? 'none' : '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: k.dot, display: 'inline-block' }} />
              {k.label}
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ink-900)', lineHeight: 1.15, fontVariantNumeric: 'tabular-nums' }}>
              {k.value}
            </div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-700)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              {k.link} <ArrowRight size={13} />
            </div>
          </Link>
        ))}
        <div style={{ padding: '1rem 1.15rem', borderLeft: '1px solid var(--border-subtle)' }}>
          <div style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            Sudah kembali
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ink-900)', lineHeight: 1.15, fontVariantNumeric: 'tabular-nums' }}>
            {stats.totalReturned}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--ink-500)' }}>Dengan BAST digital resmi</div>
        </div>
      </div>

      {/* Isi: antrean + kondisi posko */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '1rem', alignItems: 'start' }}>
        {/* Kolom antrean */}
        <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '10px', background: 'var(--bg-surface)', padding: '1.1rem 1.2rem 0.4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: '0.4rem' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--ink-900)', margin: 0 }}>
              Perlu tindakan <span style={{ color: 'var(--ink-400)', fontWeight: 600 }}>({needTotal + activeOrders.length})</span>
            </h2>
            <span style={{ ...labelStyle }}>Urut: antrean laporan dulu</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.7rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--ink-900)' }}>Review laporan ({pendingItems.length})</span>
            <Link to="/admin/moderasi" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-600)', textDecoration: 'none' }}>
              Buka moderasi <ArrowUpRight size={13} style={{ verticalAlign: '-2px' }} />
            </Link>
          </div>
          {pendingItems.length === 0 ? (
            <EmptyLine text="Tidak ada postingan menunggu ACC." />
          ) : (
            pendingItems.slice(0, 3).map((item) => (
              <QueueRow
                key={item.id}
                code={`#${item.item_code}`}
                codeColor="#b45309"
                title={item.title}
                meta={`${item.type === 'hilang' ? 'Hilang' : 'Temuan'} · ${item.location_building || 'Lokasi belum diisi'}`}
                to="/admin/moderasi"
                action="Tinjau"
              />
            ))
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.7rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--ink-900)' }}>Verifikasi klaim ({pendingClaims.length})</span>
            <Link to="/admin/klaim" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-600)', textDecoration: 'none' }}>
              Buka klaim <ArrowUpRight size={13} style={{ verticalAlign: '-2px' }} />
            </Link>
          </div>
          {pendingClaims.length === 0 ? (
            <EmptyLine text="Tidak ada klaim blind test menunggu." />
          ) : (
            pendingClaims.slice(0, 3).map((c) => (
              <QueueRow
                key={c.id}
                code={`#${c.item_code} · ${c.blind_test_score ?? 0}%`}
                codeColor="var(--primary-indigo)"
                title={c.item_title}
                meta={`Pengklaim: ${c.claimer_name}`}
                to="/admin/klaim"
                action="Cocokkan"
              />
            ))
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.7rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--ink-900)' }}>Laporan temuan ({pendingFound.length})</span>
            <Link to="/admin/laporan-temuan" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-600)', textDecoration: 'none' }}>
              Buka laporan <ArrowUpRight size={13} style={{ verticalAlign: '-2px' }} />
            </Link>
          </div>
          {pendingFound.length === 0 ? (
            <EmptyLine text="Tidak ada laporan penemuan menunggu." />
          ) : (
            pendingFound.slice(0, 3).map((r) => (
              <QueueRow
                key={r.id}
                code={`#${r.item_code || 'temuan'}`}
                codeColor="#047857"
                title={r.item_title || r.reporter_name || 'Laporan penemuan'}
                meta={`Pelapor: ${r.reporter_name || '-'}`}
                to="/admin/laporan-temuan"
                action="Periksa"
              />
            ))
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.7rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--ink-900)' }}>Runner aktif ({activeOrders.length})</span>
            <Link to="/admin/pesanan" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-600)', textDecoration: 'none' }}>
              Buka runner <ArrowUpRight size={13} style={{ verticalAlign: '-2px' }} />
            </Link>
          </div>
          <div style={{ paddingBottom: '0.6rem' }}>
            {activeOrders.length === 0 ? (
              <EmptyLine text="Tidak ada pengantaran runner berjalan." />
            ) : (
              activeOrders.slice(0, 3).map((o) => {
                const s = getRunnerStatusInfo(o.status);
                return (
                  <QueueRow
                    key={o.id}
                    code={`#${o.item_code} · ${s.label}`}
                    codeColor="#047857"
                    title={o.item_title}
                    meta={`Antar ke: ${o.delivery_location || '-'}`}
                    to="/admin/pesanan"
                    action="Tugaskan"
                  />
                );
              })
            )}
          </div>
        </div>

        {/* Kolom samping */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '10px', background: 'var(--bg-surface)', padding: '1.1rem 1.2rem' }}>
            <div style={labelStyle}>Kondisi posko</div>
            {[
              ['Total antrean', String(needTotal)],
              ['Laporan temuan pending', String(pendingFound.length)],
              ['Klaim pending', String(pendingClaims.length)],
              ['Sudah dikembalikan', String(stats.totalReturned)],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0.55rem 0', borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--ink-600)' }}>{k}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.9rem', color: 'var(--ink-900)' }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '10px', background: 'var(--bg-surface)', padding: '0.4rem 1.2rem 0.7rem' }}>
            <div style={{ ...labelStyle, padding: '0.7rem 0 0.2rem' }}>Aksi cepat</div>
            {[
              ['Catat temuan posko', '/lapor/temuan'],
              ['Moderasi postingan', '/admin/moderasi'],
              ['Kelola admin & peran', '/admin/pengguna'],
              ['Buka katalog publik', '/jelajahi'],
            ].map(([label, to]) => (
              <Link
                key={to + label}
                to={to}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.65rem 0',
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: 'var(--ink-900)',
                  textDecoration: 'none',
                }}
              >
                {label} <ArrowRight size={14} color="var(--ink-400)" />
              </Link>
            ))}
            <div style={{ fontSize: '0.72rem', color: 'var(--ink-500)', paddingTop: '0.5rem' }}>
              Tercatat sebagai {user?.full_name || 'petugas posko'}.
            </div>
          </div>
        </aside>
      </div>

    </div>
  );
};

