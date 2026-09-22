import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Search, 
  PlusCircle, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  Bike, 
  Award, 
  Sparkles, 
  Clock,
  HeartHandshake
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { CATEGORIES } from '../data/initialData';
import { ItemCard } from '../components/ItemCard';

export const LandingPage = () => {
  const { approvedItems, stats } = useData();

  // Get recent 4 items
  const recentItems = approvedItems.slice(0, 4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }} className="pb-mobile-nav">
      
      {/* 1. Hero Section */}
      <section style={{
        position: 'relative',
        padding: '4.5rem 0 3rem',
        background: 'radial-gradient(ellipse at top, rgba(13, 148, 136, 0.12), transparent 70%), radial-gradient(ellipse at bottom right, rgba(30, 58, 95, 0.15), transparent 70%)',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '820px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          
          {/* Badge Kampus */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.35rem 1rem 0.35rem 0.45rem',
            borderRadius: 'var(--radius-full)',
            background: 'var(--primary-50)',
            color: 'var(--primary-800)',
            fontSize: '0.825rem',
            fontWeight: 700,
            border: '1px solid var(--primary-200)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              overflow: 'hidden',
              background: '#FAF6EB',
              border: '1.5px solid var(--amber-400)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <img src="/logo.png" alt="Logo UNNES" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span>Portal Resmi Crowdsourcing Civitas UNNES</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)'
          }}>
            Kehilangan Barang di UNNES? <br />
            <span style={{ 
              background: 'linear-gradient(135deg, var(--primary-700) 0%, var(--teal-600) 50%, var(--amber-500) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Kami Bantu Temukan & Antarkan
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '640px'
          }}>
            Platform pencarian dan pengembalian barang hilang berbasis gotong royong mahasiswa Universitas Negeri Semarang. Aman dengan verifikasi Blind Test dan layanan Jasa Antar Runner.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', justifyContent: 'center', marginTop: '0.5rem' }}>
            <Link to="/jelajahi" className="btn btn-primary btn-lg" style={{ gap: '0.5rem' }}>
              <Search size={18} /> Cari Barang Saya
            </Link>
            <Link to="/lapor/pilih" className="btn btn-accent btn-lg" style={{ gap: '0.5rem' }}>
              <PlusCircle size={18} /> Lapor Barang
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            width: '100%',
            maxWidth: '650px',
            marginTop: '2.5rem',
            padding: '1.25rem',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--bg-glass-card)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--border-glass)',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                {stats.totalItems + 24}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Laporan Aktif
              </div>
            </div>
            <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border-light)', borderRight: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--teal-600)' }}>
                {stats.totalReturned + 18}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Barang Kembali
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--amber-500)' }}>
                100%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Verifikasi Admin
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Kategori Populer */}
      <section className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.35rem' }}>
          <div>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.35rem', 
              fontSize: '0.78rem', 
              fontWeight: 700, 
              color: 'var(--teal-600)', 
              textTransform: 'uppercase', 
              letterSpacing: '0.04em',
              marginBottom: '0.2rem' 
            }}>
              <Sparkles size={13} /> Kategori Barang Kampus
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Pilih Kategori Temuan</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Kategori yang paling sering dilaporkan di lingkungan UNNES</p>
          </div>
          <Link to="/jelajahi" style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary-600)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            Lihat Semua <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1rem'
        }}>
          {CATEGORIES.map(cat => (
            <Link 
              key={cat.id} 
              to={`/jelajahi?kategori=${cat.id}`}
              className="category-card"
            >
              <div className="category-img-box">
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="category-card-img" 
                  loading="lazy"
                />
              </div>
              <span className="category-title">{cat.name}</span>
              <span className="category-badge-count">
                {cat.count} Laporan
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Recent Items Showcase */}
      <section className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Laporan Terbaru Terverifikasi</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Barang hilang dan temuan yang telah di-ACC oleh Admin Posko</p>
          </div>
          <Link to="/jelajahi" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-600)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            Jelajahi Semua <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.25rem'
        }}>
          {recentItems.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* 4. Alur Kerja (Cara Kerja 3 Langkah) */}
      <section style={{ background: 'var(--bg-surface-alt)', padding: '3.5rem 0', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Cara Kerja Platform</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              Alur terstruktur yang menjamin keamanan data dan validitas kepemilikan barang.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            
            {/* Step 1 */}
            <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--primary-800)',
                color: '#fff',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                01
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Lapor & Sensor Katalog</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Unggah laporan barang. Nomor identitas (NIM/NIK) dan ciri rahasia disensor dari publik untuk keamanan data pribadi.
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--teal-600)',
                color: '#fff',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                02
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Review Admin & Blind Test</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Admin meninjau postingan sebelum tampil. Pemilik wajib menjawab minimal 2 pertanyaan blind test untuk membuka kontak.
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--amber-500)',
                color: '#fff',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                03
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Serah Terima / Jasa Runner</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Bertemu mandiri di titik ramai kampus atau gunakan Jasa Runner UNNES untuk diantarkan langsung ke lokasi kelas Anda.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Jasa Runner Kampus Showcase */}
      <section className="container">
        <div className="glass-panel" style={{
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          alignItems: 'center',
          background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.04) 0%, rgba(245, 158, 11, 0.08) 100%)',
          border: '1.5px solid rgba(245, 158, 11, 0.25)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.3rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--amber-100)',
              color: 'var(--amber-700)',
              fontSize: '0.775rem',
              fontWeight: 700,
              width: 'fit-content'
            }}>
              <Bike size={16} /> Technopreneurship Delivery Service
            </div>

            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, lineHeight: 1.25 }}>
              Sibuk Kuliah atau Beda Gedung? Gunakan Jasa Runner UNNES!
            </h2>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Runner resmi kami siap mengambil barang yang tertinggal di kelas, berkoordinasi dengan petugas/satpam gedung, dan mengantarkannya langsung ke lokasi Anda.
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-800)' }}>
                  Rp 7.000 - 10.000
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tarif Pick-up & Delivery</div>
              </div>
              <div style={{ borderLeft: '1px solid var(--border-light)', paddingLeft: '1.5rem' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--teal-600)' }}>
                  No Find, No Fee
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Barang Nihil Bebas Biaya</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div className="glass-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle2 size={22} color="var(--teal-600)" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Runner Mahasiswa Teridentifikasi</div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>Shift runner terjadwal dan terdata oleh Posko Kampus</div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle2 size={22} color="var(--teal-600)" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Bukti Foto Transparan</div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>Foto sudut ruangan & bukti barang dikirim langsung via WhatsApp</div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle2 size={22} color="var(--teal-600)" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Berita Acara Digital (BAST)</div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>Konfirmasi resmi bebas sengketa saat serah terima</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer style={{
        marginTop: '2rem',
        padding: '2.5rem 0 2rem',
        borderTop: '1px solid var(--border-light)',
        background: 'var(--bg-surface)'
      }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                overflow: 'hidden',
                background: '#FAF6EB',
                border: '2px solid var(--amber-400)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 3px 10px rgba(0,0,0,0.08)'
              }}>
                <img src="/logo.png" alt="UNNES Lost & Found Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.1rem' }}>
                  UNNES <span style={{ color: 'var(--amber-500)' }}>Lost & Found</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Platform Crowdsourcing Barang Hilang Civitas Universitas Negeri Semarang
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <Link to="/beranda">Beranda</Link>
              <Link to="/jelajahi">Jelajahi</Link>
              <Link to="/pengaturan">Disclaimer Hukum</Link>
              <Link to="/masuk">Masuk</Link>
            </div>
          </div>

          <div style={{
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <div>© {new Date().getFullYear()} UNNES Lost & Found. Inisiatif Technopreneurship Mahasiswa UNNES.</div>
            <div>Kampus Sekaran, Gunungpati, Kota Semarang</div>
          </div>
        </div>
      </footer>

    </div>
  );
};
