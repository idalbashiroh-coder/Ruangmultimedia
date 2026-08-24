import { AppSettings, Guru, Jadwal, Kelas, Ruangan, User } from '../types';

export const HARI_LIST: ('Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu')[] = [
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

export const JAM_LIST: (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8)[] = [1, 2, 3, 4, 5, 6, 7, 8];

export interface JamPembelajaranConfigItem {
  jam_ke: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  mulai: string;
  selesai: string;
  label: string;
}

export const JAM_PEMBELAJARAN_CONFIG: JamPembelajaranConfigItem[] = [
  { jam_ke: 1, mulai: '07:00', selesai: '07:45', label: 'Jam Ke-1 (07:00 - 07:45)' },
  { jam_ke: 2, mulai: '07:45', selesai: '08:30', label: 'Jam Ke-2 (07:45 - 08:30)' },
  { jam_ke: 3, mulai: '08:30', selesai: '09:15', label: 'Jam Ke-3 (08:30 - 09:15)' },
  { jam_ke: 4, mulai: '09:30', selesai: '10:15', label: 'Jam Ke-4 (09:30 - 10:15)' },
  { jam_ke: 5, mulai: '10:15', selesai: '11:00', label: 'Jam Ke-5 (10:15 - 11:00)' },
  { jam_ke: 6, mulai: '11:00', selesai: '11:45', label: 'Jam Ke-6 (11:00 - 11:45)' },
  { jam_ke: 7, mulai: '12:30', selesai: '13:15', label: 'Jam Ke-7 (12:30 - 13:15)' },
  { jam_ke: 8, mulai: '13:15', selesai: '14:00', label: 'Jam Ke-8 (13:15 - 14:00)' },
];

export const INITIAL_SETTINGS: AppSettings = {
  namaAplikasi: 'SISTEM PENJADWALAN RUANGAN MULTIMEDIA',
  namaSekolah: 'SMA - SMP IT ALBASHIROH TUREN',
  alamatSekolah: 'Jl. Raya Turen No. 45, Turen, Kab. Malang, Jawa Timur',
  tahunPelajaran: '2025/2026',
  semester: 'Ganjil',
  kepalaSekolah: 'Ustadz Drs. H. Muhammad Arifin, M.Pd.',
  nipKepalaSekolah: '197608152005011004',
  koordinatorLab: 'Ustadz Ahmad Fauzi, S.Kom.',
  nipKoordinatorLab: '198804122014021003',
  googleSheetUrl: 'https://docs.google.com/spreadsheets/d/1q5bPQaDv5K067p9bvmZrl4Efy52O5IRg-pioPUyQbnE/edit?usp=sharing',
  googleSheetId: '1q5bPQaDv5K067p9bvmZrl4Efy52O5IRg-pioPUyQbnE',
  googleSheetsId: '1q5bPQaDv5K067p9bvmZrl4Efy52O5IRg-pioPUyQbnE',
  googleSheetsWebhookUrl: 'https://script.google.com/macros/s/AKfycbxIGbrYQBvOEQ0e7V8-icSOsUpBuWPADh5oVwoWMuta1ItBE1_mtDaAU_kEkIw7-eIvcA/exec',
  autoSyncSheets: true,
  autoRefreshTVSeconds: 15,
};

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_admin',
    nama: 'Administrator Multimedia',
    nama_lengkap: 'Administrator Multimedia',
    username: 'admin',
    email: 'id.albashiroh@gmail.com',
    password: 'admin',
    role: 'admin',
    created_at: '2025-07-01T08:00:00.000Z',
  },
  {
    id: 'usr_operator',
    nama: 'Operator Sarpras & Lab',
    nama_lengkap: 'Operator Sarpras & Lab',
    username: 'operator',
    email: 'sarpras@albashiroh.sch.id',
    password: 'operator',
    role: 'operator',
    created_at: '2025-07-01T08:00:00.000Z',
  },
  {
    id: 'usr_guru_ahmad',
    nama: 'Ustadz Ahmad Fauzi, S.Kom.',
    nama_lengkap: 'Ustadz Ahmad Fauzi, S.Kom.',
    username: 'guru_ahmad',
    email: 'ahmad.fauzi@albashiroh.sch.id',
    password: 'guru',
    role: 'guru',
    created_at: '2025-07-01T08:00:00.000Z',
  },
  {
    id: 'usr_guru_fatimah',
    nama: 'Ustadzah Siti Fatimah, S.Pd.',
    nama_lengkap: 'Ustadzah Siti Fatimah, S.Pd.',
    username: 'guru_fatimah',
    email: 'siti.fatimah@albashiroh.sch.id',
    password: 'guru',
    role: 'guru',
    created_at: '2025-07-01T08:00:00.000Z',
  },
];

