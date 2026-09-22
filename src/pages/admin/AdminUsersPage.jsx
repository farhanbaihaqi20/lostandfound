import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  ShieldCheck,
  ShieldOff,
  Crown,
  UserCheck,
  UserX,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowLeft,
  Mail,
  Hash,
  Building2,
  Phone,
  Calendar,
  Loader2,
  X,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AdminNavTabs } from '../../components/AdminNavTabs';
import { getAllUsers, searchUsers, setUserRole } from '../../lib/adminService';

export const AdminUsersPage = () => {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('semua'); // 'semua' | 'admin' | 'user'
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Detail panel state
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data, error: fetchError } = await getAllUsers();
    if (fetchError) {
      setError(fetchError);
    } else {
      setUsers(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter & Search
  useEffect(() => {
    let result = [...users];

    // Filter by role
    if (filterRole === 'admin') {
      result = result.filter(u => u.role === 'admin');
    } else if (filterRole === 'user') {
      result = result.filter(u => u.role === 'user');
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(u =>
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.full_name && u.full_name.toLowerCase().includes(q)) ||
        (u.nim && u.nim.toLowerCase().includes(q))
      );
    }

    setFilteredUsers(result);
  }, [users, filterRole, searchQuery]);

  // Clear success message after 4s
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const handleRoleChange = async () => {
    if (!confirmModal) return;
    setProcessing(true);

    const { targetUser, newRole } = confirmModal;
    const { success, error: roleError } = await setUserRole(targetUser.id, newRole);

    if (success) {
      setSuccessMsg(
        newRole === 'admin'
          ? `✅ ${targetUser.full_name} berhasil dijadikan Admin!`
          : `✅ ${targetUser.full_name} berhasil dihapus dari Admin.`
      );
      // Refresh data
      await fetchUsers();
    } else {
      setError(roleError || 'Gagal mengubah role pengguna.');
    }

    setProcessing(false);
    setConfirmModal(null);
  };

  const openConfirm = (targetUser, newRole) => {
    setError('');
    setConfirmModal({ targetUser, newRole });
  };

  const adminCount = users.filter(u => u.role === 'admin').length;
  const userCount = users.filter(u => u.role === 'user').length;

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  return (
    <div className="container pb-mobile-nav" style={{ paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '960px' }}>

      <AdminNavTabs />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link to="/admin" style={{
          width: '36px', height: '36px', borderRadius: 'var(--radius-sm)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--bg-surface-alt)', color: 'var(--text-secondary)',
          transition: 'all 0.2s'
        }}>
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Users size={22} color="var(--primary-600)" /> Kelola Admin & Pengguna
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            Tambah atau hapus hak akses admin untuk pengguna terdaftar
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
        <div className="glass-card" style={{
          padding: '1rem 1.15rem', display: 'flex', alignItems: 'center', gap: '0.85rem',
          borderLeft: '4px solid var(--primary-600)'
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
            background: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <ShieldCheck size={20} color="var(--primary-700)" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{adminCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Admin Aktif</div>
          </div>
        </div>

        <div className="glass-card" style={{
          padding: '1rem 1.15rem', display: 'flex', alignItems: 'center', gap: '0.85rem',
          borderLeft: '4px solid var(--teal-600)'
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
            background: 'var(--teal-50)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <UserCheck size={20} color="var(--teal-600)" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{userCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pengguna Biasa</div>
          </div>
        </div>

        <div className="glass-card" style={{
          padding: '1rem 1.15rem', display: 'flex', alignItems: 'center', gap: '0.85rem',
          borderLeft: '4px solid var(--amber-500)'
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
            background: 'var(--warning-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Users size={20} color="var(--amber-600)" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{users.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Terdaftar</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
        {/* Search Input */}
        <div style={{
          flex: '1 1 260px', display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)',
          padding: '0.55rem 0.85rem', border: '1px solid var(--border-light)'
        }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Cari email, nama, atau NIM..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1, border: 'none', background: 'transparent', outline: 'none',
              fontSize: '0.85rem', color: 'var(--text-primary)',
              fontFamily: 'inherit'
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
              color: 'var(--text-muted)', display: 'flex'
            }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Role Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)', padding: '3px' }}>
          {[
            { key: 'semua', label: 'Semua' },
            { key: 'admin', label: 'Admin' },
            { key: 'user', label: 'User' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilterRole(tab.key)}
              style={{
                padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                background: filterRole === tab.key ? 'var(--primary-600)' : 'transparent',
                color: filterRole === tab.key ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button onClick={fetchUsers} disabled={loading} style={{
          display: 'flex', alignItems: 'center', gap: '0.3rem',
          padding: '0.45rem 0.75rem', borderRadius: 'var(--radius-sm)',
          fontSize: '0.78rem', fontWeight: 600, border: '1px solid var(--border-light)',
          background: 'var(--bg-surface)', color: 'var(--text-secondary)',
          cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
        }}>
          <RefreshCw size={14} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div style={{
          padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)',
          background: 'var(--danger-bg)', border: '1px solid var(--danger)',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          fontSize: '0.85rem', color: 'var(--danger)'
        }}>
          <XCircle size={16} />
          <span>{error}</span>
          <button onClick={() => setError('')} style={{
            marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--danger)', display: 'flex'
          }}>
            <X size={14} />
          </button>
        </div>
      )}

      {successMsg && (
        <div style={{
          padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)',
          background: 'var(--success-bg)', border: '1px solid var(--success)',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          fontSize: '0.85rem', color: 'var(--success)',
          animation: 'fadeIn 0.3s ease'
        }}>
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Users List */}
      {loading ? (
        <div style={{
          padding: '3rem', display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)'
        }}>
          <Loader2 size={32} style={{ animation: 'spin 0.8s linear infinite' }} color="var(--primary-500)" />
          <span style={{ fontSize: '0.85rem' }}>Memuat data pengguna...</span>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="glass-card" style={{
          padding: '3rem', textAlign: 'center', color: 'var(--text-muted)'
        }}>
          <UserX size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
            {searchQuery ? 'Tidak ada pengguna yang cocok dengan pencarian.' : 'Belum ada pengguna terdaftar.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {filteredUsers.map((u) => {
            const isCurrentUser = u.id === currentUser?.id;
            const isSuperAdmin = u.is_super_admin === true;
            const isAdmin = u.role === 'admin';

            return (
              <div
                key={u.id}
                className="glass-card"
                style={{
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'all 0.2s',
                  borderLeft: isAdmin
                    ? `4px solid ${isSuperAdmin ? 'var(--amber-500)' : 'var(--primary-600)'}`
                    : '4px solid transparent',
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedUser(selectedUser?.id === u.id ? null : u)}
              >
                {/* Avatar */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: u.avatar_url
                      ? `url(${u.avatar_url}) center/cover no-repeat`
                      : 'linear-gradient(135deg, var(--primary-400), var(--primary-700))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', fontWeight: 700, color: '#fff'
                  }}>
                    {!u.avatar_url && (u.full_name?.[0] || '?').toUpperCase()}
                  </div>
                  {isSuperAdmin && (
                    <div style={{
                      position: 'absolute', bottom: '-2px', right: '-2px',
                      width: '18px', height: '18px', borderRadius: '50%',
                      background: 'var(--amber-500)', border: '2px solid var(--bg-surface)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Crown size={10} color="#fff" />
                    </div>
                  )}
                  {isAdmin && !isSuperAdmin && (
                    <div style={{
                      position: 'absolute', bottom: '-2px', right: '-2px',
                      width: '18px', height: '18px', borderRadius: '50%',
                      background: 'var(--primary-600)', border: '2px solid var(--bg-surface)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <ShieldCheck size={10} color="#fff" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {u.full_name || 'Tanpa Nama'}
                    </span>
                    {isSuperAdmin && (
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px',
                        borderRadius: '999px', background: 'var(--amber-500)', color: '#fff',
                        display: 'inline-flex', alignItems: 'center', gap: '2px'
                      }}>
                        <Crown size={9} /> SUPER
                      </span>
                    )}
                    {isAdmin && !isSuperAdmin && (
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px',
                        borderRadius: '999px', background: 'var(--primary-600)', color: '#fff'
                      }}>
                        ADMIN
                      </span>
                    )}
                    {isCurrentUser && (
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 600, padding: '1px 6px',
                        borderRadius: '999px', background: 'var(--bg-surface-alt)',
                        color: 'var(--text-muted)', border: '1px solid var(--border-light)'
                      }}>
                        Anda
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                    {u.email}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem', display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    {u.nim && <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Hash size={11} />{u.nim}</span>}
                    {u.fakultas && <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Building2 size={11} />{u.fakultas}</span>}
                  </div>
                </div>

                {/* Action Button */}
                <div style={{ flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                  {isCurrentUser ? (
                    <div style={{
                      fontSize: '0.72rem', color: 'var(--text-muted)',
                      padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-surface-alt)', fontWeight: 600
                    }}>
                      Akun Anda
                    </div>
                  ) : isSuperAdmin ? (
                    <div style={{
                      fontSize: '0.72rem', color: 'var(--amber-600)',
                      padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)',
                      background: 'var(--warning-bg)', fontWeight: 700,
                      display: 'flex', alignItems: 'center', gap: '0.25rem'
                    }}>
                      <Crown size={12} /> Dilindungi
                    </div>
                  ) : isAdmin ? (
                    <button
                      onClick={() => openConfirm(u, 'user')}
                      className="btn btn-sm"
                      style={{
                        fontSize: '0.75rem', fontWeight: 600,
                        background: 'var(--danger-bg)', color: 'var(--danger)',
                        border: '1px solid var(--danger)', gap: '0.25rem',
                        padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                        transition: 'all 0.2s'
                      }}
                    >
                      <ShieldOff size={13} /> Hapus Admin
                    </button>
                  ) : (
                    <button
                      onClick={() => openConfirm(u, 'admin')}
                      className="btn btn-sm"
                      style={{
                        fontSize: '0.75rem', fontWeight: 600,
                        background: 'var(--primary-600)', color: '#fff',
                        border: '1px solid var(--primary-600)', gap: '0.25rem',
                        padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                        transition: 'all 0.2s'
                      }}
                    >
                      <ShieldCheck size={13} /> Jadikan Admin
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Panel (expandable) */}
      {selectedUser && (
        <div className="glass-card" style={{
          padding: '1.25rem', marginTop: '-0.5rem',
          border: '1px solid var(--primary-200)',
          animation: 'fadeIn 0.25s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Info size={16} color="var(--primary-600)" /> Detail Pengguna
            </h3>
            <button onClick={() => setSelectedUser(null)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', display: 'flex'
            }}>
              <X size={16} />
            </button>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.65rem'
          }}>
            {[
              { icon: <Mail size={13} />, label: 'Email', value: selectedUser.email },
              { icon: <Hash size={13} />, label: 'NIM', value: selectedUser.nim || '-' },
              { icon: <Building2 size={13} />, label: 'Fakultas', value: selectedUser.fakultas || '-' },
              { icon: <Building2 size={13} />, label: 'Prodi', value: selectedUser.prodi || '-' },
              { icon: <Phone size={13} />, label: 'Telepon', value: selectedUser.phone || '-' },
              { icon: <Calendar size={13} />, label: 'Terdaftar', value: formatDate(selectedUser.created_at) },
            ].map((item, idx) => (
              <div key={idx} style={{
                padding: '0.55rem 0.75rem', background: 'var(--bg-surface-alt)',
                borderRadius: 'var(--radius-sm)', fontSize: '0.8rem'
              }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, marginBottom: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {item.icon} {item.label}
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info card */}
      <div className="glass-card" style={{
        padding: '0.85rem 1rem', display: 'flex', gap: '0.6rem',
        alignItems: 'flex-start', fontSize: '0.78rem', color: 'var(--text-muted)',
        background: 'var(--bg-surface-alt)', borderLeft: '3px solid var(--primary-400)'
      }}>
        <Info size={16} style={{ flexShrink: 0, marginTop: '1px' }} color="var(--primary-500)" />
        <div>
          <strong style={{ color: 'var(--text-secondary)' }}>Catatan:</strong> Admin dapat menyetujui/menolak laporan barang,
          memverifikasi klaim blind test, dan mengelola pesanan runner.
          Super Admin <Crown size={11} style={{ verticalAlign: 'middle' }} color="var(--amber-500)" /> tidak dapat dihapus dari role admin.
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease', padding: '1rem'
        }}>
          <div className="glass-card" style={{
            padding: '1.75rem', maxWidth: '420px', width: '100%',
            animation: 'fadeIn 0.25s ease'
          }}>
            {/* Icon */}
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%', margin: '0 auto 1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: confirmModal.newRole === 'admin' ? 'var(--primary-100)' : 'var(--danger-bg)'
            }}>
              {confirmModal.newRole === 'admin'
                ? <ShieldCheck size={26} color="var(--primary-700)" />
                : <AlertTriangle size={26} color="var(--danger)" />
              }
            </div>

            {/* Title */}
            <h3 style={{ textAlign: 'center', fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {confirmModal.newRole === 'admin' ? 'Jadikan Admin?' : 'Hapus Hak Admin?'}
            </h3>

            {/* Description */}
            <p style={{ textAlign: 'center', fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              {confirmModal.newRole === 'admin' ? (
                <>
                  <strong style={{ color: 'var(--text-primary)' }}>{confirmModal.targetUser.full_name}</strong>
                  {' '}({confirmModal.targetUser.email}) akan mendapatkan hak akses admin untuk moderasi laporan, verifikasi klaim, dan kelola pesanan.
                </>
              ) : (
                <>
                  Hak akses admin <strong style={{ color: 'var(--text-primary)' }}>{confirmModal.targetUser.full_name}</strong>
                  {' '}({confirmModal.targetUser.email}) akan dicabut. Pengguna ini tidak akan bisa mengakses panel admin.
                </>
              )}
            </p>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button
                onClick={() => setConfirmModal(null)}
                disabled={processing}
                style={{
                  flex: 1, padding: '0.65rem', borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                  background: 'var(--bg-surface-alt)', color: 'var(--text-secondary)',
                  border: '1px solid var(--border-light)', transition: 'all 0.2s'
                }}
              >
                Batal
              </button>
              <button
                onClick={handleRoleChange}
                disabled={processing}
                style={{
                  flex: 1, padding: '0.65rem', borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem', fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer',
                  background: confirmModal.newRole === 'admin' ? 'var(--primary-600)' : 'var(--danger)',
                  color: '#fff', border: 'none', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem'
                }}
              >
                {processing ? (
                  <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Memproses...</>
                ) : confirmModal.newRole === 'admin' ? (
                  <><ShieldCheck size={15} /> Ya, Jadikan Admin</>
                ) : (
                  <><ShieldOff size={15} /> Ya, Hapus Admin</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
