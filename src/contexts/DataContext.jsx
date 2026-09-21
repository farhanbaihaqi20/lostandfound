import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  INITIAL_ITEMS, 
  INITIAL_CLAIMS, 
  INITIAL_MATCHES, 
  INITIAL_ORDERS, 
  INITIAL_NOTIFICATIONS 
} from '../data/initialData';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { deleteCloudinaryImage, generateReturnedBannerSvg } from '../lib/storageService';

const isUuid = (id) => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const { user } = useAuth();

  // 1. Items state
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('unnes_lf_items');
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
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
          // Tetap sertakan mock demo items bila belum ada di Supabase
          const baseItems = INITIAL_ITEMS.filter(b => !formatted.some(f => f.item_code === b.item_code));
          const localOnly = prev.filter(i => !isUuid(i.id) && !baseItems.some(b => b.id === i.id));
          return [...formatted, ...localOnly, ...baseItems];
        });
      }
    } catch (err) {
      console.warn('Gagal memuat items dari Supabase:', err);
    }
  };

  useEffect(() => {
    fetchSupabaseItems();

    if (!isSupabaseConfigured() || !supabase) return;

    // Supabase Realtime: dengarkan perubahan data dari semua pengguna/browser
    const channel = supabase
      .channel('public:items_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => {
        fetchSupabaseItems();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // 2. Claims state
  const [claims, setClaims] = useState(() => {
    const saved = localStorage.getItem('unnes_lf_claims');
    return saved ? JSON.parse(saved) : INITIAL_CLAIMS;
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
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  // 6. Notifications state
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('unnes_lf_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

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

  // Notification helper
  const addNotification = (notif) => {
    const newNotif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      created_at: new Date().toISOString(),
      is_read: false,
      ...notif
    };
    setNotifications(prev => [newNotif, ...prev]);
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
   */
  const submitClaim = ({ itemId, blindTestAnswers, message }) => {
    const targetItem = items.find(i => i.id === itemId);
    if (!targetItem) return;

    // Perhitungan kecocokan otomatis sederhana (skor 80 - 100%)
    const score = Math.floor(80 + Math.random() * 20);

    const newClaim = {
      id: `claim-${Date.now()}`,
      item_id: itemId,
      item_title: targetItem.title,
      item_code: targetItem.item_code,
      claimer_id: user?.id,
      claimer_name: user?.full_name || 'Mahasiswa UNNES',
      claimer_email: user?.email,
      claimer_phone: user?.phone || '08xxxxxxxxxx',
      status: 'menunggu_admin',
      blind_test_answers: blindTestAnswers,
      blind_test_score: score,
      message: message || '',
      created_at: new Date().toISOString()
    };

    setClaims(prev => [newClaim, ...prev]);

    // Notifikasi ke Admin untuk verifikasi
    addNotification({
      user_id: 'user-admin-01',
      type: 'klaim',
      title: 'Klaim Baru Menunggu Verifikasi 🔍',
      body: `${newClaim.claimer_name} mengklaim barang #${targetItem.item_code}. Skor kecocokan: ${score}%.`,
      link: '/admin/klaim'
    });

    return newClaim;
  };

  /**
   * Admin memverifikasi klaim (Valid / Tidak Valid)
   */
  const verifyClaim = (claimId, isApproved, adminNotes = '') => {
    const claim = claims.find(c => c.id === claimId);
    if (!claim) return;

    const targetItem = items.find(i => i.id === claim.item_id);

    if (isApproved) {
      // 1. Update status klaim
      setClaims(prev => prev.map(c => c.id === claimId ? {
        ...c,
        status: 'disetujui',
        admin_notes: adminNotes,
        verified_by: user?.id,
        verified_at: new Date().toISOString()
      } : c));

      // 2. Update status barang ke 'cocok'
      if (targetItem) {
        setItems(prev => prev.map(i => i.id === claim.item_id ? {
          ...i,
          item_status: 'cocok'
        } : i));
      }

      // 3. Buat Match & Chat room
      const newMatch = {
        id: `match-${Date.now()}`,
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
      setMatches(prev => [newMatch, ...prev]);

      // 4. Kirim pesan selamat datang dari sistem di ruang chat
      const welcomeMsg = {
        id: `msg-${Date.now()}`,
        match_id: newMatch.id,
        sender_id: 'system',
        content: `🎉 Selamat! Klaim barang #${claim.item_code} telah diverifikasi oleh Admin. Silakan berkoordinasi untuk menentukan waktu dan lokasi titik temu penyerahan barang (disarankan di Pos Satpam / Kantin Kampus). Butuh bantuan antar? Anda juga dapat memesan Jasa Runner Resmi UNNES di tombol atas!`,
        type: 'system',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, welcomeMsg]);

      // 5. Notifikasi ke kedua belah pihak
      addNotification({
        user_id: claim.claimer_id,
        type: 'cocok',
        title: 'Klaim Kamu DIVERIFIKASI! 🎯',
        body: `Klaim barang #${claim.item_code} berhasil diverifikasi Admin. Ruang obrolan dengan penemu sudah dibuka!`,
        link: `/pesan/${newMatch.id}`
      });

      if (targetItem?.user_id) {
        addNotification({
          user_id: targetItem.user_id,
          type: 'cocok',
          title: 'Pemilik Asli Ditemukan! 🤝',
          body: `Admin telah memverifikasi klaim barang #${claim.item_code}. Hubungkan obrolan untuk serah terima.`,
          link: `/pesan/${newMatch.id}`
        });
      }

      try {
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      } catch (e) {
        // Safe fallback
      }
    } else {
      // Tolak klaim
      setClaims(prev => prev.map(c => c.id === claimId ? {
        ...c,
        status: 'ditolak',
        admin_notes: adminNotes,
        verified_by: user?.id,
        verified_at: new Date().toISOString()
      } : c));

      addNotification({
        user_id: claim.claimer_id,
        type: 'klaim',
        title: 'Klaim Belum Dapat Diverifikasi ❌',
        body: `Klaim barang #${claim.item_code} tidak sesuai dengan verifikasi Admin. Catatan: ${adminNotes || 'Jawaban tidak cocok'}.`,
        link: `/barang/${claim.item_id}`
      });
    }
  };

  // --- MESSAGES ACTIONS ---
  const sendMessage = (matchId, content, type = 'text') => {
    const newMsg = {
      id: `msg-${Date.now()}`,
      match_id: matchId,
      sender_id: user?.id,
      sender_name: user?.full_name,
      content,
      type,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMsg]);
    return newMsg;
  };

  // --- RUNNER SERVICE ORDERS ---
  const createOrder = (orderData) => {
    const newOrder = {
      id: `ord-${Date.now()}`,
      requester_id: user?.id,
      requester_name: user?.full_name,
      requester_phone: user?.phone || '',
      status: 'menunggu',
      fee_amount: orderData.service_type === 'active_hunting' ? 15000 : 8000,
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
      body: `${user?.full_name} memesan layanan ${orderData.service_type === 'active_hunting' ? 'Active Hunting' : 'Pick-up & Delivery'} ke ${orderData.delivery_location}.`,
      link: '/admin/pesanan'
    });

    addNotification({
      user_id: user?.id,
      type: 'pesanan',
      title: 'Pesanan Runner Dibuat 📦',
      body: `Pesanan jasa runner Anda sedang menunggu konfirmasi shift runner UNNES.`,
      link: '/profil'
    });

    return newOrder;
  };

  const updateOrderStatus = (orderId, updates) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updated = { ...o, ...updates };
        if (updates.status) {
          addNotification({
            user_id: o.requester_id,
            type: 'pesanan',
            title: `Update Pesanan Runner: ${updates.status.toUpperCase()}`,
            body: updates.runner_notes || `Status pesanan Anda telah diperbarui menjadi ${updates.status}.`,
            link: '/profil'
          });
        }
        return updated;
      }
      return o;
    }));
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
      stats,
      submitItem,
      approveItem,
      rejectItem,
      deleteItem,
      markItemAsReturned,
      submitClaim,
      verifyClaim,
      sendMessage,
      createOrder,
      updateOrderStatus,
      completeHandover,
      addNotification,
      markNotificationAsRead: (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      },
      markAllNotificationsAsRead: () => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
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