export const INITIAL_RUANGAN: Ruangan[] = [
  {
    id: 'rng_perpus',
    nama_ruangan: 'Ruang Perpustakaan',
    status: 'Tersedia',
    keterangan: 'Ruang Perpustakaan Utama IT Albashiroh dilengkapi Smart TV 65", AC, Sound System, dan 10 PC Digital Library.',
    kapasitas: 45,
    fasilitas: ['Smart TV 65 Inch', 'AC 2 PK', 'Sound System & Mic Wireless', 'WiFi High Speed', '10 PC Akses Jurnal'],
    warna: '#059669', // Emerald
  },
  {
    id: 'rng_labkom',
    nama_ruangan: 'Ruang Lab. Komputer',
    status: 'Tersedia',
    keterangan: 'Laboratorium Multimedia & Komputer dengan 36 Unit PC Core i7, Proyektor Laser, Gigabit LAN, dan AC.',
    kapasitas: 36,
    fasilitas: ['36 PC Siswa + 1 PC Guru Master', 'Laser Proyektor & Layar Motorized', 'AC 2x2 PK', 'LAN Gigabit & Mikrotik Server', 'UPS Central'],
    warna: '#4f46e5', // Indigo
  },
];

export const INITIAL_GURU: Guru[] = [
  {
    id: 'gr_1',
    nama_guru: 'Ustadz Ahmad Fauzi, S.Kom.',
    nip: '198804122014021003',
    mata_pelajaran: 'Informatika & Pemrograman',
    jenjang: 'SMP & SMA',
    nomor_hp: '081234567801',
    status: 'Aktif',
  },
  {
    id: 'gr_2',
    nama_guru: 'Ustadzah Siti Fatimah, S.Pd.',
    nip: '199003152016042001',
    mata_pelajaran: 'Bahasa Indonesia & Literasi',
    jenjang: 'SMP & SMA',
    nomor_hp: '081234567802',
    status: 'Aktif',
  },
  {
    id: 'gr_3',
    nama_guru: 'Ustadz Muhammad Ridwan, Lc., M.H.',
    nip: '198506202010011005',
    mata_pelajaran: 'PAI, Al-Quran & Hadits',
    jenjang: 'SMP & SMA',
    nomor_hp: '081234567803',
    status: 'Aktif',
  },
  {
    id: 'gr_4',
    nama_guru: 'Ustadzah Nurul Hidayah, S.Si.',
    nip: '199201102018032002',
    mata_pelajaran: 'IPA Terpadu & Biologi',
    jenjang: 'SMP',
    nomor_hp: '081234567804',
    status: 'Aktif',
  },
  {
    id: 'gr_5',
    nama_guru: 'Ustadz Budi Santoso, M.Pd.',
    nip: '198309112009021001',
    mata_pelajaran: 'Matematika & Statistik',
    jenjang: 'SMP & SMA',
    nomor_hp: '081234567805',
    status: 'Aktif',
  },
  {
    id: 'gr_6',
    nama_guru: 'Ustadzah Dian Anggraeni, S.Pd. (Eng)',
    nip: '199407222019052003',
    mata_pelajaran: 'Bahasa Inggris & TOEFL Prep',
    jenjang: 'SMP & SMA',
    nomor_hp: '081234567806',
    status: 'Aktif',
  },
  {
    id: 'gr_7',
    nama_guru: 'Ustadz Abdullah Mansur, S.Pd.I',
    nip: '198711142012011002',
    mata_pelajaran: 'Bahasa Arab & Nahwu Sharaf',
    jenjang: 'SMP & SMA',
    nomor_hp: '081234567807',
    status: 'Aktif',
  },
  {
    id: 'gr_8',
    nama_guru: 'Ustadz Hendra Gunawan, S.T.',
    nip: '198905032015031002',
    mata_pelajaran: 'Fisika & Robotika',
    jenjang: 'SMA',
    nomor_hp: '081234567808',
    status: 'Aktif',
  },
  {
    id: 'gr_9',
    nama_guru: 'Ustadzah Rina Astuti, S.Pd.',
    nip: '199302182017042001',
    mata_pelajaran: 'IPS Terpadu & Geografi',
    jenjang: 'SMP',
    nomor_hp: '081234567809',
    status: 'Aktif',
  },
  {
    id: 'gr_10',
    nama_guru: 'Ustadz Eko Prasetyo, S.Pd.',
    nip: '199110052016011003',
    mata_pelajaran: 'Kimia & Sains Terapan',
    jenjang: 'SMA',
    nomor_hp: '081234567810',
    status: 'Aktif',
  },
  {
    id: 'gr_11',
    nama_guru: 'Ustadzah Zahra Amalia, S.Sos.',
    nip: '199508192020082004',
    mata_pelajaran: 'Sosiologi & PKn',
    jenjang: 'SMA',
    nomor_hp: '081234567811',
    status: 'Aktif',
  },
];

