import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Admin Service - Manajemen Role Admin
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
 * Cari user berdasarkan email, nama, atau NIM
 */
export async function searchUsers(query) {
  if (!isSupabaseConfigured() || !supabase) {
    return { data: [], error: 'Supabase belum dikonfigurasi' };
  }

  const cleanQuery = query.trim();
  if (!cleanQuery) return getAllUsers();

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url, nim, fakultas, prodi, phone, role, is_super_admin, is_banned, created_at, updated_at')
    .or(`email.ilike.%${cleanQuery}%,full_name.ilike.%${cleanQuery}%,nim.ilike.%${cleanQuery}%`)
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

  const { error } = await supabase.rpc('set_user_role', {
    target_user_id: targetUserId,
    new_role: newRole
  });

  if (error) {
    // Parse error message dari database
    let friendlyMessage = error.message;
    if (error.message.includes('Unauthorized') || error.message.includes('admin')) {
      friendlyMessage = 'Anda tidak memiliki izin untuk mengubah role pengguna.';
    } else if (error.message.includes('diri sendiri') || error.message.includes('your own')) {
      friendlyMessage = 'Anda tidak dapat mengubah role akun sendiri.';
    } else if (error.message.includes('Super Admin')) {
      friendlyMessage = 'Super Admin tidak dapat dihapus dari role admin.';
    }
    return { success: false, error: friendlyMessage };
  }

  return { success: true, error: null };
}
