import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  INITIAL_ITEMS, 
  INITIAL_CLAIMS, 
  INITIAL_MATCHES, 
  INITIAL_ORDERS, 
  INITIAL_NOTIFICATIONS,
  getRunnerStatusInfo
} from '../data/initialData';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { deleteCloudinaryImage, generateReturnedBannerSvg } from '../lib/storageService';

const isUuid = (id) => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
const isLegacyDummyId = (id) => typeof id === 'string' && (id.startsWith('item-00') || id.startsWith('claim-00') || id.startsWith('ord-00') || id.startsWith('notif-00') || id.startsWith('LF-UNNES-20'));

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const { user } = useAuth();

  // 1. Items state
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('unnes_lf_items');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.filter(i => !isLegacyDummyId(i.id) && !isLegacyDummyId(i.item_code));
      } catch (e) {
        return [];
      }
    }
    return INITIAL_ITEMS;
  });

  // 2. Claims state
  const [claims, setClaims] = useState(() => {
    const saved = localStorage.getItem('unnes_lf_claims');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.filter(c => !isLegacyDummyId(c.id));
      } catch (e) {
        return [];
      }
    }
    return INITIAL_CLAIMS;
  });

  // 3. Matches state
  const [matches, setMatches] = useState(() => {
    const saved = localStorage.getItem('unnes_lf_matches');
    return saved ? JSON.parse(saved) : INITIAL_MATCHES;
  });

  // 4. Messages state
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('unnes_lf_messages');
    return saved ? JSON.parse(saved) : [];
  });

  // 5. Runner Orders state
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('unnes_lf_orders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.filter(o => !isLegacyDummyId(o.id));
      } catch (e) {
        return [];
      }
    }
    return INITIAL_ORDERS;
  });

  // 6. Notifications state
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('unnes_lf_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.filter(n => !isLegacyDummyId(n.id));
      } catch (e) {
        return [];
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  // 7. Found Reports state (Laporan penemuan barang hilang)
  const [foundReports, setFoundReports] = useState(() => {
    const saved = localStorage.getItem('unnes_lf_found_reports');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.filter(r => !isLegacyDummyId(r.id));
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Fetch items dari Supabase & sinkronisasi otomatis
  const fetchSupabaseItems = async () => {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*, profiles:user_id(full_name, avatar_url, email)')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const formatted = data.map(item => ({
          ...item,
          user_name: item.profiles?.full_name || 'Mahasiswa UNNES'
        }));

        setItems(prev => {
          const localOnly = prev.filter(i => !isUuid(i.id) && !isLegacyDummyId(i.id) && !formatted.some(f => f.id === i.id));
          return [...formatted, ...localOnly];
        });
      }
    } catch (err) {
      console.warn('Gagal memuat items dari Supabase:', err);
    }
  };

  // Fetch runner orders dari Supabase & sinkronisasi otomatis
  const fetchSupabaseOrders = async () => {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, requester:requester_id(full_name, avatar_url, email, phone)')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const formatted = data.map(order => ({
          ...order,
          requester_name: order.requester_name || order.requester?.full_name || 'Mahasiswa UNNES',
          requester_phone: order.requester_phone || order.requester?.phone || ''
        }));

        setOrders(prev => {
          const localOnly = prev.filter(o => !isUuid(o.id) && !isLegacyDummyId(o.id) && !formatted.some(f => f.id === o.id));
          return [...formatted, ...localOnly];
        });
      } else if (error) {
        console.warn('Gagal memuat orders dari Supabase:', error);
      }
    } catch (err) {
      console.warn('Gagal memuat orders dari Supabase:', err);
    }
  };

  // Fetch claims dari Supabase & sinkronisasi otomatis antar akun (user & admin)
  const fetchSupabaseClaims = async () => {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setClaims(prev => {
          const localOnly = prev.filter(c => !isUuid(c.id) && !isLegacyDummyId(c.id) && !data.some(d => d.id === c.id));
          return [...data, ...localOnly];
        });
      } else if (error) {
        console.warn('Gagal memuat claims dari Supabase:', error);
      }
    } catch (err) {
      console.warn('Gagal memuat claims dari Supabase:', err);
    }
  };

  // Fetch matches dari Supabase & sinkronisasi otomatis
  const fetchSupabaseMatches = async () => {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setMatches(prev => {
          const localOnly = prev.filter(m => !isUuid(m.id) && !data.some(d => d.id === m.id));
          return [...data, ...localOnly];
        });
      } else if (error) {
        console.warn('Gagal memuat matches dari Supabase:', error);
      }
    } catch (err) {
      console.warn('Gagal memuat matches dari Supabase:', err);
    }
  };

  // Fetch messages dari Supabase & sinkronisasi otomatis
  const fetchSupabaseMessages = async () => {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:sender_id(full_name, avatar_url)')
        .order('created_at', { ascending: true });

      if (!error && data) {
        const formatted = data.map(msg => ({
          ...msg,
          sender_name: msg.sender?.full_name || (msg.sender_id === 'system' ? 'Sistem' : 'Pengguna')
        }));
        setMessages(prev => {
          const localOnly = prev.filter(m => !isUuid(m.id) && !formatted.some(f => f.id === m.id));
          return [...formatted, ...localOnly];
        });
      } else if (error) {
        console.warn('Gagal memuat messages dari Supabase:', error);
      }
    } catch (err) {
      console.warn('Gagal memuat messages dari Supabase:', err);
    }
  };

  // Fetch notifications dari Supabase & sinkronisasi otomatis
  const fetchSupabaseNotifications = async () => {
    if (!isSupabaseConfigured() || !supabase || !user?.id) return;
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (user.role !== 'admin' && isUuid(user.id)) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;
      if (!error && data) {
        setNotifications(prev => {
          const localOnly = prev.filter(n => !isUuid(n.id) && !data.some(d => d.id === n.id));
          return [...data, ...localOnly];
        });
      } else if (error) {
        console.warn('Gagal memuat notifications dari Supabase:', error);
      }
    } catch (err) {
      console.warn('Gagal memuat notifications dari Supabase:', err);
    }
  };

  // Fetch found_reports dari Supabase & sinkronisasi otomatis
  const fetchSupabaseFoundReports = async () => {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const { data, error } = await supabase
        .from('found_reports')
        .select('*, reporter:reporter_id(full_name, avatar_url, email, phone)')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const formatted = data.map(report => ({
          ...report,
          reporter_name: report.reporter_name || report.reporter?.full_name || 'Mahasiswa UNNES',
          reporter_phone: report.reporter_phone || report.reporter?.phone || ''
        }));

        setFoundReports(prev => {
          const localOnly = prev.filter(r => !isUuid(r.id) && !isLegacyDummyId(r.id) && !formatted.some(f => f.id === r.id));
          return [...formatted, ...localOnly];
        });
      } else if (error) {
        console.warn('Gagal memuat found_reports dari Supabase:', error);
      }
    } catch (err) {
      console.warn('Gagal memuat found_reports dari Supabase:', err);
    }
  };

  useEffect(() => {
    fetchSupabaseItems();
    fetchSupabaseOrders();
    fetchSupabaseClaims();
    fetchSupabaseMatches();
    fetchSupabaseMessages();
    fetchSupabaseNotifications();
    fetchSupabaseFoundReports();

    if (!isSupabaseConfigured() || !supabase) return;

    // Supabase Realtime: dengarkan perubahan data dari semua pengguna/browser
    const itemsChannel = supabase
      .channel('public:items_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => {
        fetchSupabaseItems();
      })
      .subscribe();

    const ordersChannel = supabase
      .channel('public:orders_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchSupabaseOrders();
      })
      .subscribe();

    const claimsChannel = supabase
      .channel('public:claims_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'claims' }, () => {
        fetchSupabaseClaims();
      })
      .subscribe();

    const matchesChannel = supabase
      .channel('public:matches_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => {
        fetchSupabaseMatches();
      })
      .subscribe();

    const messagesChannel = supabase
      .channel('public:messages_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
        if (payload.eventType === 'INSERT' && payload.new) {
          setMessages(prev => {
            if (prev.some(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        } else {
          fetchSupabaseMessages();
        }
      })
      .subscribe();

    const notificationsChannel = supabase
      .channel('public:notifications_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        fetchSupabaseNotifications();
      })
      .subscribe();

    const foundReportsChannel = supabase
      .channel('public:found_reports_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'found_reports' }, () => {
        fetchSupabaseFoundReports();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(itemsChannel);
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(claimsChannel);
      supabase.removeChannel(matchesChannel);
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(foundReportsChannel);
    };
  }, [user?.id]);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('unnes_lf_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('unnes_lf_claims', JSON.stringify(claims));
  }, [claims]);

  useEffect(() => {
    localStorage.setItem('unnes_lf_matches', JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    localStorage.setItem('unnes_lf_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('unnes_lf_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('unnes_lf_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('unnes_lf_found_reports', JSON.stringify(foundReports));
  }, [foundReports]);

  // Notification helper with Supabase sync
  const addNotification = async (notif) => {
    const newNotif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      created_at: new Date().toISOString(),
      is_read: false,
      ...notif
    };
    setNotifications(prev => [newNotif, ...prev]);

    if (!isSupabaseConfigured() || !supabase) return;

    try {
      if (isUuid(notif.user_id)) {
        await supabase
          .from('notifications')
          .insert({
            user_id: notif.user_id,
            type: notif.type || 'info',
            title: notif.title || '',
            body: notif.body || '',
            link: notif.link || '',
            is_read: false
          });
      } else if (notif.user_id === 'user-admin-01') {
        // Broadcast notifikasi ke semua akun admin terdaftar di Supabase
        const { data: admins } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'admin');

        if (admins && admins.length > 0) {
          const adminNotifs = admins.map(adm => ({
            user_id: adm.id,
            type: notif.type || 'info',
            title: notif.title || '',
            body: notif.body || '',
            link: notif.link || '',
            is_read: false
          }));
          await supabase.from('notifications').insert(adminNotifs);
        }
      }
    } catch (err) {
      console.warn('Gagal sinkronisasi notifikasi ke Supabase:', err);
    }
  };

  // --- ITEM ACTIONS ---

  /**
   * User melaporkan barang hilang / temuan
   * Status awal selalu 'menunggu_review' (Harus di-ACC Admin)
   */
  const submitItem = async (itemData) => {
    const itemCode = `LF-UNNES-${Math.floor(100 + Math.random() * 900)}`;
    const isRealUser = isUuid(user?.id);

    // 1. Simpan ke Supabase jika terhubung & user login resmi
    if (isSupabaseConfigured() && supabase && isRealUser) {
      try {
        const { data, error } = await supabase
          .from('items')
          .insert({
            user_id: user.id,
            item_code: itemCode,
            type: itemData.type,
            title: itemData.title,
            description: itemData.description,
            category: itemData.category,
            location_building: itemData.location_building,
            location_floor: itemData.location_floor || '',
            location_room: itemData.location_room || '',
            location_detail: itemData.location_detail || '',
            post_status: 'menunggu_review',
            item_status: 'terbuka',
            photo_urls: itemData.photo_urls || [],
            hidden_details: itemData.hidden_details || '',
            blind_test_questions: itemData.blind_test_questions || [],
            bounty_amount: Number(itemData.bounty_amount) || 0,
            bounty_status: Number(itemData.bounty_amount) > 0 ? 'aktif' : 'tidak_ada',
            date_lost_found: itemData.date_lost_found ? new Date(itemData.date_lost_found).toISOString() : new Date().toISOString()
          })
          .select('*, profiles:user_id(full_name, avatar_url, email)')
          .single();

        if (!error && data) {
          const newItem = {
            ...data,
            user_name: data.profiles?.full_name || user.full_name || 'Mahasiswa UNNES'
          };
          setItems(prev => [newItem, ...prev.filter(i => i.id !== newItem.id)]);

          addNotification({
            user_id: 'user-admin-01',
            type: 'moderasi',
            title: 'Laporan Baru Masuk 📝',
            body: `${newItem.user_name} melaporkan barang ${newItem.type}: "${newItem.title}". Menunggu persetujuan.`,
            link: '/admin/moderasi'
          });

          addNotification({
            user_id: user?.id,
            type: 'moderasi',
            title: 'Laporan Berhasil Diajukan ⏳',
            body: `Laporan #${itemCode} sedang ditinjau oleh Admin. Anda akan mendapat notifikasi setelah disetujui.`,
            link: `/barang/${newItem.id}`
          });

          return newItem;
        } else if (error) {
          console.warn('Gagal insert ke Supabase, menggunakan penyimpanan lokal:', error);
        }
      } catch (err) {
        console.warn('Gagal insert ke Supabase, menggunakan penyimpanan lokal:', err);
      }
    }

    // 2. Fallback: Simpan ke local state / demo user
    const newItem = {
      id: `item-${Date.now()}`,
      user_id: user?.id || 'anonymous',
      user_name: user?.full_name || 'Mahasiswa UNNES',
      item_code: itemCode,
      post_status: 'menunggu_review',
      item_status: 'terbuka',
      created_at: new Date().toISOString(),
      date_lost_found: itemData.date_lost_found || new Date().toISOString(),
      photo_urls: itemData.photo_urls || [],
      ...itemData
    };

    setItems(prev => [newItem, ...prev]);

    // Notifikasi ke Admin
    addNotification({
      user_id: 'user-admin-01',
      type: 'moderasi',
      title: 'Laporan Baru Masuk 📝',
      body: `${newItem.user_name} melaporkan barang ${newItem.type}: "${newItem.title}". Menunggu persetujuan.`,
      link: '/admin/moderasi'
    });

    // Notifikasi ke User Pelapor
    addNotification({
      user_id: user?.id,
      type: 'moderasi',
      title: 'Laporan Berhasil Diajukan ⏳',
      body: `Laporan #${itemCode} sedang ditinjau oleh Admin. Anda akan mendapat notifikasi setelah disetujui.`,
      link: `/barang/${newItem.id}`
    });

    return newItem;
  };

  /**
   * Admin menyetujui postingan (ACC)
   */
  const approveItem = async (itemId) => {
    if (isSupabaseConfigured() && supabase && isUuid(itemId)) {
      try {
        const { error } = await supabase
          .from('items')
          .update({
            post_status: 'disetujui',
            reviewed_by: isUuid(user?.id) ? user.id : null,
            reviewed_at: new Date().toISOString(),
            rejection_reason: ''
          })
          .eq('id', itemId);

        if (error) console.warn('Supabase approve error:', error);
      } catch (err) {
        console.warn('Supabase approve error:', err);
      }
    }

    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        addNotification({
          user_id: item.user_id,
          type: 'moderasi',
          title: 'Laporan Telah Disetujui! 🎉',
          body: `Laporan #${item.item_code} ("${item.title}") telah disetujui Admin dan sekarang aktif di Feed UNNES.`,
          link: `/barang/${item.id}`
        });

        return {
          ...item,
          post_status: 'disetujui',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: ''
        };
      }
      return item;
    }));
  };

  /**
   * Admin menolak postingan dengan alasan
   */
  const rejectItem = async (itemId, reason) => {
    if (isSupabaseConfigured() && supabase && isUuid(itemId)) {
      try {
        const { error } = await supabase
          .from('items')
          .update({
            post_status: 'ditolak',
            rejection_reason: reason,
            reviewed_by: isUuid(user?.id) ? user.id : null,
            reviewed_at: new Date().toISOString()
          })
          .eq('id', itemId);

        if (error) console.warn('Supabase reject error:', error);
      } catch (err) {
        console.warn('Supabase reject error:', err);
      }
    }

    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        addNotification({
          user_id: item.user_id,
          type: 'moderasi',
          title: 'Laporan Ditolak Admin ❌',
          body: `Laporan #${item.item_code} ditolak. Alasan: ${reason || 'Foto atau informasi kurang jelas'}.`,
          link: '/profil'
        });

        return {
          ...item,
          post_status: 'ditolak',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: reason
        };
      }
      return item;
    }));
  };

  /**
   * Admin / Pemilik menghapus postingan secara permanen:
   * 1. Hapus semua foto asli di Cloudinary (menghemat storage)
   * 2. Hapus data di Supabase items table (menghemat DB quota)
   * 3. Hapus relasi klaim/match lokal terkait
   */
  const deleteItem = async (itemId) => {
    const targetItem = items.find(i => i.id === itemId);
    if (!targetItem) return { success: false, error: 'Item not found' };

    // 1. Bersihkan foto di Cloudinary
    if (targetItem.photo_urls && Array.isArray(targetItem.photo_urls)) {
      for (const url of targetItem.photo_urls) {
        if (url && typeof url === 'string' && url.includes('cloudinary.com')) {
          await deleteCloudinaryImage(url);
        }
      }
    }

    // 2. Hapus di database Supabase
    if (isSupabaseConfigured() && supabase && isUuid(itemId)) {
      try {
        const { error } = await supabase.from('items').delete().eq('id', itemId);
        if (error) {
          console.warn('Gagal menghapus item di Supabase:', error);
        }
      } catch (err) {
        console.warn('Gagal menghapus item di Supabase:', err);
      }
    }

    // 3. Bersihkan dari local state
    setItems(prev => prev.filter(i => i.id !== itemId));
    setClaims(prev => prev.filter(c => c.item_id !== itemId));
    setMatches(prev => prev.filter(m => m.item_id !== itemId));

    return { success: true };
  };

  /**
   * Tandai Barang Telah Kembali ke Pemilik:
   * 1. Hapus foto asli di Cloudinary untuk menghemat ruang & privasi
   * 2. Gantikan foto dengan SVG Banner resmi UNNES (0 KB Cloudinary)
   * 3. Update status item_status ke 'dikembalikan' di Supabase & kosongkan data rahasia
   */
  const markItemAsReturned = async (itemId) => {
    const targetItem = items.find(i => i.id === itemId);
    if (!targetItem) return { success: false, error: 'Item not found' };

    // 1. Hapus foto asli dari Cloudinary untuk efisiensi penyimpanan & privasi
    if (targetItem.photo_urls && Array.isArray(targetItem.photo_urls)) {
      for (const url of targetItem.photo_urls) {
        if (url && typeof url === 'string' && url.includes('cloudinary.com')) {
          await deleteCloudinaryImage(url);
        }
      }
    }

    // 2. Buat Banner SVG Pengganti (0 KB Cloudinary, instan render)
    const returnedBannerUrl = generateReturnedBannerSvg(targetItem.item_code, targetItem.title);

    // 3. Update di Supabase (item_status 'dikembalikan', hapus hidden_details untuk hemat DB)
    if (isSupabaseConfigured() && supabase && isUuid(itemId)) {
      try {
        const { error } = await supabase.from('items').update({
          item_status: 'dikembalikan',
          photo_urls: [returnedBannerUrl],
          hidden_details: '',
          updated_at: new Date().toISOString()
        }).eq('id', itemId);

        if (error) {
          console.warn('Gagal update status dikembalikan di Supabase:', error);
        }
      } catch (err) {
        console.warn('Gagal update status dikembalikan di Supabase:', err);
      }
    }

    // 4. Update local state
    setItems(prev => prev.map(i => i.id === itemId ? {
      ...i,
      item_status: 'dikembalikan',
      photo_urls: [returnedBannerUrl],
      hidden_details: '',
      updated_at: new Date().toISOString()
    } : i));

    // 5. Efek selebrasi Confetti
    try {
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}

    // 6. Notifikasi ke pemilik postingan
    addNotification({
      user_id: targetItem.user_id,
      type: 'serah_terima',
      title: 'Barang Telah Kembali ke Pemilik! 🎉',
      body: `Kasus barang #${targetItem.item_code} ("${targetItem.title}") telah resmi ditandai selesai. Foto asli telah dihapus dari server demi privasi & efisiensi.`,
      link: `/barang/${targetItem.id}`
    });

    return { success: true };
  };

  // --- CLAIM & BLIND TEST ACTIONS ---

  /**
   * User mengajukan klaim barang temuan via Blind Test
   * Mendukung pengajuan dari banyak pengguna berbeda, serta pengajuan ulang jika ditolak sebelumnya
   * Tersinkronisasi penuh dengan tabel public.claims di Supabase & Realtime ke Admin
   */
  const submitClaim = async ({ itemId, blindTestAnswers, message }) => {
    const targetItem = items.find(i => i.id === itemId);
    if (!targetItem) return { error: 'Barang tidak ditemukan' };

    // Jika barang sudah berhasil dikembalikan, tolak pengajuan klaim baru
    if (targetItem.item_status === 'dikembalikan') {
      alert('Pemberitahuan: Barang ini telah resmi dikembalikan kepada pemilik sah dan kasus telah ditutup.');
      return { error: 'Barang sudah dikembalikan' };
    }

    // Perhitungan kecocokan otomatis sederhana (skor 80 - 100%)
    const score = Math.floor(80 + Math.random() * 20);

    // Cek apakah user aktif sudah memiliki riwayat klaim untuk barang ini
    const existingIndex = claims.findIndex(c => 
      c.item_id === itemId && (
        (user?.id && c.claimer_id === user.id) ||
        (user?.email && c.claimer_email?.toLowerCase() === user.email?.toLowerCase())
      )
    );

    const existingClaim = existingIndex !== -1 ? claims[existingIndex] : null;

    // 1. PROTEKSI KLAIM PALSU: Jika klaim pengguna ini sebelumnya telah dibatalkan oleh Admin, tolak permanen!
    if (existingClaim?.status === 'dibatalkan') {
      alert('Peringatan Keamanan: Akses klaim Anda untuk barang ini telah ditutup permanen oleh Admin karena indikasi ketidaksesuaian/klaim palsu.');
      return { error: 'Akses klaim Anda telah dibatalkan oleh Admin dan tidak dapat diajukan kembali.' };
    }

    // 2. KUNCI KLAIM BARU: Jika barang sedang memiliki pemilik sah terverifikasi yang disetujui Admin, tolak pengajuan lain!
    const activeApproved = claims.find(c => String(c.item_id) === String(itemId) && c.status === 'disetujui');
    if (targetItem.item_status === 'diproses' || (activeApproved && activeApproved.claimer_id !== user?.id)) {
      alert('Pemberitahuan: Barang ini telah memiliki pemilik sah yang terverifikasi dan saat ini sedang dalam proses serah terima.');
      return { error: 'Barang telah memiliki pemilik terverifikasi' };
    }

    const isReapplication = existingClaim?.status === 'ditolak';

    let savedClaim = {
      id: existingClaim ? existingClaim.id : `claim-${Date.now()}`,
      item_id: itemId,
      item_title: targetItem.title,
      item_code: targetItem.item_code,
      claimer_id: user?.id,
      claimer_name: user?.full_name || 'Mahasiswa UNNES',
      claimer_email: user?.email || '',
      claimer_phone: user?.phone || '08xxxxxxxxxx',
      status: 'menunggu_admin',
      blind_test_answers: blindTestAnswers,
      blind_test_score: score,
      message: message || '',
      admin_notes: '',
      is_reapplication: isReapplication,
      updated_at: new Date().toISOString(),
      created_at: existingClaim ? existingClaim.created_at : new Date().toISOString()
    };

    // Sinkronisasi ke Supabase jika configured
    if (isSupabaseConfigured() && supabase && isUuid(itemId) && isUuid(user?.id)) {
      try {
        const payload = {
          item_id: itemId,
          item_title: targetItem.title,
          item_code: targetItem.item_code,
          claimer_id: user.id,
          claimer_name: user.full_name || 'Mahasiswa UNNES',
          claimer_email: user.email || '',
          claimer_phone: user.phone || '08xxxxxxxxxx',
          status: 'menunggu_admin',
          blind_test_answers: blindTestAnswers,
          blind_test_score: score,
          message: message || '',
          admin_notes: '',
          is_reapplication: isReapplication,
          updated_at: new Date().toISOString()
        };

        if (existingClaim && isUuid(existingClaim.id)) {
          const { data, error } = await supabase
            .from('claims')
            .update(payload)
            .eq('id', existingClaim.id)
            .select()
            .single();

          if (!error && data) {
            savedClaim = data;
          } else if (error) {
            console.warn('Gagal update klaim di Supabase:', error);
          }
        } else {
          // Cari dulu jika di database sebenarnya sudah ada klaim dari user untuk item ini
          const { data: existingDbClaim } = await supabase
            .from('claims')
            .select('id')
            .eq('item_id', itemId)
            .eq('claimer_id', user.id)
            .maybeSingle();

          if (existingDbClaim) {
            const { data, error } = await supabase
              .from('claims')
              .update(payload)
              .eq('id', existingDbClaim.id)
              .select()
              .single();

            if (!error && data) savedClaim = data;
          } else {
            const { data, error } = await supabase
              .from('claims')
              .insert(payload)
              .select()
              .single();

            if (!error && data) savedClaim = data;
          }
        }
      } catch (err) {
        console.warn('Error sinkronisasi klaim ke Supabase:', err);
      }
    }

    // Update local state
    if (existingIndex !== -1) {
      setClaims(prev => prev.map((c, idx) => idx === existingIndex ? savedClaim : c));
    } else {
      setClaims(prev => [savedClaim, ...prev.filter(c => c.id !== savedClaim.id)]);
    }

    // Notifikasi ke Admin untuk verifikasi
    addNotification({
      user_id: 'user-admin-01',
      type: 'klaim',
      title: isReapplication ? 'Pengajuan Ulang Klaim Blind Test 🔄' : 'Klaim Baru Menunggu Verifikasi 🔍',
      body: isReapplication 
        ? `${savedClaim.claimer_name} memperbarui rincian jawaban Blind Test untuk #${targetItem.item_code}.`
        : `${savedClaim.claimer_name} mengklaim barang #${targetItem.item_code}. Skor kecocokan: ${score}%.`,
      link: '/admin/klaim'
    });

    return { success: true, claim: savedClaim };
  };

  /**
   * Admin memverifikasi klaim (Valid / Tidak Valid)
   * Jika di-ACC, barang otomatis berstatus 'dikembalikan' dan tidak dapat diklaim lagi oleh pihak lain
   */
  const verifyClaim = async (claimId, isApproved, adminNotes = '') => {
    const claim = claims.find(c => c.id === claimId);
    if (!claim) return { error: 'Klaim tidak ditemukan' };

    const targetItem = items.find(i => i.id === claim.item_id);

    if (isApproved) {
      // 1. Sinkronisasi status klaim yang disetujui ke Supabase
      if (isSupabaseConfigured() && supabase && isUuid(claimId)) {
        try {
          await supabase.from('claims').update({
            status: 'disetujui',
            admin_notes: adminNotes || 'Terverifikasi sebagai pemilik sah paling cocok.',
            verified_by: isUuid(user?.id) ? user.id : null,
            verified_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }).eq('id', claimId);

          // Update klaim lain pada item yang sama menjadi ditolak
          if (isUuid(claim.item_id)) {
            await supabase.from('claims').update({
              status: 'ditolak',
              admin_notes: 'Barang telah berhasil diverifikasi dan diserahkan kepada pemohon lain yang deskripsinya lebih sesuai.',
              verified_by: isUuid(user?.id) ? user.id : null,
              verified_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }).eq('item_id', claim.item_id).neq('id', claimId).eq('status', 'menunggu_admin');
          }
        } catch (err) {
          console.warn('Gagal update klaim di Supabase:', err);
        }
      }

      // Update local state klaim
      setClaims(prev => prev.map(c => {
        if (c.id === claimId) {
          return {
            ...c,
            status: 'disetujui',
            admin_notes: adminNotes || 'Terverifikasi sebagai pemilik sah paling cocok.',
            verified_by: user?.id,
            verified_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
        if (c.item_id === claim.item_id && c.status === 'menunggu_admin') {
          return {
            ...c,
            status: 'ditolak',
            admin_notes: 'Barang telah berhasil diverifikasi dan diserahkan kepada pemohon lain yang deskripsinya lebih sesuai.',
            verified_by: user?.id,
            verified_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
        return c;
      }));

      // 2. Update status barang ke 'diproses' (Tahap Koordinasi Serah Terima & Pesanan Runner)
      // JANGAN langsung ubah ke 'dikembalikan' atau ganti foto asli dengan banner sampai barang benar-benar tuntas diserahterimakan!
      if (targetItem) {
        setItems(prev => prev.map(i => i.id === claim.item_id ? {
          ...i,
          item_status: 'diproses',
          updated_at: new Date().toISOString()
        } : i));

        if (isSupabaseConfigured() && supabase && isUuid(claim.item_id)) {
          try {
            await supabase.from('items').update({
              item_status: 'diproses',
              updated_at: new Date().toISOString()
            }).eq('id', claim.item_id);
          } catch (err) {
            console.warn('Gagal update item status di Supabase:', err);
          }
        }
      }

      // 3. Buat Match & Simpan ke Supabase jika valid UUID
      let createdMatchId = `match-${Date.now()}`;
      if (
        isSupabaseConfigured() && 
        supabase && 
        isUuid(claim.item_id) && 
        isUuid(claim.claimer_id) && 
        targetItem?.user_id && 
        isUuid(targetItem.user_id)
      ) {
        try {
          const matchPayload = {
            item_id: claim.item_id,
            item_title: claim.item_title || targetItem.title,
            item_code: claim.item_code || targetItem.item_code,
            finder_id: targetItem.user_id,
            finder_name: targetItem.user_name || 'Penemu',
            owner_id: claim.claimer_id,
            owner_name: claim.claimer_name,
            status: 'aktif',
            created_at: new Date().toISOString()
          };

          const { data: dbMatch, error: matchErr } = await supabase
            .from('matches')
            .insert(matchPayload)
            .select()
            .single();

          if (!matchErr && dbMatch) {
            createdMatchId = dbMatch.id;
          }
        } catch (err) {
          console.warn('Gagal membuat match di Supabase:', err);
        }
      }

      const newMatch = {
        id: createdMatchId,
        item_id: claim.item_id,
        item_title: claim.item_title,
        item_code: claim.item_code,
        finder_id: targetItem?.user_id,
        finder_name: targetItem?.user_name,
        owner_id: claim.claimer_id,
        owner_name: claim.claimer_name,
        status: 'aktif',
        created_at: new Date().toISOString()
      };
      setMatches(prev => [newMatch, ...prev.filter(m => m.id !== newMatch.id)]);

      // 4. Kirim pesan selamat datang dari sistem di ruang chat
      const welcomeMsg = {
        id: `msg-${Date.now()}`,
        match_id: newMatch.id,
        sender_id: 'system',
        content: `🎉 Selamat! Klaim kepemilikan barang #${claim.item_code} telah diverifikasi oleh Admin Posko. Ruang obrolan serah terima resmi dibuka. Pemohon dapat mengobrol langsung di sini atau memesan Jasa Runner Resmi UNNES untuk mengambil dan mengantarkan barang!`,
        type: 'system',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, welcomeMsg]);

      // 5. Notifikasi ke pemohon yang disetujui & penemu
      addNotification({
        user_id: claim.claimer_id,
        type: 'cocok',
        title: 'Klaim Kamu DIVERIFIKASI! 🎯',
        body: `Klaim barang #${claim.item_code} disetujui Admin! Akses Pesan Jasa Runner UNNES & Ruang Obrolan dengan penemu kini sudah terbuka.`,
        link: `/barang/${claim.item_id}`
      });

      if (targetItem?.user_id) {
        addNotification({
          user_id: targetItem.user_id,
          type: 'cocok',
          title: 'Pemilik Terverifikasi Ditemukan! 🤝',
          body: `Admin telah memverifikasi klaim barang #${claim.item_code} dari ${claim.claimer_name}. Ruang obrolan serah terima telah dibuka.`,
          link: `/pesan/${newMatch.id}`
        });
      }

      // Notifikasi ke pemohon lain yang mengajukan klaim untuk barang ini
      const otherClaimers = claims.filter(c => c.item_id === claim.item_id && c.id !== claimId && c.claimer_id !== claim.claimer_id);
      otherClaimers.forEach(oc => {
        addNotification({
          user_id: oc.claimer_id,
          type: 'klaim',
          title: `Status Laporan Barang #${claim.item_code}`,
          body: `Barang #${claim.item_code} telah resmi diserahkan kepada pemohon yang rincian ciri rahasianya paling sesuai.`,
          link: `/barang/${claim.item_id}`
        });
      });

      try {
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}

      return { success: true };
    } else {
      // Tolak klaim
      if (isSupabaseConfigured() && supabase && isUuid(claimId)) {
        try {
          await supabase.from('claims').update({
            status: 'ditolak',
            admin_notes: adminNotes || 'Penjelasan ciri rahasia belum cocok. Silakan ajukan ulang dengan rincian yang lebih detail.',
            verified_by: isUuid(user?.id) ? user.id : null,
            verified_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }).eq('id', claimId);
        } catch (err) {
          console.warn('Gagal tolak klaim di Supabase:', err);
        }
      }

      setClaims(prev => prev.map(c => c.id === claimId ? {
        ...c,
        status: 'ditolak',
        admin_notes: adminNotes || 'Penjelasan ciri rahasia belum cocok. Silakan ajukan ulang dengan rincian yang lebih detail.',
        verified_by: user?.id,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } : c));

      addNotification({
        user_id: claim.claimer_id,
        type: 'klaim',
        title: 'Klaim Belum Sesuai (Bisa Diajukan Ulang) ⚠️',
        body: `Klaim barang #${claim.item_code} belum sesuai verifikasi Admin. Catatan: ${adminNotes || 'Penjelasan kurang detail'}. Anda dapat mengajukan klaim ulang.`,
        link: `/barang/${claim.item_id}`
      });

      return { success: true };
    }
  };

  /**
   * Admin membatalkan verifikasi klaim yang sebelumnya disetujui (misal: terbukti klaim palsu / ada sanggahan yang benar)
   * Efek:
   * 1. Status klaim diubah menjadi 'dibatalkan' (user ini diblokir permanen dari klaim ulang untuk barang ini).
   * 2. Status barang dikembalikan ke 'terbuka' sehingga orang lain dapat mengajukan klaim kembali.
   * 3. Match serah terima dinonaktifkan ('dibatalkan').
   * 4. Notifikasi pencabutan dikirim ke pemohon palsu & penemu diberi tahu pencarian pemilik dibuka kembali.
   */
  const revokeClaimVerification = async (claimIdOrData, reason = '') => {
    const claimId = typeof claimIdOrData === 'string' ? claimIdOrData : claimIdOrData?.claimId;
    const itemId = typeof claimIdOrData === 'object' ? claimIdOrData?.itemId : null;

    let claim = claims.find(c => c.id === claimId);
    if (!claim && (itemId || claimId)) {
      const searchId = itemId || claimId;
      claim = claims.find(c => String(c.item_id) === String(searchId) && c.status === 'disetujui');
    }

    const resolvedClaimId = claim?.id || claimId;
    const resolvedItemId = claim?.item_id || itemId;
    const targetItem = items.find(i => String(i.id) === String(resolvedItemId));

    // 1. Update status klaim di Supabase & local state
    if (isSupabaseConfigured() && supabase && isUuid(resolvedClaimId)) {
      try {
        await supabase.from('claims').update({
          status: 'dibatalkan',
          admin_notes: reason || 'Verifikasi dibatalkan oleh Admin Posko (Klaim tidak sah / palsu).',
          verified_by: isUuid(user?.id) ? user.id : null,
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }).eq('id', resolvedClaimId);
      } catch (err) {
        console.warn('Gagal batalkan klaim di Supabase:', err);
      }
    } else if (isSupabaseConfigured() && supabase && isUuid(resolvedItemId)) {
      // Fallback update by item_id if claimId wasn't known
      try {
        await supabase.from('claims').update({
          status: 'dibatalkan',
          admin_notes: reason || 'Verifikasi dibatalkan oleh Admin Posko (Klaim tidak sah / palsu).',
          verified_by: isUuid(user?.id) ? user.id : null,
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }).eq('item_id', resolvedItemId).eq('status', 'disetujui');
      } catch (err) {
        console.warn('Gagal batalkan klaim via item_id di Supabase:', err);
      }
    }

    if (resolvedClaimId) {
      setClaims(prev => prev.map(c => (c.id === resolvedClaimId || (resolvedItemId && String(c.item_id) === String(resolvedItemId) && c.status === 'disetujui')) ? {
        ...c,
        status: 'dibatalkan',
        admin_notes: reason || 'Verifikasi dibatalkan oleh Admin Posko (Klaim tidak sah / palsu).',
        verified_by: user?.id,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } : c));
    }

    // 2. Kembalikan status barang menjadi 'terbuka' agar publik/orang lain bisa mengajukan klaim kembali
    if (targetItem) {
      setItems(prev => prev.map(i => String(i.id) === String(resolvedItemId) ? {
        ...i,
        item_status: 'terbuka',
        updated_at: new Date().toISOString()
      } : i));

      if (isSupabaseConfigured() && supabase && isUuid(resolvedItemId)) {
        try {
          await supabase.from('items').update({
            item_status: 'terbuka',
            updated_at: new Date().toISOString()
          }).eq('id', resolvedItemId);
        } catch (err) {
          console.warn('Gagal reset status item ke terbuka di Supabase:', err);
        }
      }
    }

    // 3. Batalkan match serah terima terkait
    setMatches(prev => prev.map(m => String(m.item_id) === String(resolvedItemId) && (claim?.claimer_id ? m.owner_id === claim.claimer_id : true) ? {
      ...m,
      status: 'dibatalkan'
    } : m));

    if (isSupabaseConfigured() && supabase && isUuid(resolvedItemId)) {
      try {
        await supabase.from('matches').update({
          status: 'dibatalkan'
        }).eq('item_id', resolvedItemId);
      } catch (err) {
        console.warn('Gagal batalkan match di Supabase:', err);
      }
    }

    // 4. Notifikasi ke user yang dibatalkan
    if (claim?.claimer_id) {
      addNotification({
        user_id: claim.claimer_id,
        type: 'klaim',
        title: 'Verifikasi Klaim DIBATALKAN ⚠️',
        body: `Status klaim Anda untuk #${claim.item_code || targetItem?.item_code} telah dibatalkan oleh Admin. Alasan: "${reason || 'Terindikasi ketidaksesuaian/klaim palsu'}". Anda tidak dapat mengajukan klaim kembali untuk barang ini.`,
        link: `/barang/${resolvedItemId}`
      });
    }

    // 5. Notifikasi ke penemu barang
    if (targetItem?.user_id) {
      addNotification({
        user_id: targetItem.user_id,
        type: 'klaim',
        title: 'Verifikasi Dibatalkan & Kasus Dibuka Kembali 🔄',
        body: `Admin telah membatalkan verifikasi klaim sebelumnya untuk #${targetItem.item_code}. Status barang kembali dibuka untuk mencari pemilik yang benar-benar sah.`,
        link: `/barang/${resolvedItemId}`
      });
    }

    return { success: true };
  };

  /**
   * Pengguna lain mengajukan sanggahan / melapor ke Admin jika merasa ada kesalahan verifikasi
   */
  const submitClaimObjection = async ({ itemId, message, contactInfo }) => {
    const targetItem = items.find(i => i.id === itemId);
    if (!targetItem) return { error: 'Barang tidak ditemukan' };

    // Kirim notifikasi prioritas ke Admin
    addNotification({
      user_id: 'user-admin-01',
      type: 'klaim',
      title: 'Sanggahan Verifikasi Kepemilikan Masuk! ⚠️',
      body: `${user?.full_name || 'Seorang pengguna'} menyanggah verifikasi #${targetItem.item_code}: "${message}" (Kontak: ${contactInfo || user?.phone || user?.email || '-'}).`,
      link: `/admin/klaim`
    });

    return { success: true };
  };

  // --- MESSAGES ACTIONS ---
  const sendMessage = async (matchId, content, type = 'text') => {
    const isRealUser = isUuid(user?.id);
    const isValidMatchId = isUuid(matchId);
    const localId = `msg-${Date.now()}`;

    const newMsg = {
      id: localId,
      match_id: matchId,
      sender_id: user?.id || (type === 'system' ? 'system' : 'user-unknown'),
      sender_name: user?.full_name || (type === 'system' ? 'Sistem' : 'Pengguna'),
      content,
      type,
      is_read: false,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMsg]);

    if (isSupabaseConfigured() && supabase && isValidMatchId && isRealUser) {
      try {
        const { data, error } = await supabase
          .from('messages')
          .insert({
            match_id: matchId,
            sender_id: user.id,
            content,
            type,
            is_read: false
          })
          .select('*, sender:sender_id(full_name, avatar_url)')
          .single();

        if (!error && data) {
          const formatted = {
            ...data,
            sender_name: data.sender?.full_name || user?.full_name || 'Pengguna'
          };
          setMessages(prev => prev.map(m => m.id === localId ? formatted : m));
          return formatted;
        } else if (error) {
          console.warn('Gagal menyimpan pesan ke Supabase:', error);
        }
      } catch (err) {
        console.warn('Gagal menyimpan pesan ke Supabase:', err);
      }
    }
    return newMsg;
  };

  const markMessagesAsRead = async (matchId) => {
    if (!matchId || !user?.id) return;
    setMessages(prev => prev.map(m => m.match_id === matchId && m.sender_id !== user.id ? { ...m, is_read: true } : m));

    if (isSupabaseConfigured() && supabase && isUuid(matchId) && isUuid(user.id)) {
      try {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('match_id', matchId)
          .neq('sender_id', user.id);
      } catch (err) {
        console.warn('Gagal update is_read pesan di Supabase:', err);
      }
    }
  };

  // --- FOUND REPORTS ACTIONS (Laporan Penemuan Barang Hilang) ---

  /**
   * User yang menemukan barang hilang dari postingan orang lain mengirimkan laporan temuan
   */
  const submitFoundReport = async ({ itemId, description, foundLocation, photoUrls, reporterPhone }) => {
    const targetItem = items.find(i => i.id === itemId);
    if (!targetItem) return { error: 'Barang tidak ditemukan' };

    // Cek apakah user sudah punya laporan penemuan yang masih menunggu review
    const existing = foundReports.find(
      r => r.item_id === itemId && 
      (r.reporter_id === user?.id || (user?.email && r.reporter_email === user.email)) && 
      r.status === 'menunggu_review'
    );
    if (existing) {
      return { error: 'Anda sudah mengirimkan laporan penemuan untuk barang ini yang sedang menunggu review Admin.' };
    }

    let createdId = `fr-${Date.now()}`;
    const isRealUser = isUuid(user?.id);
    const isRealItem = isUuid(itemId);

    if (isSupabaseConfigured() && supabase && isRealUser && isRealItem) {
      try {
        const { data, error } = await supabase
          .from('found_reports')
          .insert({
            item_id: itemId,
            reporter_id: user.id,
            reporter_name: user.full_name || 'Mahasiswa UNNES',
            reporter_phone: reporterPhone || user.phone || '',
            description,
            found_location: foundLocation,
            photo_urls: photoUrls || [],
            status: 'menunggu_review'
          })
          .select('*, reporter:reporter_id(full_name, avatar_url, email, phone)')
          .single();

        if (!error && data) {
          createdId = data.id;
        } else if (error) {
          console.error('Error submit found_report ke Supabase:', error);
          return { error: error.message || 'Gagal mengirim laporan ke database' };
        }
      } catch (err) {
        console.error('Exception submit found_report:', err);
        return { error: 'Terjadi kendala jaringan saat mengirim laporan' };
      }
    }

    const newReport = {
      id: createdId,
      item_id: itemId,
      reporter_id: user?.id,
      reporter_name: user?.full_name || 'Mahasiswa UNNES',
      reporter_phone: reporterPhone || user?.phone || '',
      description,
      found_location: foundLocation,
      photo_urls: photoUrls || [],
      status: 'menunggu_review',
      created_at: new Date().toISOString()
    };

    setFoundReports(prev => [newReport, ...prev.filter(r => r.id !== newReport.id)]);

    // 1. Notifikasi ke Admin
    addNotification({
      user_id: 'user-admin-01',
      type: 'laporan_temuan',
      title: 'Laporan Penemuan Baru Masuk! 🔍',
      body: `${user?.full_name || 'Seorang pengguna'} melaporkan menemukan barang hilang #${targetItem.item_code} (${targetItem.title}). Menunggu review Admin.`,
      link: '/admin/laporan-temuan'
    });

    // 2. Notifikasi ke Pemilik Barang Hilang
    if (targetItem.user_id && targetItem.user_id !== user?.id) {
      addNotification({
        user_id: targetItem.user_id,
        type: 'laporan_temuan',
        title: 'Kabar Baik! Ada yang Menemukan Barang Anda 🎉',
        body: `Seorang mahasiswa melaporkan telah menemukan barang hilang #${targetItem.item_code}. Laporan sedang diverifikasi oleh Admin.`,
        link: `/barang/${targetItem.id}`
      });
    }

    return { success: true, report: newReport };
  };

  /**
   * Admin menyetujui laporan penemuan barang hilang
   */
  const approveFoundReport = async (reportId, adminNotes = '') => {
    const report = foundReports.find(r => r.id === reportId);
    if (!report) return { error: 'Laporan tidak ditemukan' };

    const targetItem = items.find(i => i.id === report.item_id);
    if (!targetItem) return { error: 'Data barang tidak ditemukan' };

    // 1. Update found_report status di Supabase & local state
    if (isSupabaseConfigured() && supabase && isUuid(reportId)) {
      try {
        await supabase
          .from('found_reports')
          .update({
            status: 'disetujui',
            admin_notes: adminNotes || 'Laporan penemuan diverifikasi dan disetujui Admin Posko.',
            reviewed_by: isUuid(user?.id) ? user.id : null,
            reviewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', reportId);
      } catch (err) {
        console.warn('Gagal update found_report di Supabase:', err);
      }
    }

    setFoundReports(prev => prev.map(r => r.id === reportId ? {
      ...r,
      status: 'disetujui',
      admin_notes: adminNotes || 'Laporan penemuan diverifikasi dan disetujui Admin Posko.',
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString()
    } : r));

    // 2. Update status barang menjadi 'cocok'
    setItems(prev => prev.map(i => i.id === targetItem.id ? { ...i, item_status: 'cocok' } : i));
    if (isSupabaseConfigured() && supabase && isUuid(targetItem.id)) {
      try {
        await supabase
          .from('items')
          .update({ item_status: 'cocok', updated_at: new Date().toISOString() })
          .eq('id', targetItem.id);
      } catch (err) {
        console.warn('Gagal update status item di Supabase:', err);
      }
    }

    // 3. Buat match baru
    let createdMatchId = `match-${Date.now()}`;
    const isValidReportId = isUuid(report.id);
    const isValidItemId = isUuid(report.item_id);
    const isValidReporterId = isUuid(report.reporter_id);
    const isValidOwnerId = isUuid(targetItem.user_id);

    if (isSupabaseConfigured() && supabase && isValidItemId && isValidReporterId && isValidOwnerId) {
      try {
        const matchPayload = {
          item_id: report.item_id,
          item_title: targetItem.title || 'Barang Hilang',
          item_code: targetItem.item_code || 'LF-UNNES',
          finder_id: report.reporter_id,
          finder_name: report.reporter_name || 'Penemu',
          owner_id: targetItem.user_id,
          owner_name: targetItem.user_name || 'Pemilik Barang',
          match_type: 'found_report',
          found_report_id: isValidReportId ? report.id : null,
          status: 'aktif',
          created_at: new Date().toISOString()
        };

        const { data: dbMatch, error: matchErr } = await supabase
          .from('matches')
          .insert(matchPayload)
          .select()
          .single();

        if (!matchErr && dbMatch) {
          createdMatchId = dbMatch.id;
        } else if (matchErr) {
          console.warn('Gagal membuat match di Supabase:', matchErr);
        }
      } catch (err) {
        console.warn('Gagal membuat match di Supabase:', err);
      }
    }

    const newMatch = {
      id: createdMatchId,
      item_id: report.item_id,
      item_title: targetItem.title,
      item_code: targetItem.item_code,
      finder_id: report.reporter_id,
      finder_name: report.reporter_name,
      owner_id: targetItem.user_id,
      owner_name: targetItem.user_name,
      match_type: 'found_report',
      found_report_id: report.id,
      status: 'aktif',
      created_at: new Date().toISOString()
    };

    setMatches(prev => [newMatch, ...prev.filter(m => m.id !== newMatch.id)]);

    // 4. Kirim pesan selamat datang dari sistem di ruang chat
    await sendMessage(
      newMatch.id,
      `🎉 Laporan penemuan barang #${targetItem.item_code} telah diverifikasi & disetujui oleh Admin Posko! Ruang obrolan langsung antara penemu (${report.reporter_name}) dan pemilik (${targetItem.user_name || 'Pemilik'}) resmi dibuka. Silakan berkoordinasi untuk menentukan waktu dan lokasi titik temu di area kampus UNNES.`,
      'system'
    );

    // 5. Notifikasi ke kedua belah pihak
    addNotification({
      user_id: report.reporter_id,
      type: 'laporan_temuan',
      title: 'Laporan Penemuan Kamu DISETUJUI! 💬',
      body: `Laporan penemuan Anda untuk #${targetItem.item_code} telah disetujui Admin. Ruang obrolan langsung dengan pemilik barang kini telah dibuka!`,
      link: `/pesan/${newMatch.id}`
    });

    if (targetItem.user_id) {
      addNotification({
        user_id: targetItem.user_id,
        type: 'laporan_temuan',
        title: 'Penemu Barang Terverifikasi! 💬',
        body: `Admin telah memverifikasi laporan penemu (${report.reporter_name}) untuk barang #${targetItem.item_code}. Ruang obrolan telah dibuka. Silakan koordinasi penyerahan.`,
        link: `/pesan/${newMatch.id}`
      });
    }

    try {
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}

    return { success: true, match: newMatch };
  };

  /**
   * Admin menolak laporan penemuan barang hilang
   */
  const rejectFoundReport = async (reportId, reason = '') => {
    const report = foundReports.find(r => r.id === reportId);
    if (!report) return { error: 'Laporan tidak ditemukan' };
    const targetItem = items.find(i => i.id === report.item_id);

    if (isSupabaseConfigured() && supabase && isUuid(reportId)) {
      try {
        await supabase
          .from('found_reports')
          .update({
            status: 'ditolak',
            admin_notes: reason || 'Ciri barang atau lokasi yang dilaporkan belum sesuai dengan data barang hilang.',
            reviewed_by: isUuid(user?.id) ? user.id : null,
            reviewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', reportId);
      } catch (err) {
        console.warn('Gagal tolak found_report di Supabase:', err);
      }
    }

    setFoundReports(prev => prev.map(r => r.id === reportId ? {
      ...r,
      status: 'ditolak',
      admin_notes: reason || 'Ciri barang atau lokasi yang dilaporkan belum sesuai dengan data barang hilang.',
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString()
    } : r));

    addNotification({
      user_id: report.reporter_id,
      type: 'laporan_temuan',
      title: 'Laporan Penemuan Belum Sesuai ⚠️',
      body: `Laporan penemuan Anda untuk #${targetItem?.item_code || 'barang hilang'} belum disetujui Admin. Catatan: "${reason || 'Informasi kurang cocok'}".`,
      link: targetItem ? `/barang/${targetItem.id}` : '/jelajahi'
    });

    return { success: true };
  };

  // --- RUNNER SERVICE ORDERS ---
  const createOrder = async (orderData) => {
    const isRealUser = isUuid(user?.id);
    const isValidItemId = isUuid(orderData.item_id);
    const isValidMatchId = isUuid(orderData.match_id);

    // 1. Simpan ke Supabase jika login resmi
    if (isSupabaseConfigured() && supabase && isRealUser) {
      try {
        const orderPayload = {
          requester_id: user.id,
          requester_name: user.full_name || 'Mahasiswa UNNES',
          requester_phone: orderData.requester_phone || user.phone || '',
          item_id: isValidItemId ? orderData.item_id : null,
          match_id: isValidMatchId ? orderData.match_id : null,
          item_title: orderData.item_title || 'Pengambilan Barang Kampus',
          item_code: orderData.item_code || 'LF-RUNNER',
          service_type: orderData.service_type || 'pickup_delivery',
          status: 'menunggu',
          pickup_location: orderData.pickup_location,
          delivery_location: orderData.delivery_location,
          fee_amount: orderData.service_type === 'active_hunting' ? 15000 : (Number(orderData.fee_amount) || 8000),
          payment_status: 'belum_bayar',
          payment_method: orderData.payment_method || 'tunai_saat_antar',
          runner_name: '',
          runner_phone: '',
          runner_notes: orderData.runner_notes || '',
          evidence_photos: []
        };

        const { data, error } = await supabase
          .from('orders')
          .insert(orderPayload)
          .select('*, requester:requester_id(full_name, avatar_url, email, phone)')
          .single();

        if (!error && data) {
          const newOrder = {
            ...data,
            requester_name: data.requester_name || data.requester?.full_name || user.full_name || 'Mahasiswa UNNES',
            requester_phone: data.requester_phone || data.requester?.phone || user.phone || ''
          };

          setOrders(prev => [newOrder, ...prev.filter(o => o.id !== newOrder.id)]);

          addNotification({
            user_id: 'user-admin-01',
            type: 'pesanan',
            title: 'Pesanan Jasa Runner Baru 🚗',
            body: `${user.full_name} memesan layanan ${orderData.service_type === 'active_hunting' ? 'Active Hunting' : 'Pick-up & Delivery'} ke ${orderData.delivery_location}.`,
            link: '/admin/pesanan'
          });

          addNotification({
            user_id: user.id,
            type: 'pesanan',
            title: 'Pesanan Runner Dibuat 📦',
            body: `Pesanan jasa runner Anda sedang menunggu konfirmasi shift runner UNNES.`,
            link: '/profil'
          });

          return { success: true, order: newOrder };
        } else if (error) {
          console.warn('Gagal insert order ke Supabase, fallback lokal:', error);
        }
      } catch (err) {
        console.warn('Gagal insert order ke Supabase, fallback lokal:', err);
      }
    }

    // 2. Fallback: Simpan ke local state / demo user
    const newOrder = {
      id: `ord-${Date.now()}`,
      requester_id: user?.id || 'user-mahasiswa-01',
      requester_name: user?.full_name || 'Mahasiswa UNNES',
      requester_phone: orderData.requester_phone || user?.phone || '',
      status: 'menunggu',
      fee_amount: orderData.service_type === 'active_hunting' ? 15000 : (Number(orderData.fee_amount) || 8000),
      payment_status: 'belum_bayar',
      payment_method: 'tunai_saat_antar',
      evidence_photos: [],
      created_at: new Date().toISOString(),
      ...orderData
    };

    setOrders(prev => [newOrder, ...prev]);

    addNotification({
      user_id: 'user-admin-01',
      type: 'pesanan',
      title: 'Pesanan Jasa Runner Baru 🚗',
      body: `${user?.full_name || 'Mahasiswa'} memesan layanan ${orderData.service_type === 'active_hunting' ? 'Active Hunting' : 'Pick-up & Delivery'} ke ${orderData.delivery_location}.`,
      link: '/admin/pesanan'
    });

    addNotification({
      user_id: user?.id,
      type: 'pesanan',
      title: 'Pesanan Runner Dibuat 📦',
      body: `Pesanan jasa runner Anda sedang menunggu konfirmasi shift runner UNNES.`,
      link: '/profil'
    });

    return { success: true, order: newOrder };
  };

  const updateOrderStatus = async (orderId, updates) => {
    if (isSupabaseConfigured() && supabase && isUuid(orderId)) {
      try {
        const dbUpdates = { ...updates };
        if (updates.status === 'selesai' && !updates.completed_at) {
          dbUpdates.completed_at = new Date().toISOString();
        }

        const { error } = await supabase
          .from('orders')
          .update(dbUpdates)
          .eq('id', orderId);

        if (error) {
          console.warn('Gagal update status order di Supabase:', error);
        }
      } catch (err) {
        console.warn('Gagal update status order di Supabase:', err);
      }
    }

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updated = { ...o, ...updates };
        if (updates.status) {
          const statusInfo = getRunnerStatusInfo(updates.status);
          addNotification({
            user_id: o.requester_id,
            type: 'pesanan',
            title: `Update Pesanan Runner: ${statusInfo.label}`,
            body: updates.runner_notes || `Status pesanan Anda telah diperbarui menjadi "${statusInfo.label}".`,
            link: '/profil'
          });
        }
        return updated;
      }
      return o;
    }));
  };

  const deleteOrder = async (orderId) => {
    if (isSupabaseConfigured() && supabase && isUuid(orderId)) {
      try {
        const { error } = await supabase.from('orders').delete().eq('id', orderId);
        if (error) {
          console.warn('Gagal menghapus order di Supabase:', error);
        }
      } catch (err) {
        console.warn('Gagal menghapus order di Supabase:', err);
      }
    }
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  // --- DIGITAL BAST SERAH TERIMA ---
  const completeHandover = (matchId, evidencePhoto = null) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    // Update match
    setMatches(prev => prev.map(m => m.id === matchId ? {
      ...m,
      status: 'selesai',
      completed_at: new Date().toISOString()
    } : m));

    // Update item status to 'dikembalikan'
    setItems(prev => prev.map(i => i.id === match.item_id ? {
      ...i,
      item_status: 'dikembalikan'
    } : i));

    // Kirim pesan sistem di chat
    sendMessage(matchId, '✅ Serah Terima Barang Resmi Selesai! Berita Acara Serah Terima (BAST) Digital telah ditandatangani oleh kedua pihak.', 'system');

    try {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 } });
    } catch (e) {}
  };

  // --- STATS CALCULATION ---
  const stats = {
    totalItems: items.filter(i => i.post_status === 'disetujui').length,
    totalReturned: items.filter(i => i.item_status === 'dikembalikan').length,
    pendingReviews: items.filter(i => i.post_status === 'menunggu_review').length,
    pendingClaims: claims.filter(c => c.status === 'menunggu_admin').length,
    pendingFoundReports: foundReports.filter(r => r.status === 'menunggu_review').length,
    activeOrders: orders.filter(o => o.status !== 'selesai' && o.status !== 'dibatalkan').length,
    totalBounties: items
      .filter(i => i.post_status === 'disetujui' && i.bounty_amount > 0)
      .reduce((sum, i) => sum + (i.bounty_amount || 0), 0)
  };

  return (
    <DataContext.Provider value={{
      items,
      approvedItems: items.filter(i => i.post_status === 'disetujui'),
      claims,
      matches,
      messages,
      orders,
      notifications,
      foundReports,
      stats,
      submitItem,
      approveItem,
      rejectItem,
      deleteItem,
      markItemAsReturned,
      submitClaim,
      verifyClaim,
      revokeClaimVerification,
      submitClaimObjection,
      submitFoundReport,
      approveFoundReport,
      rejectFoundReport,
      sendMessage,
      markMessagesAsRead,
      fetchSupabaseFoundReports,
      fetchSupabaseMessages,
      fetchSupabaseNotifications,
      createOrder,
      updateOrderStatus,
      deleteOrder,
      completeHandover,
      addNotification,
      markNotificationAsRead: async (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        if (isSupabaseConfigured() && supabase && isUuid(id)) {
          try {
            await supabase.from('notifications').update({ is_read: true }).eq('id', id);
          } catch (e) {
            console.warn('Gagal update notifikasi di Supabase:', e);
          }
        }
      },
      markAllNotificationsAsRead: async () => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        if (isSupabaseConfigured() && supabase && user?.id && isUuid(user.id)) {
          try {
            await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id);
          } catch (e) {
            console.warn('Gagal update semua notifikasi di Supabase:', e);
          }
        }
      }
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
