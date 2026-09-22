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
  { id: 'elektronik', name: 'Elektronik & Gadget', icon: 'Laptop', image: '/categories/elektronik.jpg', count: 12 },
  { id: 'dompet', name: 'Dompet & Uang', icon: 'Wallet', image: '/categories/dompet.jpg', count: 8 },
  { id: 'dokumen', name: 'Dokumen & KTM', icon: 'FileText', image: '/categories/dokumen.jpg', count: 15 },
  { id: 'kunci', name: 'Kunci & Kendaraan', icon: 'Key', image: '/categories/kunci.jpg', count: 9 },
  { id: 'tas', name: 'Tas & Pakaian', icon: 'ShoppingBag', image: '/categories/tas.jpg', count: 11 },
  { id: 'aksesoris', name: 'Aksesoris & Lainnya', icon: 'Watch', image: '/categories/aksesoris.jpg', count: 6 }
];

export const INITIAL_USERS = [
  {
    id: 'user-admin-01',
    email: 'admin@unnes.ac.id',
    full_name: 'Admin Satpam & Posko UNNES',
    role: 'admin',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Pusat Koordinasi & Verifikasi Lost and Found UNNES Kampus Sekaran.',
    phone: '081234567890',
    nim: 'ADMIN-001',
    fakultas: 'Biro Umum & Keamanan UNNES',
    prodi: 'Keamanan Kampus',
    is_banned: false
  },
  {
    id: 'user-mahasiswa-01',
    email: 'mahasiswa@unnes.ac.id',
    full_name: 'Farhan Baihaqi',
    role: 'user',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    bio: 'Mahasiswa Teknik Informatika UNNES 2022. Suka ngoding dan ngopi.',
    phone: '085712345678',
    nim: '4101422001',
    fakultas: 'FMIPA',
    prodi: 'Teknik Informatika',
    is_banned: false
  },
  {
    id: 'user-mahasiswa-02',
    email: 'siti.khadijah@students.unnes.ac.id',
    full_name: 'Siti Khadijah',
    role: 'user',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: 'Mahasiswi Pendidikan Bahasa Inggris UNNES.',
    phone: '081398765432',
    nim: '2201421045',
    fakultas: 'FBS',
    prodi: 'Pendidikan Bahasa Inggris',
    is_banned: false
  },
  {
    id: 'user-mahasiswa-03',
    email: 'budi.santoso@students.unnes.ac.id',
    full_name: 'Budi Santoso',
    role: 'user',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Mahasiswa Teknik Sipil UNNES. Sering di Lab Rekayasa.',
    phone: '082155667788',
    nim: '5112420032',
    fakultas: 'FT',
    prodi: 'Teknik Sipil',
    is_banned: false
  }
];

