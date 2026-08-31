import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  DEFAULT_JADWAL_SESI_HARIAN,
  HARI_LIST,
  INITIAL_GURU,
  INITIAL_KELAS,
  INITIAL_RUANGAN,
  INITIAL_SETTINGS,
  INITIAL_USERS,
  JAM_PEMBELAJARAN_CONFIG,
  generateInitialJadwal,
  getFormattedJamRange as getFormattedJamRangeHelper,
  getHariNameFromDate,
  getJamConfig as getJamConfigHelper,
  getJamListForHari as getJamListForHariHelper,
} from '../data/initialData';
import {
  AppSettings,
  AuditLog,
  Guru,
  HariType,
  Jadwal,
  JadwalSesiHarian,
  JamPembelajaran,
  JamPembelajaranConfigItem,
  Kelas,
  Ruangan,
  User,
  UserRole,
} from '../types';
import {
  fetchAllGoogleSheetJamRows,
  fetchAllGoogleSheetRawRows,
  generateJamPelajaranSheetRows,
  parseGoogleSheetCsvToJadwal,
  parseGoogleSheetRowsToJadwal,
  parseGoogleSheetRowsToJamPelajaran,
} from '../utils/sheetParser';

interface ConflictCheckResult {
  hasConflict: boolean;
  conflictJadwal?: Jadwal;
  message?: string;
}

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  userList: User[];
  guruList: Guru[];
  kelasList: Kelas[];
  ruanganList: Ruangan[];
  jadwalList: Jadwal[];
  auditLogs: AuditLog[];
  settings: AppSettings;
  activeView: string;
  setActiveView: (view: string) => void;
  selectedWeekOffset: number;
  setSelectedWeekOffset: (offset: number | ((prev: number) => number)) => void;
  
  // Auth
  login: (username: string, password?: string) => boolean;
  logout: () => void;

  // Modals & UI States
  isBookingModalOpen: boolean;
  setIsBookingModalOpen: (open: boolean) => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  isSheetsModalOpen: boolean;
  setIsSheetsModalOpen: (open: boolean) => void;
  editingJadwal: Jadwal | null;
  setEditingJadwal: (jadwal: Jadwal | null) => void;
  prefilledBooking: Partial<Jadwal> | null;
  setPrefilledBooking: (data: Partial<Jadwal> | null) => void;

  // Conflict Checking
  checkConflict: (
    ruangan_id: string,
    tanggal: string,
    jam_ke_list: JamPembelajaran[],
    exclude_jadwal_id?: string
  ) => ConflictCheckResult;

  // Jadwal operations
  createJadwal: (
    data: Omit<Jadwal, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'created_by_name'> & {
      jam_ke_list?: JamPembelajaran[];
    }
  ) => { success: boolean; message: string; createdIds?: string[] };
  
  updateJadwal: (
    id: string,
    data: Partial<Omit<Jadwal, 'id' | 'created_at' | 'created_by'>>
  ) => { success: boolean; message: string };
  
  deleteJadwal: (id: string) => { success: boolean; message: string };
  cancelJadwal: (id: string, alasan?: string) => { success: boolean; message: string };
  completeJadwal: (id: string) => { success: boolean; message: string };

  // Master Data Guru
  createGuru: (guru: Omit<Guru, 'id'>) => { success: boolean; message: string };
  updateGuru: (id: string, guru: Partial<Omit<Guru, 'id'>>) => { success: boolean; message: string };
  deleteGuru: (id: string) => { success: boolean; message: string };
  importGuruBatch: (newGurus: Omit<Guru, 'id'>[]) => { success: boolean; count: number };

  // Master Data Kelas
  createKelas: (kelas: Omit<Kelas, 'id'>) => { success: boolean; message: string };
  updateKelas: (id: string, kelas: Partial<Omit<Kelas, 'id'>>) => { success: boolean; message: string };
  deleteKelas: (id: string) => { success: boolean; message: string };

  // Master Data Ruangan
  createRuangan: (ruangan: Omit<Ruangan, 'id'>) => { success: boolean; message: string };
  updateRuangan: (id: string, ruangan: Partial<Omit<Ruangan, 'id'>>) => { success: boolean; message: string };
  deleteRuangan: (id: string) => { success: boolean; message: string };

  // Users & Settings
  createUser: (user: Partial<User> & { username: string; role: UserRole }) => { success: boolean; message: string };
  updateUser: (id: string, user: Partial<Omit<User, 'id'>>) => { success: boolean; message: string };
  deleteUser: (id: string) => { success: boolean; message: string };
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  updateDailySessionSchedule: (hari: HariType, sessions: JamPembelajaranConfigItem[]) => void;
  resetDailySessionSchedule: (hari?: HariType) => void;
  getJamConfig: (hari?: HariType | string, jam_ke?: number) => JamPembelajaranConfigItem;
  getJamListForHari: (hari?: HariType | string) => JamPembelajaranConfigItem[];
  getFormattedJamRange: (hari?: HariType | string, jam_ke?: number, includeLabel?: boolean) => string;

  // Data maintenance & logs
  clearAuditLogs: () => void;
  clearHistoricalJadwal: (type: 'all' | 'old' | 'canceled') => { count: number; message: string };
  clearAllJadwal: () => { success: boolean; message: string };
  resetAllDataToDefault: () => void;

  // Google Sheets integration state
  lastSheetsSyncTime: string | null;
  lastSyncTime: string | null;
  isSyncingSheets: boolean;
  isRealtimeConnected: boolean;
  syncWithSheets: () => Promise<{ success: boolean; message: string }>;
  syncJamPelajaranToSheets: () => Promise<{ success: boolean; message: string }>;
  fetchJamPelajaranFromSheets: (isSilent?: boolean) => Promise<{ success: boolean; message: string }>;
  fetchFromGoogleSheets: (
    isSilent?: boolean,
    customSheetInput?: string
  ) => Promise<{ success: boolean; count: number; message: string }>;
}


