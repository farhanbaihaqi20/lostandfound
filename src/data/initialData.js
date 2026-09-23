// Data Master Gedung & Lokasi Universitas Negeri Semarang (UNNES)
export const UNNES_BUILDINGS = [
  { id: 'rektorat', name: 'Gedung Rektorat UNNES', zone: 'Kampus Sekaran' },
  { id: 'perpustakaan', name: 'Perpustakaan Pusat UNNES', zone: 'Kampus Sekaran' },
  { id: 'gsg', name: 'Gedung Serba Guna (GSG)', zone: 'Kampus Sekaran' },
  { id: 'fmipa', name: 'FMIPA (Fakultas MIPA - Gedung D)', zone: 'Kampus Sekaran' },
  { id: 'ft', name: 'FT (Fakultas Teknik - Gedung E)', zone: 'Kampus Sekaran' },
  { id: 'fbs', name: 'FBS (Fakultas Bahasa & Seni - Gedung B)', zone: 'Kampus Sekaran' },
  { id: 'feb', name: 'FEB (Fakultas Ekonomika & Bisnis - Gedung C)', zone: 'Kampus Sekaran' },
  { id: 'fip', name: 'FIP (Fakultas Ilmu Pendidikan - Gedung A)', zone: 'Kampus Sekaran' },
  { id: 'fisip', name: 'FISIP (Fakultas Ilmu Sosial & Ilmu Politik)', zone: 'Kampus Sekaran' },
  { id: 'fik', name: 'FIK (Fakultas Ilmu Keolahragaan)', zone: 'Kampus Sekaran' },
  { id: 'fkk', name: 'FKK (Fakultas Kedokteran & Kesehatan)', zone: 'Kampus Sekaran' },
  { id: 'fh', name: 'FH (Fakultas Hukum)', zone: 'Kampus Sekaran' },
  { id: 'masjid', name: 'Masjid Ulul Albab UNNES', zone: 'Kampus Sekaran' },
  { id: 'kantin_simpang', name: 'Kantin Pusat Simpang Tujuh', zone: 'Kampus Sekaran' },
  { id: 'stadion', name: 'Stadion Tri Lomba Juang / Atletik UNNES', zone: 'Kampus Sekaran' },
  { id: 'pgsd_ngaliyan', name: 'Kampus PGSD Ngaliyan', zone: 'Kampus Luar' },
  { id: 'pgsd_kelud', name: 'Kampus Kelud (Pascasarjana)', zone: 'Kampus Luar' }
];

export const CATEGORIES = [
  { id: 'elektronik', name: 'Elektronik & Gadget', icon: 'Laptop', image: '/categories/elektronik.jpg' },
  { id: 'dompet', name: 'Dompet & Uang', icon: 'Wallet', image: '/categories/dompet.jpg' },
  { id: 'dokumen', name: 'Dokumen & KTM', icon: 'FileText', image: '/categories/dokumen.jpg' },
  { id: 'kunci', name: 'Kunci & Kendaraan', icon: 'Key', image: '/categories/kunci.jpg' },
  { id: 'tas', name: 'Tas & Pakaian', icon: 'ShoppingBag', image: '/categories/tas.jpg' },
  { id: 'aksesoris', name: 'Aksesoris & Lainnya', icon: 'Watch', image: '/categories/aksesoris.jpg' }
];

export const INITIAL_USERS = [];
export const INITIAL_ITEMS = [];
export const INITIAL_CLAIMS = [];
export const INITIAL_MATCHES = [];
export const INITIAL_ORDERS = [];
export const INITIAL_NOTIFICATIONS = [];


export const RUNNER_STATUS_CONFIG = {
  menunggu: {
    label: 'Menunggu Penugasan',
    fullLabel: 'Menunggu Penugasan Runner',
    badgeClass: 'badge-review',
    color: '#d97706',
    border: 'var(--amber-500)',
    description: 'Menunggu konfirmasi shift runner UNNES'
  },
  diterima: {
    label: 'Pesanan Diterima Runner',
    fullLabel: 'Pesanan Diterima Runner',
    badgeClass: 'badge-teal',
    color: '#0d9488',
    border: 'var(--teal-600)',
    description: 'Runner telah menerima pesanan & bersiap mengambil barang'
  },
  dalam_proses: {
    label: 'Runner Sedang OTW',
    fullLabel: 'Runner Sedang OTW Menuju Lokasi',
    badgeClass: 'badge-found',
    color: '#15803d',
    border: 'var(--success)',
    description: 'Runner sedang menuju titik temu pengantaran'
  },
  selesai: {
    label: 'Selesai (Sudah Diterima)',
    fullLabel: 'Selesai (Sudah Diterima Pemilik)',
    badgeClass: 'badge-found',
    color: '#15803d',
    border: 'var(--success)',
    description: 'Barang telah berhasil diserahterimakan ke pemilik'
  },
  dibatalkan: {
    label: 'Dibatalkan',
    fullLabel: 'Pesanan Dibatalkan',
    badgeClass: 'badge-lost',
    color: '#b91c1c',
    border: 'var(--danger)',
    description: 'Pesanan jasa runner dibatalkan'
  }
};

export const getRunnerStatusInfo = (status) => {
  return RUNNER_STATUS_CONFIG[status] || {
    label: (status || 'menunggu').replace(/_/g, ' '),
    fullLabel: (status || 'menunggu').replace(/_/g, ' '),
    badgeClass: 'badge-review',
    color: '#6b7280',
    border: 'var(--border-light)',
    description: 'Status pesanan runner kampus'
  };
};