export const INITIAL_ITEMS = [
  {
    id: 'item-001',
    user_id: 'user-mahasiswa-02',
    user_name: 'Siti Khadijah',
    item_code: 'LF-UNNES-201',
    type: 'temuan',
    title: 'Earphone TWS Case Putih (Baseus)',
    description: 'Ditemukan di meja belakang Ruang Kuliah D2 lantai 3 FMIPA setelah kelas kalkulus selesai sekitar jam 11 siang.',
    category: 'elektronik',
    location_building: 'FMIPA (Fakultas MIPA - Gedung D)',
    location_floor: 'Lantai 3',
    location_room: 'Ruang D2-301',
    location_detail: 'Di atas meja deretan paling pojok kiri dekat colokan listrik.',
    post_status: 'disetujui',
    item_status: 'terbuka',
    rejection_reason: '',
    photo_urls: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80'
    ],
    hidden_details: 'Ada stiker holografik kecil bergambar panda di bagian bawah case, dan lampu indikator kedip warna hijau.',
    blind_test_questions: [
      'Sebutkan merk & ciri khas fisik khusus di bagian bawah casing?',
      'Berapa persentase baterai perkiraan dan apakah ada goresan tertentu?'
    ],
    bounty_amount: 0,
    bounty_status: 'tidak_ada',
    date_lost_found: '2026-09-19T11:00:00.000Z',
    created_at: '2026-09-19T11:30:00.000Z'
  },
  {
    id: 'item-002',
    user_id: 'user-mahasiswa-01',
    user_name: 'Farhan Baihaqi',
    item_code: 'LF-UNNES-202',
    type: 'hilang',
    title: 'KTM UNNES & Dompet Kulit Cokelat Baellerry',
    description: 'Ketinggalan saat sholat Dzuhur berjamaah di Masjid Ulul Albab. Di dalamnya ada KTM UNNES atas nama Farhan Baihaqi, SIM C, dan beberapa lembar uang.',
    category: 'dompet',
    location_building: 'Masjid Ulul Albab UNNES',
    location_floor: 'Lantai 1 (Tempat Wudhu Pria)',
    location_room: 'Loker Rak Sepatu Pria',
    location_detail: 'Ditaruh di rak atas dekat tempat wudhu sebelah barat.',
    post_status: 'disetujui',
    item_status: 'terbuka',
    rejection_reason: '',
    photo_urls: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80'
    ],
    hidden_details: 'Ada struk Indomaret Sekaran tanggal 18 September dan foto polaroid ukuran 2R di selipan kartu.',
    blind_test_questions: [
      'Sebutkan nama lengkap pada KTM dan pecahan uang yang ada di dalamnya?',
      'Apa benda khusus foto/kertas yang terselip di balik slot kartu?'
    ],
    bounty_amount: 50000,
    bounty_status: 'aktif',
    date_lost_found: '2026-09-19T12:45:00.000Z',
    created_at: '2026-09-19T13:10:00.000Z'
  },
  {
    id: 'item-003',
    user_id: 'user-mahasiswa-03',
    user_name: 'Budi Santoso',
    item_code: 'LF-UNNES-203',
    type: 'temuan',
    title: 'Kunci Motor Honda Beat dengan Gantungan Boneka Labubu',
    description: 'Ditemukan tergantung di motor di parkiran Gedung E Lantai Dasar FT UNNES. Kunci sudah diamankan di Pos Satpam FT.',
    category: 'kunci',
    location_building: 'FT (Fakultas Teknik - Gedung E)',
    location_floor: 'Lantai Dasar',
    location_room: 'Parkiran Motor Mahasiswa Blok C',
    location_detail: 'Tergantung di kontak motor Beat merah plat H.',
    post_status: 'disetujui',
    item_status: 'terbuka',
    rejection_reason: '',
    photo_urls: [
      'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80'
    ],
    hidden_details: 'Warna baju boneka Labubu warna toska dan ada 1 anak kunci gembok kecil warna kuning kuningan.',
    blind_test_questions: [
      'Sebutkan warna spesifik pakaian/aksesoris gantungan Labubu?',
      'Berapa jumlah anak kunci pendamping dan jenisnya?'
    ],
    bounty_amount: 0,
    bounty_status: 'tidak_ada',
    date_lost_found: '2026-09-20T08:15:00.000Z',
    created_at: '2026-09-20T08:30:00.000Z'
  },
  {
    id: 'item-004',
    user_id: 'user-mahasiswa-01',
    user_name: 'Farhan Baihaqi',
    item_code: 'LF-UNNES-204',
    type: 'hilang',
    title: 'Jaket Hoodie Hitam Champion Size L',
    description: 'Tertinggal di kursi sofa Perpustakaan Pusat UNNES lantai 2 saat mengerjakan skripsi.',
    category: 'tas',
    location_building: 'Perpustakaan Pusat UNNES',
    location_floor: 'Lantai 2',
    location_room: 'Area Baca Skripsi & Jurnal',
    location_detail: 'Sofa bundar dekat rak buku nomor 004-006.',
    post_status: 'menunggu_review', // Pending review for admin moderation demo!
    item_status: 'terbuka',
    rejection_reason: '',
    photo_urls: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80'
    ],
    hidden_details: 'Ada robekan kecil di ujung tali hoodie kanan dan permen Woods di kantong depan.',
    blind_test_questions: [
      'Ada benda apa di kantong saku jaket?',
      'Sebutkan ciri cacat fisik/tanda khusus pada tali hoodie.'
    ],
    bounty_amount: 25000,
    bounty_status: 'aktif',
    date_lost_found: '2026-09-20T14:00:00.000Z',
    created_at: '2026-09-20T14:30:00.000Z'
  },
  {
    id: 'item-005',
    user_id: 'user-mahasiswa-02',
    user_name: 'Siti Khadijah',
    item_code: 'LF-UNNES-205',
    type: 'temuan',
    title: 'Kalkulator Scientific Casio fx-991EX ClassWiz',
    description: 'Ditemukan di bangku Gazebo FEB dekat pintu masuk kantin. Tertutup cover hitam.',
    category: 'elektronik',
    location_building: 'FEB (Fakultas Ekonomika & Bisnis - Gedung C)',
    location_floor: 'Lantai 1',
    location_room: 'Gazebo Mahasiswa Depan',
    location_detail: 'Di atas meja kayu gazebo kedua dari timur.',
    post_status: 'menunggu_review', // Pending review for admin moderation demo!
    item_status: 'terbuka',
    rejection_reason: '',
    photo_urls: [
      'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600&auto=format&fit=crop&q=80'
    ],
    hidden_details: 'Di balik tutup baterai ada tulisan spidol inisial "R.A" dan tahun "2023".',
    blind_test_questions: [
      'Ada tulisan apa di bagian dalam cover atau baterai?',
      'Kondisi fisik apakah ada lecet di tombol tertentu?'
    ],
    bounty_amount: 0,
    bounty_status: 'tidak_ada',
    date_lost_found: '2026-09-20T15:20:00.000Z',
    created_at: '2026-09-20T15:45:00.000Z'
  }
];

