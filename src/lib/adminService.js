import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Admin Service - Manajemen Role Admin & Keamanan Pengguna
 * File terpisah agar tidak mengubah logic AuthContext / DataContext
 */

/**
 * Ambil semua user profiles dari database
 */
export async function getAllUsers() {
  if (!isSupabaseConfigured() || !supabase) {
    return { data: [], error: 'Supabase belum dikonfigurasi' };
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url, nim, fakultas, prodi, phone, role, is_super_admin, is_banned, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }
  return { data: data || [], error: null };
}

/**
 * Ubah role user via Supabase RPC (set_user_role)
 * Function ini di-enforce di level database:
 * - Hanya admin yang bisa panggil
 * - Tidak bisa ubah role sendiri
 * - Super Admin tidak bisa di-demote
 */
export async function setUserRole(targetUserId, newRole) {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: 'Supabase belum dikonfigurasi' };
  }

  // 1. Coba lewat RPC set_user_role
  const { error: rpcError } = await supabase.rpc('set_user_role', {
    target_user_id: targetUserId,
    new_role: newRole
  });

  if (!rpcError) {
    return { success: true, error: null };
  }

  // 2. Fallback: jika RPC gagal (misal kendala fungsi PL/pgSQL), coba direct update pada profiles (diizinkan untuk Admin via RLS & DB Trigger)
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq('id', targetUserId);

  if (!updateError) {
    return { success: true, error: null };
  }

  let friendlyMessage = rpcError?.message || updateError?.message || 'Gagal mengubah role pengguna';
  if (friendlyMessage.includes('Unauthorized') || friendlyMessage.includes('admin')) {
    friendlyMessage = 'Anda tidak memiliki izin untuk mengubah role pengguna.';
  } else if (friendlyMessage.includes('diri sendiri') || friendlyMessage.includes('your own')) {
    friendlyMessage = 'Anda tidak dapat mengubah role akun sendiri.';
  } else if (friendlyMessage.includes('Super Admin')) {
    friendlyMessage = 'Super Admin tidak dapat dihapus dari role admin.';
  }
  return { success: false, error: friendlyMessage };
}

/**
 * Blokir atau buka blokir user via Supabase RPC (set_user_ban_status)
 * Function ini di-enforce di level database:
 * - Hanya admin yang bisa panggil
 * - Tidak bisa memblokir akun sendiri
 * - Super Admin tidak bisa diblokir
 */
export async function setUserBanStatus(targetUserId, banStatus) {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: 'Supabase belum dikonfigurasi' };
  }

  // 1. Coba lewat RPC set_user_ban_status
  const { error: rpcError } = await supabase.rpc('set_user_ban_status', {
    target_user_id: targetUserId,
    ban_status: banStatus
  });

  if (!rpcError) {
    return { success: true, error: null };
  }

  // 2. Fallback: direct update pada profiles
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ is_banned: banStatus, updated_at: new Date().toISOString() })
    .eq('id', targetUserId);

  if (!updateError) {
    return { success: true, error: null };
  }

  let friendlyMessage = rpcError?.message || updateError?.message || 'Gagal mengubah status blokir';
  if (friendlyMessage.includes('Unauthorized') || friendlyMessage.includes('admin')) {
    friendlyMessage = 'Anda tidak memiliki izin untuk mengubah status blokir pengguna.';
  } else if (friendlyMessage.includes('sendiri')) {
    friendlyMessage = 'Anda tidak dapat memblokir akun sendiri.';
  } else if (friendlyMessage.includes('Super Admin')) {
    friendlyMessage = 'Super Admin tidak dapat diblokir.';
  }
  return { success: false, error: friendlyMessage };
}
