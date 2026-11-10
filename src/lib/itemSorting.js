/**
 * Utilitas Pengurutan Katalog Barang UNNES Lost & Found
 * 
 * Skala Prioritas:
 * 1. Tier 1: Barang dengan Hadiah / Bounty yang masih aktif (bounty_amount > 0 & belum dikembalikan)
 *    - Diurutkan dari nominal hadiah tertinggi ke terendah, lalu waktu laporan terbaru.
 * 2. Tier 2: Barang Hilang aktif yang sedang dicari pemilik (type === 'hilang' & belum dikembalikan)
 *    - Diurutkan berdasarkan waktu laporan terbaru.
 * 3. Tier 3: Barang Temuan aktif yang menunggu klaim pemilik (type === 'temuan' & belum dikembalikan)
 *    - Diurutkan berdasarkan waktu laporan terbaru.
 * 4. Tier 4: Barang yang sudah selesai ditemukan / dikembalikan (item_status === 'dikembalikan' / status === 'selesai')
 *    - Diurutkan berdasarkan waktu laporan terbaru.
 */

/**
 * Mengecek apakah suatu item sudah berstatus selesai atau dikembalikan ke pemilik
 */
export const isItemReturned = (item) => {
  if (!item) return false;
  return (
    item.item_status === 'dikembalikan' ||
    item.status === 'selesai' ||
    item.post_status === 'selesai'
  );
};

/**
 * Mengecek apakah item memiliki hadiah/bounty yang masih aktif
 */
export const hasActiveBounty = (item) => {
  if (!item) return false;
  return !isItemReturned(item) && Number(item.bounty_amount || 0) > 0;
};

/**
 * Menghitung tingkat prioritas item:
 * 1: Bounty aktif
 * 2: Barang Hilang aktif
 * 3: Barang Temuan aktif
 * 4: Barang selesai / dikembalikan
 */
export const getItemPriorityRank = (item) => {
  if (!item) return 999;
  if (isItemReturned(item)) return 4;
  if (hasActiveBounty(item)) return 1;
  if (item.type === 'hilang') return 2;
  return 3; // 'temuan' aktif atau lainnya
};

/**
 * Fungsi pembanding (comparator) dua item berdasarkan skala prioritas
 */
export const compareItemsByPriority = (a, b) => {
  const rankA = getItemPriorityRank(a);
  const rankB = getItemPriorityRank(b);

  if (rankA !== rankB) {
    return rankA - rankB;
  }

  // Jika sama-sama berada di Tier 1 (bounty aktif), prioritaskan hadiah tertinggi
  if (rankA === 1) {
    const bountyA = Number(a?.bounty_amount || 0);
    const bountyB = Number(b?.bounty_amount || 0);
    if (bountyB !== bountyA) {
      return bountyB - bountyA;
    }
  }

  // Jika prioritas sama, urutkan berdasarkan waktu laporan terbaru
  const timeA = new Date(a?.date_lost_found || a?.created_at || 0).getTime();
  const timeB = new Date(b?.date_lost_found || b?.created_at || 0).getTime();
  return timeB - timeA;
};

/**
 * Mengurutkan salinan array items berdasarkan skala prioritas
 */
export const sortItemsByPriority = (itemsList = []) => {
  if (!Array.isArray(itemsList)) return [];
  return [...itemsList].sort(compareItemsByPriority);
};