const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'albashiroh_multimedia_users_v2',
  GURU: 'albashiroh_multimedia_guru_v2',
  KELAS: 'albashiroh_multimedia_kelas_v1',
  RUANGAN: 'albashiroh_multimedia_ruangan_v1',
  JADWAL: 'albashiroh_multimedia_jadwal_v1',
  LOGS: 'albashiroh_multimedia_logs_v1',
  SETTINGS: 'albashiroh_multimedia_settings_v1',
  CURRENT_USER: 'albashiroh_multimedia_current_user_v2',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load or initialize state with safe fallback
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_USERS[0];
      }
    }
    return INITIAL_USERS[0]; // Default to Admin for full experience preview
  });

  const [guruList, setGuruList] = useState<Guru[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GURU);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 22) {
          return parsed;
        }
      } catch {
        return INITIAL_GURU;
      }
    }
    return INITIAL_GURU;
  });

  const [kelasList, setKelasList] = useState<Kelas[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.KELAS);
    return saved ? JSON.parse(saved) : INITIAL_KELAS;
  });

  const [ruanganList, setRuanganList] = useState<Ruangan[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RUANGAN);
    return saved ? JSON.parse(saved) : INITIAL_RUANGAN;
  });

  const [jadwalList, setJadwalList] = useState<Jadwal[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.JADWAL);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Remove old mock dummy schedules (jdw_1 to jdw_20)
          return parsed.filter(
            (j) => !/^jdw_(1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20)$/.test(j.id)
          );
        }
      } catch {
        return [];
      }
    }
    return generateInitialJadwal();
  });


  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'log_init',
        action: 'IMPORT_DATA',
        user_id: 'usr_admin',
        user_name: 'Administrator Multimedia',
        user_role: 'admin',
        target_type: 'System',
        details: 'Inisialisasi sistem penjadwalan multimedia SMA - SMP IT Albashiroh Turen.',
        timestamp: new Date().toISOString(),
      },
    ];
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_SETTINGS,
          ...parsed,
          namaSekolah: parsed.namaSekolah || INITIAL_SETTINGS.namaSekolah || '',
          namaAplikasi: parsed.namaAplikasi || INITIAL_SETTINGS.namaAplikasi || '',
          alamatSekolah: parsed.alamatSekolah || INITIAL_SETTINGS.alamatSekolah || '',
          tahunPelajaran: parsed.tahunPelajaran || INITIAL_SETTINGS.tahunPelajaran || '',
          semester: parsed.semester || INITIAL_SETTINGS.semester || 'Genap',
          kepalaSekolah: parsed.kepalaSekolah || INITIAL_SETTINGS.kepalaSekolah || '',
          nipKepalaSekolah: parsed.nipKepalaSekolah || INITIAL_SETTINGS.nipKepalaSekolah || '',
          koordinatorLab: parsed.koordinatorLab || INITIAL_SETTINGS.koordinatorLab || '',
          nipKoordinatorLab: parsed.nipKoordinatorLab || INITIAL_SETTINGS.nipKoordinatorLab || '',
          googleSheetUrl: parsed.googleSheetUrl || INITIAL_SETTINGS.googleSheetUrl || '',
          googleSheetId: parsed.googleSheetId || parsed.googleSheetsId || INITIAL_SETTINGS.googleSheetId || '',
          googleSheetsId: parsed.googleSheetsId || parsed.googleSheetId || INITIAL_SETTINGS.googleSheetsId || '',
          googleSheetsWebhookUrl:
            parsed.googleSheetsWebhookUrl && parsed.googleSheetsWebhookUrl.trim() !== ''
              ? parsed.googleSheetsWebhookUrl
              : INITIAL_SETTINGS.googleSheetsWebhookUrl,
          autoSyncSheets: parsed.autoSyncSheets !== undefined ? Boolean(parsed.autoSyncSheets) : true,
          autoRefreshTVSeconds: parsed.autoRefreshTVSeconds || 15,
          jadwalSesiHarian: parsed.jadwalSesiHarian || INITIAL_SETTINGS.jadwalSesiHarian || DEFAULT_JADWAL_SESI_HARIAN,
        };
      } catch {
        return INITIAL_SETTINGS;
      }
    }
    return INITIAL_SETTINGS;
  });

  // Ensure default webhook is active if empty
  useEffect(() => {
    if (!settings.googleSheetsWebhookUrl && INITIAL_SETTINGS.googleSheetsWebhookUrl) {
      setSettings((prev) => ({
        ...prev,
        googleSheetsWebhookUrl: INITIAL_SETTINGS.googleSheetsWebhookUrl,
      }));
    }
  }, []);

  // UI state - Default landing view is 'public' (Akses Publik Guru & Siswa)
  const [activeView, setActiveView] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const viewParam = urlParams.get('view');
      if (viewParam) return viewParam;
      const hash = window.location.hash.replace('#', '');
      if (hash) return hash;
    }
    return 'public';
  });
  const [selectedWeekOffset, setSelectedWeekOffset] = useState<number>(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [editingJadwal, setEditingJadwal] = useState<Jadwal | null>(null);
  const [prefilledBooking, setPrefilledBooking] = useState<Partial<Jadwal> | null>(null);
  const [lastSheetsSyncTime, setLastSheetsSyncTime] = useState<string | null>(null);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GURU, JSON.stringify(guruList));
  }, [guruList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.KELAS, JSON.stringify(kelasList));
  }, [kelasList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RUANGAN, JSON.stringify(ruanganList));
  }, [ruanganList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.JADWAL, JSON.stringify(jadwalList));
  }, [jadwalList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // Add audit log helper
  const addLog = (
    action: AuditLog['action'],
    target_type: AuditLog['target_type'],
    details: string,
    target_id?: string
  ) => {
    const newLog: AuditLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      action,
      user_id: currentUser?.id || 'anonymous',
      user_name: currentUser?.nama || 'Pengguna Umum',
      user_role: currentUser?.role || 'guru',
      target_type,
      target_id,
      details,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 200)]); // Keep last 200 logs
  };

  // Conflict Checking Engine (Anti-Bentrok)
  const checkConflict = (
    ruangan_id: string,
    tanggal: string,
    jam_ke_list: JamPembelajaran[],
    exclude_jadwal_id?: string
  ): ConflictCheckResult => {
    const ruangan = ruanganList.find((r) => r.id === ruangan_id);
    const namaRuangan = ruangan?.nama_ruangan || 'Ruangan tersebut';

    // Find if any active schedule matches room, date, and any of the requested periods
    const conflicting = jadwalList.find((j) => {
      if (exclude_jadwal_id && j.id === exclude_jadwal_id) return false;
      if (j.status === 'Dibatalkan') return false; // Canceled schedules don't block
      if (j.ruangan_id !== ruangan_id) return false;
      if (j.tanggal !== tanggal) return false;
      return jam_ke_list.includes(j.jam_ke);
    });

    if (conflicting) {
      const guru = guruList.find((g) => g.id === conflicting.guru_id)?.nama_guru || 'Guru Lain';
      const kelas = kelasList.find((k) => k.id === conflicting.kelas_id)?.nama_kelas || '';
      return {
        hasConflict: true,
        conflictJadwal: conflicting,
        message: `Jadwal tidak dapat disimpan karena ${namaRuangan} sudah digunakan pada hari/tanggal tersebut (Jam ke-${conflicting.jam_ke}) oleh ${guru} (${conflicting.mata_pelajaran} - Kelas ${kelas}).`,
      };
    }

    return { hasConflict: false };
  };

  // Create single or multi-period schedule
  const createJadwal = (
    data: Omit<Jadwal, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'created_by_name'> & {
      jam_ke_list?: JamPembelajaran[];
    }
  ) => {
    const jamArray: JamPembelajaran[] =
      data.jam_ke_list && data.jam_ke_list.length > 0 ? data.jam_ke_list : [data.jam_ke];

    // Check conflict for all periods
    const conflict = checkConflict(data.ruangan_id, data.tanggal, jamArray);
    if (conflict.hasConflict) {
      return {
        success: false,
        message: conflict.message || 'Terjadi bentrok jadwal pada ruangan dan jam yang dipilih.',
      };
    }

    const calculatedHari = data.hari || getHariNameFromDate(data.tanggal);
    const createdIds: string[] = [];
    const nowIso = new Date().toISOString();

    const newJadwals: Jadwal[] = jamArray.map((jam, idx) => {
      const id = 'jdw_' + Date.now() + '_' + idx + '_' + Math.random().toString(36).substring(2, 5);
      createdIds.push(id);
      return {
        id,
        tanggal: data.tanggal,
        hari: calculatedHari as HariType,
        jam_ke: jam,
        guru_id: data.guru_id,
        mata_pelajaran: data.mata_pelajaran,
        kelas_id: data.kelas_id,
        ruangan_id: data.ruangan_id,
        keperluan: data.keperluan || '',
        status: data.status || 'Terjadwal',
        created_by: currentUser?.id,
        created_by_name: currentUser?.nama || 'Guru',
        created_at: nowIso,
        updated_at: nowIso,
      };
    });

    const updatedList = [...jadwalList, ...newJadwals];
    setJadwalList(updatedList);

    const guruName = guruList.find((g) => g.id === data.guru_id)?.nama_guru || 'Guru';
    const ruanganName = ruanganList.find((r) => r.id === data.ruangan_id)?.nama_ruangan || 'Ruangan';
    addLog(
      'TAMBAH_JADWAL',
      'Jadwal',
      `Menambahkan ${newJadwals.length} jadwal: ${ruanganName}, ${data.tanggal} (Jam ${jamArray.join(', ')}), Guru: ${guruName}, Mapel: ${data.mata_pelajaran}`
    );

    // Auto sync to webhook if enabled
    if (settings.autoSyncSheets) {
      const webhookUrl = settings.googleSheetsWebhookUrl?.trim() || INITIAL_SETTINGS.googleSheetsWebhookUrl;
      if (webhookUrl && (webhookUrl.startsWith('http://') || webhookUrl.startsWith('https://'))) {
        const payloadData = newJadwals.map((j) => {
          const guru = guruList.find((g) => g.id === j.guru_id);
          const kelas = kelasList.find((k) => k.id === j.kelas_id);
          const ruangan = ruanganList.find((r) => r.id === j.ruangan_id);
          const waktuStr = getFormattedJamRangeHelper(j.hari, j.jam_ke, settings);
          return {
            id: j.id,
            tanggal: j.tanggal || '',
            hari: j.hari || '',
            jam_ke: j.jam_ke,
            waktu: waktuStr,
            ruangan: ruangan?.nama_ruangan || '',
            guru: guru?.nama_guru || '',
            nip_guru: guru?.nip || '',
            mata_pelajaran: j.mata_pelajaran || '',
            kelas: kelas?.nama_kelas || '',
            keperluan: j.keperluan || '',
            status: j.status || '',
            pembuat: j.created_by_name || '',
            created_at: j.created_at || '',
          };
        });

        fetch(webhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'APPEND_JADWAL',
            timestamp: new Date().toISOString(),
            data: payloadData,
          }),
        }).catch((err) => console.warn('Auto webhook sync notice:', err));
      }
    }


    return {
      success: true,
      message: `Jadwal berhasil disimpan untuk ${jamArray.length} jam pembelajaran!`,
      createdIds,
    };
  };

  // Update schedule
  const updateJadwal = (
    id: string,
    data: Partial<Omit<Jadwal, 'id' | 'created_at' | 'created_by'>>
  ) => {
    const existing = jadwalList.find((j) => j.id === id);
    if (!existing) {
      return { success: false, message: 'Jadwal tidak ditemukan.' };
    }

    // Role check: Only admin or the creator can update
    if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'operator' && existing.created_by && existing.created_by !== currentUser.id) {
      return { success: false, message: 'Anda tidak memiliki hak akses untuk mengubah jadwal guru lain.' };
    }

    const targetRuanganId = data.ruangan_id || existing.ruangan_id;
    const targetTanggal = data.tanggal || existing.tanggal;
    const targetJam = data.jam_ke || existing.jam_ke;

    // Check conflict if room/date/period changed
    if (
      (data.ruangan_id && data.ruangan_id !== existing.ruangan_id) ||
      (data.tanggal && data.tanggal !== existing.tanggal) ||
      (data.jam_ke && data.jam_ke !== existing.jam_ke)
    ) {
      const conflict = checkConflict(targetRuanganId, targetTanggal, [targetJam], id);
      if (conflict.hasConflict) {
        return { success: false, message: conflict.message || 'Jadwal bentrok dengan jadwal lain.' };
      }
    }

    const calculatedHari = data.tanggal ? getHariNameFromDate(data.tanggal) : existing.hari;

    const nextJadwalList = jadwalList.map((j) =>
      j.id === id
        ? {
            ...j,
            ...data,
            hari: (data.hari || calculatedHari) as HariType,
            updated_at: new Date().toISOString(),
          }
        : j
    );
    setJadwalList(nextJadwalList);

    addLog('UBAH_JADWAL', 'Jadwal', `Mengubah jadwal ID: ${id} (${existing.mata_pelajaran})`, id);

    // Auto sync updated state to webhook
    if (settings.autoSyncSheets) {
      const webhookUrl = settings.googleSheetsWebhookUrl?.trim() || INITIAL_SETTINGS.googleSheetsWebhookUrl;
      if (webhookUrl && (webhookUrl.startsWith('http://') || webhookUrl.startsWith('https://'))) {
        const fullPayload = nextJadwalList.map((j) => {
          const guru = guruList.find((g) => g.id === j.guru_id);
          const kelas = kelasList.find((k) => k.id === j.kelas_id);
          const ruangan = ruanganList.find((r) => r.id === j.ruangan_id);
          const waktuStr = getFormattedJamRangeHelper(j.hari, j.jam_ke, settings);
          return {
            id: j.id,
            tanggal: j.tanggal || '',
            hari: j.hari || '',
            jam_ke: j.jam_ke,
            waktu: waktuStr,
            ruangan: ruangan?.nama_ruangan || '',
            guru: guru?.nama_guru || '',
            nip_guru: guru?.nip || '',
            mata_pelajaran: j.mata_pelajaran || '',
            kelas: kelas?.nama_kelas || '',
            keperluan: j.keperluan || '',
            status: j.status || '',
            pembuat: j.created_by_name || '',
            created_at: j.created_at || '',
          };
        });

        fetch(webhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'SYNC_ALL',
            timestamp: new Date().toISOString(),
            data: fullPayload,
          }),
        }).catch((err) => console.warn('Auto webhook sync notice:', err));
      }
    }


    return { success: true, message: 'Jadwal berhasil diperbarui.' };
  };

  // Delete schedule
  const deleteJadwal = (id: string) => {
    const target = jadwalList.find((j) => j.id === id);
    if (!target) return { success: false, message: 'Jadwal tidak ditemukan.' };

    const nextJadwalList = jadwalList.filter((j) => j.id !== id);
    setJadwalList(nextJadwalList);
    addLog(
      'HAPUS_JADWAL',
      'Jadwal',
      `Menghapus jadwal ${target.tanggal} Jam ke-${target.jam_ke} (${target.mata_pelajaran})`,
      id
    );

    if (settings.autoSyncSheets) {
      const webhookUrl = settings.googleSheetsWebhookUrl?.trim() || INITIAL_SETTINGS.googleSheetsWebhookUrl;
      if (webhookUrl && (webhookUrl.startsWith('http://') || webhookUrl.startsWith('https://'))) {
        const fullPayload = nextJadwalList.map((j) => {
          const guru = guruList.find((g) => g.id === j.guru_id);
          const kelas = kelasList.find((k) => k.id === j.kelas_id);
          const ruangan = ruanganList.find((r) => r.id === j.ruangan_id);
          const waktuStr = getFormattedJamRangeHelper(j.hari, j.jam_ke, settings);
          return {
            id: j.id,
            tanggal: j.tanggal || '',
            hari: j.hari || '',
            jam_ke: j.jam_ke,
            waktu: waktuStr,
            ruangan: ruangan?.nama_ruangan || '',
            guru: guru?.nama_guru || '',
            nip_guru: guru?.nip || '',
            mata_pelajaran: j.mata_pelajaran || '',
            kelas: kelas?.nama_kelas || '',
            keperluan: j.keperluan || '',
            status: j.status || '',
            pembuat: j.created_by_name || '',
            created_at: j.created_at || '',
          };
        });

        fetch(webhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'SYNC_ALL',
            timestamp: new Date().toISOString(),
            data: fullPayload,
          }),
        }).catch((err) => console.warn('Auto webhook sync notice:', err));
      }
    }

    return { success: true, message: 'Jadwal peminjam berhasil dihapus secara permanen.' };
  };

  // Clear all schedule records
  const clearAllJadwal = () => {
    const total = jadwalList.length;
    setJadwalList([]);
    addLog('RESET_DATA', 'Jadwal', `Mengosongkan seluruh database jadwal peminjam (${total} entri dihapus).`);

    if (settings.autoSyncSheets) {
      const webhookUrl = settings.googleSheetsWebhookUrl?.trim() || INITIAL_SETTINGS.googleSheetsWebhookUrl;
      if (webhookUrl && (webhookUrl.startsWith('http://') || webhookUrl.startsWith('https://'))) {
        fetch(webhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'SYNC_ALL',
            timestamp: new Date().toISOString(),
            data: [],
          }),
        }).catch((err) => console.warn('Auto webhook sync notice:', err));
      }
    }

    return {
      success: true,
      message: `Seluruh database jadwal peminjam (${total} entri) berhasil dikosongkan.`,
    };
  };

  // Cancel schedule
  const cancelJadwal = (id: string, alasan?: string) => {
    const existing = jadwalList.find((j) => j.id === id);
    if (!existing) return { success: false, message: 'Jadwal tidak ditemukan.' };

    const nextJadwalList = jadwalList.map((j) =>
      j.id === id
        ? {
            ...j,
            status: 'Dibatalkan' as const,
            keperluan: alasan ? `[DIBATALKAN: ${alasan}] ${j.keperluan || ''}` : j.keperluan,
            updated_at: new Date().toISOString(),
          }
        : j
    );
    setJadwalList(nextJadwalList);

    addLog('BATAL_JADWAL', 'Jadwal', `Membatalkan jadwal: ${existing.mata_pelajaran} (${existing.tanggal} Jam ke-${existing.jam_ke})`, id);

    if (settings.autoSyncSheets) {
      const webhookUrl = settings.googleSheetsWebhookUrl?.trim() || INITIAL_SETTINGS.googleSheetsWebhookUrl;
      if (webhookUrl && (webhookUrl.startsWith('http://') || webhookUrl.startsWith('https://'))) {
        const fullPayload = nextJadwalList.map((j) => {
          const guru = guruList.find((g) => g.id === j.guru_id);
          const kelas = kelasList.find((k) => k.id === j.kelas_id);
          const ruangan = ruanganList.find((r) => r.id === j.ruangan_id);
          const waktuStr = getFormattedJamRangeHelper(j.hari, j.jam_ke, settings);
          return {
            id: j.id,
            tanggal: j.tanggal || '',
            hari: j.hari || '',
            jam_ke: j.jam_ke,
            waktu: waktuStr,
            ruangan: ruangan?.nama_ruangan || '',
            guru: guru?.nama_guru || '',
            nip_guru: guru?.nip || '',
            mata_pelajaran: j.mata_pelajaran || '',
            kelas: kelas?.nama_kelas || '',
            keperluan: j.keperluan || '',
            status: j.status || '',
            pembuat: j.created_by_name || '',
            created_at: j.created_at || '',
          };
        });

        fetch(webhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'SYNC_ALL',
            timestamp: new Date().toISOString(),
            data: fullPayload,
          }),
        }).catch((err) => console.warn('Auto webhook sync notice:', err));
      }
    }

    return { success: true, message: 'Jadwal berhasil dibatalkan.' };
  };

  // Complete schedule
  const completeJadwal = (id: string) => {
    const nextJadwalList = jadwalList.map((j) =>
      j.id === id ? { ...j, status: 'Selesai' as const, updated_at: new Date().toISOString() } : j
    );
    setJadwalList(nextJadwalList);
    addLog('SELESAI_JADWAL', 'Jadwal', `Menandai jadwal selesai (ID: ${id})`, id);

    if (settings.autoSyncSheets) {
      const webhookUrl = settings.googleSheetsWebhookUrl?.trim() || INITIAL_SETTINGS.googleSheetsWebhookUrl;
      if (webhookUrl && (webhookUrl.startsWith('http://') || webhookUrl.startsWith('https://'))) {
        const fullPayload = nextJadwalList.map((j) => {
          const guru = guruList.find((g) => g.id === j.guru_id);
          const kelas = kelasList.find((k) => k.id === j.kelas_id);
          const ruangan = ruanganList.find((r) => r.id === j.ruangan_id);
          const waktuStr = getFormattedJamRangeHelper(j.hari, j.jam_ke, settings);
          return {
            id: j.id,
            tanggal: j.tanggal || '',
            hari: j.hari || '',
            jam_ke: j.jam_ke,
            waktu: waktuStr,
            ruangan: ruangan?.nama_ruangan || '',
            guru: guru?.nama_guru || '',
            nip_guru: guru?.nip || '',
            mata_pelajaran: j.mata_pelajaran || '',
            kelas: kelas?.nama_kelas || '',
            keperluan: j.keperluan || '',
            status: j.status || '',
            pembuat: j.created_by_name || '',
            created_at: j.created_at || '',
          };
        });

        fetch(webhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'SYNC_ALL',
            timestamp: new Date().toISOString(),
            data: fullPayload,
          }),
        }).catch((err) => console.warn('Auto webhook sync notice:', err));
      }
    }

    return { success: true, message: 'Status jadwal diubah menjadi Selesai.' };
  };


  // Master Guru
  const createGuru = (data: Omit<Guru, 'id'>) => {
    const newId = 'gr_' + Date.now();
    const newGuru: Guru = { id: newId, ...data };
    setGuruList((prev) => [...prev, newGuru]);
    addLog('TAMBAH_GURU', 'Guru', `Menambahkan guru baru: ${data.nama_guru} (${data.mata_pelajaran})`, newId);
    return { success: true, message: 'Data guru berhasil ditambahkan.' };
  };

  const updateGuru = (id: string, data: Partial<Omit<Guru, 'id'>>) => {
    setGuruList((prev) => prev.map((g) => (g.id === id ? { ...g, ...data } : g)));
    addLog('UBAH_GURU', 'Guru', `Memperbarui data guru ID: ${id}`, id);
    return { success: true, message: 'Data guru berhasil diperbarui.' };
  };

  const deleteGuru = (id: string) => {
    const target = guruList.find((g) => g.id === id);
    setGuruList((prev) => prev.filter((g) => g.id !== id));
    addLog('HAPUS_GURU', 'Guru', `Menghapus data guru: ${target?.nama_guru || id}`, id);
    return { success: true, message: `Data guru ${target?.nama_guru || ''} berhasil dihapus.` };
  };

  const importGuruBatch = (newGurus: Omit<Guru, 'id'>[]) => {
    const created: Guru[] = newGurus.map((g, idx) => ({
      id: 'gr_imp_' + Date.now() + '_' + idx,
      ...g,
    }));
    setGuruList((prev) => [...prev, ...created]);
    addLog('IMPORT_DATA', 'Guru', `Import batch ${created.length} data guru dari Excel/CSV.`);
    return { success: true, count: created.length };
  };

  // Master Kelas
  const createKelas = (data: Omit<Kelas, 'id'>) => {
    const newId = 'kls_' + Date.now();
    const newKelas: Kelas = { id: newId, ...data };
    setKelasList((prev) => [...prev, newKelas]);
    addLog('TAMBAH_KELAS', 'Kelas', `Menambahkan kelas baru: ${data.nama_kelas} (${data.jenjang})`, newId);
    return { success: true, message: 'Data kelas berhasil ditambahkan.' };
  };

  const updateKelas = (id: string, data: Partial<Omit<Kelas, 'id'>>) => {
    setKelasList((prev) => prev.map((k) => (k.id === id ? { ...k, ...data } : k)));
    addLog('UBAH_KELAS', 'Kelas', `Memperbarui kelas ID: ${id}`, id);
    return { success: true, message: 'Data kelas berhasil diperbarui.' };
  };

  const deleteKelas = (id: string) => {
    const target = kelasList.find((k) => k.id === id);
    setKelasList((prev) => prev.filter((k) => k.id !== id));
    addLog('HAPUS_KELAS', 'Kelas', `Menghapus kelas: ${target?.nama_kelas || id}`, id);
    return { success: true, message: `Kelas ${target?.nama_kelas || ''} berhasil dihapus.` };
  };

  // Master Ruangan
  const createRuangan = (data: Omit<Ruangan, 'id'>) => {
    const newId = 'rng_' + Date.now();
    const newRuangan: Ruangan = { id: newId, ...data };
    setRuanganList((prev) => [...prev, newRuangan]);
    addLog('TAMBAH_RUANGAN', 'Ruangan', `Menambahkan ruangan baru: ${data.nama_ruangan}`, newId);
    return { success: true, message: 'Ruangan baru berhasil ditambahkan.' };
  };

  const updateRuangan = (id: string, data: Partial<Omit<Ruangan, 'id'>>) => {
    setRuanganList((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));
    addLog('UBAH_RUANGAN', 'Ruangan', `Memperbarui ruangan ID: ${id}`, id);
    return { success: true, message: 'Data ruangan berhasil diperbarui.' };
  };

  const deleteRuangan = (id: string) => {
    const target = ruanganList.find((r) => r.id === id);
    setRuanganList((prev) => prev.filter((r) => r.id !== id));
    addLog('HAPUS_RUANGAN', 'Ruangan', `Menghapus ruangan: ${target?.nama_ruangan || id}`, id);
    return { success: true, message: `Ruangan ${target?.nama_ruangan || ''} berhasil dihapus.` };
  };

  const [isSyncingSheets, setIsSyncingSheets] = useState<boolean>(false);

  // Auth Operations
  const login = (username: string, password?: string): boolean => {
    const trimmedUsername = username.trim().toLowerCase();
    const trimmedPassword = (password || '').trim();

    if (!trimmedUsername || !trimmedPassword) {
      return false;
    }

    // Find matching user with exact credential verification
    const matched = users.find((u) => {
      if (u.username.toLowerCase() !== trimmedUsername) return false;

      // Check standard password or default credentials
      if (u.password && u.password === trimmedPassword) return true;
      if (u.username.toLowerCase() === 'admin' && (trimmedPassword === 'admin123' || trimmedPassword === 'admin')) return true;
      if (u.username.toLowerCase() === 'operator' && (trimmedPassword === 'operator123' || trimmedPassword === 'operator')) return true;
      if (u.role === 'guru' && (trimmedPassword === 'guru123' || trimmedPassword === 'guru')) return true;

      return false;
    });

    if (matched) {
      setCurrentUser(matched);
      addLog(
        'TAMBAH_JADWAL',
        'System',
        `Pengguna ${matched.nama || matched.nama_lengkap} (${matched.role}) berhasil login.`
      );
      return true;
    }

    return false;
  };

  const logout = () => {
    if (currentUser) {
      addLog('TAMBAH_JADWAL', 'System', `Pengguna ${currentUser.nama || currentUser.nama_lengkap} keluar dari sistem.`);
    }
    setCurrentUser(null);
  };

  // Users & Settings
  const createUser = (data: Partial<User> & { username: string; role: UserRole }) => {
    const newId = 'usr_' + Date.now();
    const namaValue = data.nama_lengkap || data.nama || data.username;
    const newUser: User = {
      id: newId,
      username: data.username,
      nama: namaValue,
      nama_lengkap: namaValue,
      email: data.email || `${data.username}@albashiroh.sch.id`,
      password: data.password || '123456',
      role: data.role,
      created_at: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    addLog('TAMBAH_JADWAL', 'System', `Menambahkan user baru: ${namaValue} (${data.role})`, newId);
    return { success: true, message: 'Pengguna baru berhasil didaftarkan.' };
  };

  const updateUser = (id: string, data: Partial<Omit<User, 'id'>>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)));
    return { success: true, message: 'Data pengguna berhasil diperbarui.' };
  };

  const deleteUser = (id: string) => {
    if (id === 'usr_admin') {
      return { success: false, message: 'Akun Administrator utama tidak boleh dihapus.' };
    }
    setUsers((prev) => prev.filter((u) => u.id !== id));
    return { success: true, message: 'Pengguna berhasil dihapus.' };
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addLog('UBAH_JADWAL', 'System', 'Memperbarui pengaturan sistem dan identitas sekolah.');
  };

  const updateDailySessionSchedule = (hari: HariType, sessions: JamPembelajaranConfigItem[]) => {
    setSettings((prev) => {
      const prevHarian = prev.jadwalSesiHarian || DEFAULT_JADWAL_SESI_HARIAN;
      const nextHarian: JadwalSesiHarian = {
        ...prevHarian,
        [hari]: sessions,
      };
      return {
        ...prev,
        jadwalSesiHarian: nextHarian,
      };
    });
    addLog('UBAH_JADWAL', 'System', `Memperbarui pengaturan waktu jam ke-1 s.d 8 hari ${hari}.`);
  };

  const resetDailySessionSchedule = (hari?: HariType) => {
    setSettings((prev) => {
      if (hari) {
        const nextHarian = {
          ...(prev.jadwalSesiHarian || DEFAULT_JADWAL_SESI_HARIAN),
          [hari]: DEFAULT_JADWAL_SESI_HARIAN[hari],
        };
        return { ...prev, jadwalSesiHarian: nextHarian };
      }
      return { ...prev, jadwalSesiHarian: DEFAULT_JADWAL_SESI_HARIAN };
    });
    addLog(
      'RESET_DATA',
      'System',
      hari
        ? `Mereset jadwal sesi jam pelajaran hari ${hari} ke template standar.`
        : 'Mereset jadwal sesi seluruh hari (Senin s/d Sabtu) ke template standar.'
    );
  };

  const getJamConfig = (hari?: HariType | string, jam_ke?: number) => {
    return getJamConfigHelper(hari, jam_ke, settings);
  };

  const getJamListForHari = (hari?: HariType | string) => {
    return getJamListForHariHelper(hari, settings);
  };

  const getFormattedJamRange = (hari?: HariType | string, jam_ke?: number, includeLabel?: boolean) => {
    return getFormattedJamRangeHelper(hari, jam_ke, settings, includeLabel);
  };

  // Audit Logs Maintenance
  const clearAuditLogs = () => {
    setAuditLogs([]);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
  };

  // Reset / Clear Data Tool
  const clearHistoricalJadwal = (type: 'all' | 'old' | 'canceled') => {
    if (!currentUser || currentUser.role !== 'admin') {
      return { count: 0, message: 'Hanya Administrator yang dapat melakukan pembersihan data.' };
    }

    let deletedCount = 0;
    const today = new Date().toISOString().slice(0, 10);

    if (type === 'all') {
      deletedCount = jadwalList.length;
      setJadwalList([]);
      addLog('RESET_DATA', 'System', `Pembersihan basis data: menghapus seluruh ${deletedCount} entri jadwal.`);
    } else if (type === 'old') {
      const remaining = jadwalList.filter((j) => j.tanggal >= today);
      deletedCount = jadwalList.length - remaining.length;
      setJadwalList(remaining);
      addLog('RESET_DATA', 'System', `Pembersihan basis data: menghapus ${deletedCount} entri jadwal lampau.`);
    } else if (type === 'canceled') {
      const remaining = jadwalList.filter((j) => j.status !== 'Dibatalkan');
      deletedCount = jadwalList.length - remaining.length;
      setJadwalList(remaining);
      addLog('RESET_DATA', 'System', `Pembersihan basis data: menghapus ${deletedCount} jadwal yang dibatalkan.`);
    }

    return { count: deletedCount, message: `Berhasil membersihkan ${deletedCount} entri data.` };
  };

  const resetAllDataToDefault = () => {
    setGuruList(INITIAL_GURU);
    setKelasList(INITIAL_KELAS);
    setRuanganList(INITIAL_RUANGAN);
    setJadwalList(generateInitialJadwal());
    setSettings(INITIAL_SETTINGS);
    setUsers(INITIAL_USERS);
    addLog('RESET_DATA', 'System', 'Mereset seluruh basis data ke data master awal (Factory Reset).');
  };

  // Google Sheets integration helper
  const syncWithSheets = async () => {
    try {
      setIsSyncingSheets(true);

      const formattedData = jadwalList.map((j) => {
        const guru = guruList.find((g) => g.id === j.guru_id);
        const kelas = kelasList.find((k) => k.id === j.kelas_id);
        const ruangan = ruanganList.find((r) => r.id === j.ruangan_id);
        const waktuStr = getFormattedJamRangeHelper(j.hari, j.jam_ke, settings);

        return {
          id: j.id,
          tanggal: j.tanggal || '',
          hari: j.hari || '',
          jam_ke: j.jam_ke,
          waktu: waktuStr,
          ruangan: ruangan?.nama_ruangan || '',
          guru: guru?.nama_guru || '',
          nip_guru: guru?.nip || '',
          mata_pelajaran: j.mata_pelajaran || '',
          kelas: kelas?.nama_kelas || '',
          keperluan: j.keperluan || '',
          status: j.status || '',
          pembuat: j.created_by_name || '',
          created_at: j.created_at || '',
        };
      });

      const jamPelajaranRows = generateJamPelajaranSheetRows(settings.jadwalSesiHarian);
      const webhookUrl = settings.googleSheetsWebhookUrl?.trim();

      if (webhookUrl && (webhookUrl.startsWith('http://') || webhookUrl.startsWith('https://'))) {
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            mode: 'no-cors', // Essential for Google Apps Script Web App redirects
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'SYNC_ALL',
              timestamp: new Date().toISOString(),
              total_records: formattedData.length,
              sekolah: settings.namaSekolah,
              tahun_pelajaran: settings.tahunPelajaran,
              semester: settings.semester,
              data: formattedData,
              jam_pelajaran: jamPelajaranRows,
            }),
          });
        } catch (fetchErr) {
          console.warn('Webhook sync attempt completed with notice:', fetchErr);
        }
      }

      await new Promise((res) => setTimeout(res, 600));
      const syncTime = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setLastSheetsSyncTime(syncTime);
      addLog(
        'SYNC_SHEETS',
        'Sheets',
        webhookUrl
          ? `Sinkronisasi webhook ke Google Spreadsheet sukses (${jadwalList.length} jadwal + 48 sesi jam pelajaran).`
          : `Data diformat untuk Google Spreadsheet ID: ${settings.googleSheetId || settings.googleSheetsId}`
      );
      setIsSyncingSheets(false);
      return {
        success: true,
        message: webhookUrl
          ? `Data ${jadwalList.length} entri jadwal dan pengaturan jam sesi harian (Senin - Sabtu) berhasil dikirim langsung ke Google Spreadsheet!`
          : `Data siap (${jadwalList.length} entri). Masukkan Webhook URL untuk sinkronisasi otomatis langsung ke sel spreadsheet.`,
      };
    } catch {
      setIsSyncingSheets(false);
      return { success: false, message: 'Gagal melakukan sinkronisasi dengan Google Sheets.' };
    }
  };

  // Dedicated sync for Jam Pelajaran (Session Timings) to Google Sheets
  const syncJamPelajaranToSheets = async (): Promise<{ success: boolean; message: string }> => {
    const webhookUrl = settings.googleSheetsWebhookUrl?.trim();
    if (!webhookUrl || (!webhookUrl.startsWith('http://') && !webhookUrl.startsWith('https://'))) {
      return {
        success: false,
        message: 'Google Apps Script Webhook URL belum diisi di Pengaturan Integrasi.',
      };
    }

    try {
      setIsSyncingSheets(true);
      const jamPelajaranRows = generateJamPelajaranSheetRows(settings.jadwalSesiHarian);

      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'SYNC_JAM_PELAJARAN',
          timestamp: new Date().toISOString(),
          sekolah: settings.namaSekolah,
          total_rows: jamPelajaranRows.length - 1,
          jam_pelajaran: jamPelajaranRows,
        }),
      });

      await new Promise((res) => setTimeout(res, 600));
      const syncTime = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setLastSheetsSyncTime(syncTime);
      addLog(
        'SYNC_SHEETS',
        'Sheets',
        'Pengaturan jam pembelajaran (Senin-Sabtu Jam 1-8) berhasil dikirim ke sheet Jam_Pelajaran.'
      );
      setIsSyncingSheets(false);
      return {
        success: true,
        message:
          'Pengaturan jam sesi pembelajaran (Senin - Sabtu Jam 1 s/d 8) berhasil dikirim dan disinkronkan ke tab "Jam_Pelajaran" pada Google Spreadsheet Anda!',
      };
    } catch (err: any) {
      setIsSyncingSheets(false);
      return {
        success: false,
        message: err?.message || 'Gagal mengirim pengaturan jam pembelajaran ke Google Spreadsheet.',
      };
    }
  };

  // Dedicated fetch for Jam Pelajaran (Session Timings) from Google Sheets
  const fetchJamPelajaranFromSheets = async (
    isSilent: boolean = false
  ): Promise<{ success: boolean; message: string }> => {
    const sheetInput = (
      settings.googleSheetUrl ||
      settings.googleSheetId ||
      settings.googleSheetsId ||
      ''
    ).trim();
    const webhookUrl = (settings.googleSheetsWebhookUrl || '').trim();

    if (!sheetInput && !webhookUrl) {
      if (!isSilent) {
        return {
          success: false,
          message: 'Google Sheet ID atau Webhook URL belum dikonfigurasi di Pengaturan.',
        };
      }
      return { success: false, message: '' };
    }

    try {
      const jamData = await fetchAllGoogleSheetJamRows(sheetInput, webhookUrl);
      if (jamData && jamData.rows.length >= 2) {
        const parsedJam = parseGoogleSheetRowsToJamPelajaran(jamData.rows);
        if (parsedJam) {
          setSettings((prev) => {
            const updated = {
              ...prev,
              jadwalSesiHarian: parsedJam,
            };
            try {
              localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
            } catch (e) {
              console.warn('Failed saving settings:', e);
            }
            return updated;
          });

          if (!isSilent) {
            addLog(
              'SYNC_SHEETS',
              'Sheets',
              `Memperbarui pengaturan jam pembelajaran dari tab Jam_Pelajaran (${jamData.source}).`
            );
          }

          return {
            success: true,
            message: `Pengaturan jam pembelajaran (Senin s/d Sabtu) berhasil disinkronkan dari Google Spreadsheet (${jamData.source})!`,
          };
        }
      }

      return {
        success: false,
        message:
          'Tab "Jam_Pelajaran" belum ditemukan di Spreadsheet. Gunakan tombol "Kirim Waktu Sesi ke Spreadsheet" untuk membuatnya secara otomatis.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Gagal membaca pengaturan jam dari Google Spreadsheet.',
      };
    }
  };

  // Fetch real schedule rows directly from published Google Sheets (GViz API, Webhook, or CSV)
  const fetchFromGoogleSheets = async (
    isSilent: boolean = false,
    customSheetInput?: string
  ): Promise<{ success: boolean; count: number; message: string }> => {
    const sheetInput = (
      customSheetInput ||
      settings.googleSheetUrl ||
      settings.googleSheetId ||
      settings.googleSheetsId ||
      ''
    ).trim();
    const webhookUrl = (settings.googleSheetsWebhookUrl || '').trim();

    if (!sheetInput && !webhookUrl) {
      if (!isSilent) {
        return {
          success: false,
          count: 0,
          message: 'Google Sheet ID atau Webhook URL belum dikonfigurasi.',
        };
      }
      return { success: false, count: 0, message: '' };
    }

    if (!isSilent) {
      setIsSyncingSheets(true);
    }

    try {
      const { rows, source } = await fetchAllGoogleSheetRawRows(sheetInput, webhookUrl);
      const parsedJadwal = parseGoogleSheetRowsToJadwal(rows, guruList, kelasList, ruanganList);

      // Concurrently attempt to read Jam_Pelajaran tab
      try {
        const jamData = await fetchAllGoogleSheetJamRows(sheetInput, webhookUrl);
        if (jamData && jamData.rows.length >= 2) {
          const parsedJam = parseGoogleSheetRowsToJamPelajaran(jamData.rows);
          if (parsedJam) {
            setSettings((prev) => {
              const currentStr = JSON.stringify(prev.jadwalSesiHarian || {});
              const newStr = JSON.stringify(parsedJam);
              if (currentStr !== newStr) {
                const updated = { ...prev, jadwalSesiHarian: parsedJam };
                try {
                  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
                } catch {
                  // ignore
                }
                return updated;
              }
              return prev;
            });
          }
        }
      } catch {
        // non-blocking for jam session polling
      }

      setIsRealtimeConnected(true);
      const syncTime = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setLastSheetsSyncTime(syncTime);

      // Deep comparison / state update
      setJadwalList((currentList) => {
        const currentSerialized = JSON.stringify(
          currentList.map((j) => ({
            id: j.id,
            tgl: j.tanggal,
            jam: j.jam_ke,
            rg: j.ruangan_id,
            gr: j.guru_id,
            mp: j.mata_pelajaran,
            kl: j.kelas_id,
            st: j.status,
          }))
        );

        const newSerialized = JSON.stringify(
          parsedJadwal.map((j) => ({
            id: j.id,
            tgl: j.tanggal,
            jam: j.jam_ke,
            rg: j.ruangan_id,
            gr: j.guru_id,
            mp: j.mata_pelajaran,
            kl: j.kelas_id,
            st: j.status,
          }))
        );

        if (currentSerialized !== newSerialized) {
          return parsedJadwal;
        }
        return currentList;
      });

      if (!isSilent) {
        addLog(
          'SYNC_SHEETS',
          'Sheets',
          `Sinkronisasi ${parsedJadwal.length} data jadwal dari Google Spreadsheet (${source}).`
        );
      }

      setIsSyncingSheets(false);
      return {
        success: true,
        count: parsedJadwal.length,
        message: `Berhasil memuat ${parsedJadwal.length} data jadwal langsung dari Google Spreadsheet (${source}).`,
      };
    } catch (err: any) {
      setIsSyncingSheets(false);
      if (!isSilent) {
        return {
          success: false,
          count: 0,
          message:
            err?.message ||
            'Gagal membaca data dari Google Spreadsheet. Pastikan akses dokumen dibagikan publik (Anyone with the link).',
        };
      }
      return { success: false, count: 0, message: '' };
    }
  };

  // Real-time automatic background polling from Google Sheets (every 10s & on tab switch / window focus)
  useEffect(() => {
    // Immediate fetch on mount
    fetchFromGoogleSheets(true);

    const intervalSeconds = Math.max(8, settings.autoRefreshTVSeconds || 10);
    const intervalId = setInterval(() => {
      fetchFromGoogleSheets(true);
    }, intervalSeconds * 1000);

    const handleFocusOrVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchFromGoogleSheets(true);
      }
    };

    window.addEventListener('focus', handleFocusOrVisibility);
    document.addEventListener('visibilitychange', handleFocusOrVisibility);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocusOrVisibility);
      document.removeEventListener('visibilitychange', handleFocusOrVisibility);
    };
  }, [
    settings.googleSheetId,
    settings.googleSheetsId,
    settings.googleSheetsWebhookUrl,
    settings.autoRefreshTVSeconds,
    guruList,
    kelasList,
    ruanganList,
  ]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        userList: users,
        login,
        logout,
        guruList,
        kelasList,
        ruanganList,
        jadwalList,
        auditLogs,
        settings,
        activeView,
        setActiveView,
        selectedWeekOffset,
        setSelectedWeekOffset,
        isBookingModalOpen,
        setIsBookingModalOpen,
        isLoginModalOpen,
        setIsLoginModalOpen,
        isSheetsModalOpen,
        setIsSheetsModalOpen,
        editingJadwal,
        setEditingJadwal,
        prefilledBooking,
        setPrefilledBooking,
        checkConflict,
        createJadwal,
        updateJadwal,
        deleteJadwal,
        cancelJadwal,
        completeJadwal,
        createGuru,
        updateGuru,
        deleteGuru,
        importGuruBatch,
        createKelas,
        updateKelas,
        deleteKelas,
        createRuangan,
        updateRuangan,
        deleteRuangan,
        createUser,
        updateUser,
        deleteUser,
        updateSettings,
        updateDailySessionSchedule,
        resetDailySessionSchedule,
        getJamConfig,
        getJamListForHari,
        getFormattedJamRange,
        clearAuditLogs,
        clearHistoricalJadwal,
        clearAllJadwal,
        resetAllDataToDefault,
        lastSheetsSyncTime,
        lastSyncTime: lastSheetsSyncTime,
        isSyncingSheets,
        isRealtimeConnected,
        syncWithSheets,
        syncJamPelajaranToSheets,
        fetchJamPelajaranFromSheets,
        fetchFromGoogleSheets,
      }}
    >
      {children}
    </AppContext.Provider>
  );

};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