export const INITIAL_KELAS: Kelas[] = [
  // SMP
  { id: 'kls_7a', nama_kelas: 'VII A', jenjang: 'SMP', status: 'Aktif' },
  { id: 'kls_7b', nama_kelas: 'VII B', jenjang: 'SMP', status: 'Aktif' },
  { id: 'kls_7c', nama_kelas: 'VII C', jenjang: 'SMP', status: 'Aktif' },
  { id: 'kls_8a', nama_kelas: 'VIII A', jenjang: 'SMP', status: 'Aktif' },
  { id: 'kls_8b', nama_kelas: 'VIII B', jenjang: 'SMP', status: 'Aktif' },
  { id: 'kls_8c', nama_kelas: 'VIII C', jenjang: 'SMP', status: 'Aktif' },
  { id: 'kls_9a', nama_kelas: 'IX A', jenjang: 'SMP', status: 'Aktif' },
  { id: 'kls_9b', nama_kelas: 'IX B', jenjang: 'SMP', status: 'Aktif' },
  { id: 'kls_9c', nama_kelas: 'IX C', jenjang: 'SMP', status: 'Aktif' },
  // SMA
  { id: 'kls_10a', nama_kelas: 'X A', jenjang: 'SMA', status: 'Aktif' },
  { id: 'kls_10b', nama_kelas: 'X B', jenjang: 'SMA', status: 'Aktif' },
  { id: 'kls_11a', nama_kelas: 'XI A', jenjang: 'SMA', status: 'Aktif' },
  { id: 'kls_11b', nama_kelas: 'XI B', jenjang: 'SMA', status: 'Aktif' },
  { id: 'kls_12a', nama_kelas: 'XII A', jenjang: 'SMA', status: 'Aktif' },
  { id: 'kls_12b', nama_kelas: 'XII B', jenjang: 'SMA', status: 'Aktif' },
];

// Helper to calculate a date for a specific day of current week
export function getDateOfCurrentWeek(dayName: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu', offsetWeeks = 0): string {
  const now = new Date();
  const currentDayIndex = now.getDay(); // 0 is Sunday, 1 is Monday, ... 6 is Saturday
  // Normalize Monday as index 0, Saturday as index 5
  const dayMap: Record<string, number> = {
    'Senin': 1,
    'Selasa': 2,
    'Rabu': 3,
    'Kamis': 4,
    'Jumat': 5,
    'Sabtu': 6,
  };
  const targetDayNum = dayMap[dayName] || 1;
  const currentMondayOffset = currentDayIndex === 0 ? -6 : 1 - currentDayIndex;
  
  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() + currentMondayOffset + (targetDayNum - 1) + (offsetWeeks * 7));
  
  const yyyy = targetDate.getFullYear();
  const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
  const dd = String(targetDate.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function getHariNameFromDate(dateStr: string): 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' {
  const date = new Date(dateStr + 'T00:00:00');
  const dayIndex = date.getDay();
  const mapping: ('Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu')[] = [
    'Senin', // 0 is Sunday, fallback to Senin
    'Senin', // 1
    'Selasa', // 2
    'Rabu', // 3
    'Kamis', // 4
    'Jumat', // 5
    'Sabtu', // 6
  ];
  return mapping[dayIndex] || 'Senin';
}

// Real data only: Schedules remain empty unless recorded or fetched from Google Spreadsheet
export const generateInitialJadwal = (): Jadwal[] => {
  return [];
};