export const INITIAL_CLAIMS = [
  {
    id: 'claim-001',
    item_id: 'item-001',
    item_title: 'Earphone TWS Case Putih (Baseus)',
    item_code: 'LF-UNNES-201',
    claimer_id: 'user-mahasiswa-01',
    claimer_name: 'Farhan Baihaqi',
    claimer_email: 'mahasiswa@unnes.ac.id',
    claimer_phone: '085712345678',
    status: 'menunggu_admin',
    blind_test_answers: [
      {
        question: 'Sebutkan merk & ciri khas fisik khusus di bagian bawah casing?',
        answer: 'Merk Baseus Bowie series, di bawah case ada stiker gambar panda kecil agak memudar'
      },
      {
        question: 'Berapa persentase baterai perkiraan dan apakah ada goresan tertentu?',
        answer: 'Baterai waktu itu tinggal sekitar 30%, ada sedikit baret halus di sisi engsel kanan'
      }
    ],
    blind_test_score: 95,
    admin_notes: 'Jawaban cocok dengan detail rahasia penemu (stiker panda & merk Baseus).',
    created_at: '2026-09-20T12:00:00.000Z'
  }
];

export const INITIAL_MATCHES = [];

export const INITIAL_ORDERS = [
  {
    id: 'ord-001',
    match_id: null,
    item_title: 'KTM UNNES & Dompet Cokelat',
    item_code: 'LF-UNNES-202',
    requester_id: 'user-mahasiswa-01',
    requester_name: 'Farhan Baihaqi',
    requester_phone: '085712345678',
    service_type: 'pickup_delivery',
    status: 'dalam_proses',
    pickup_location: 'Pos Satpam Masjid Ulul Albab UNNES',
    delivery_location: 'Gedung D FMIPA Lantai 2 (Lab Komputer)',
    fee_amount: 8000,
    payment_status: 'belum_bayar',
    payment_method: 'tunai_saat_antar',
    runner_name: 'Mas Agil (Runner Shift Pagi)',
    runner_phone: '081299887766',
    runner_notes: 'Runner sudah mengamankan barang dari satpam dan sedang OTW menuju FMIPA.',
    evidence_photos: [
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80'
    ],
    created_at: '2026-09-20T13:30:00.000Z'
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-001',
    user_id: 'user-mahasiswa-01',
    type: 'moderasi',
    title: 'Laporan Barang Telah Disetujui! 🎉',
    body: 'Laporan barang hilang #LF-UNNES-202 telah di-ACC oleh Admin dan kini tayang di Feed publik UNNES.',
    link: '/barang/item-002',
    is_read: false,
    created_at: '2026-09-19T13:20:00.000Z'
  },
  {
    id: 'notif-002',
    user_id: 'user-mahasiswa-01',
    type: 'pesanan',
    title: 'Runner Ditugaskan 🏃',
    body: 'Pesanan antar barang #LF-UNNES-202 telah ditugaskan ke Mas Agil (Runner UNNES). Estimasi sampai 15 menit.',
    link: '/profil',
    is_read: false,
    created_at: '2026-09-20T13:35:00.000Z'
  },
  {
    id: 'notif-003',
    user_id: 'user-admin-01',
    type: 'moderasi',
    title: '2 Laporan Baru Menunggu Review 🛡️',
    body: 'Terdapat 2 laporan baru (LF-UNNES-204 & LF-UNNES-205) yang membutuhkan persetujuan Admin sebelum tayang.',
    link: '/admin/moderasi',
    is_read: false,
    created_at: '2026-09-20T15:46:00.000Z'
  },
  {
    id: 'notif-004',
    user_id: 'user-admin-01',
    type: 'klaim',
    title: 'Klaim Barang Butuh Verifikasi 🔍',
    body: 'Farhan Baihaqi mengajukan klaim untuk #LF-UNNES-201 dengan hasil Blind Test 95%. Mohon verifikasi.',
    link: '/admin/klaim',
    is_read: false,
    created_at: '2026-09-20T12:05:00.000Z'
  }
];
