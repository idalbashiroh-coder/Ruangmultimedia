import { AppSettings, Guru, HariType, Jadwal, JadwalSesiHarian, JamPembelajaran, JamPembelajaranConfigItem, Kelas, Ruangan, User } from '../types';

export const HARI_LIST: ('Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu')[] = [
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

export const JAM_LIST: (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8)[] = [1, 2, 3, 4, 5, 6, 7, 8];

export { type JamPembelajaranConfigItem };

// Default session time slots for each day (Senin s/d Sabtu, Jam 1 s/d Jam 8)
export const DEFAULT_JADWAL_SESI_HARIAN: JadwalSesiHarian = {
  Senin: [
    { jam_ke: 1, mulai: '08:30', selesai: '09:10', label: 'Jam Ke-1 (08:30 - 09:10)' },
    { jam_ke: 2, mulai: '09:10', selesai: '09:50', label: 'Jam Ke-2 (09:10 - 09:50)' },
    { jam_ke: 3, mulai: '10:20', selesai: '11:00', label: 'Jam Ke-3 (10:20 - 11:00)' },
    { jam_ke: 4, mulai: '11:00', selesai: '11:40', label: 'Jam Ke-4 (11:00 - 11:40)' },
    { jam_ke: 5, mulai: '12:30', selesai: '13:10', label: 'Jam Ke-5 (12:30 - 13:10)' },
    { jam_ke: 6, mulai: '13:10', selesai: '13:50', label: 'Jam Ke-6 (13:10 - 13:50)' },
    { jam_ke: 7, mulai: '13:50', selesai: '14:30', label: 'Jam Ke-7 (13:50 - 14:30)' },
    { jam_ke: 8, mulai: '14:30', selesai: '15:00', label: 'Jam Ke-8 (14:30 - 15:00)' },
  ],
  Selasa: [
    { jam_ke: 1, mulai: '08:00', selesai: '08:40', label: 'Jam Ke-1 (08:00 - 08:40)' },
    { jam_ke: 2, mulai: '08:40', selesai: '09:20', label: 'Jam Ke-2 (08:40 - 09:20)' },
    { jam_ke: 3, mulai: '09:50', selesai: '10:30', label: 'Jam Ke-3 (09:50 - 10:30)' },
    { jam_ke: 4, mulai: '10:30', selesai: '11:10', label: 'Jam Ke-4 (10:30 - 11:10)' },
    { jam_ke: 5, mulai: '11:10', selesai: '11:50', label: 'Jam Ke-5 (11:10 - 11:50)' },
    { jam_ke: 6, mulai: '12:40', selesai: '13:20', label: 'Jam Ke-6 (12:40 - 13:20)' },
    { jam_ke: 7, mulai: '13:20', selesai: '14:00', label: 'Jam Ke-7 (13:20 - 14:00)' },
    { jam_ke: 8, mulai: '14:00', selesai: '15:00', label: 'Jam Ke-8 (14:00 - 15:00)' },
  ],
  Rabu: [
    { jam_ke: 1, mulai: '08:00', selesai: '08:40', label: 'Jam Ke-1 (08:00 - 08:40)' },
    { jam_ke: 2, mulai: '08:40', selesai: '09:20', label: 'Jam Ke-2 (08:40 - 09:20)' },
    { jam_ke: 3, mulai: '09:50', selesai: '10:30', label: 'Jam Ke-3 (09:50 - 10:30)' },
    { jam_ke: 4, mulai: '10:30', selesai: '11:10', label: 'Jam Ke-4 (10:30 - 11:10)' },
    { jam_ke: 5, mulai: '11:10', selesai: '11:50', label: 'Jam Ke-5 (11:10 - 11:50)' },
    { jam_ke: 6, mulai: '12:40', selesai: '13:20', label: 'Jam Ke-6 (12:40 - 13:20)' },
    { jam_ke: 7, mulai: '13:20', selesai: '14:00', label: 'Jam Ke-7 (13:20 - 14:00)' },
    { jam_ke: 8, mulai: '14:00', selesai: '15:00', label: 'Jam Ke-8 (14:00 - 15:00)' },
  ],
  Kamis: [
    { jam_ke: 1, mulai: '08:30', selesai: '09:00', label: 'Jam Ke-1 (08:30 - 09:00)' },
    { jam_ke: 2, mulai: '09:00', selesai: '09:30', label: 'Jam Ke-2 (09:00 - 09:30)' },
    { jam_ke: 3, mulai: '09:30', selesai: '10:00', label: 'Jam Ke-3 (09:30 - 10:00)' },
    { jam_ke: 4, mulai: '10:00', selesai: '10:30', label: 'Jam Ke-4 (10:00 - 10:30)' },
    { jam_ke: 5, mulai: '10:30', selesai: '11:00', label: 'Jam Ke-5 (10:30 - 11:00)' },
    { jam_ke: 6, mulai: '11:00', selesai: '11:30', label: 'Jam Ke-6 (11:00 - 11:30)' },
    { jam_ke: 7, mulai: '12:30', selesai: '13:00', label: 'Jam Ke-7 (12:30 - 13:00)' },
    { jam_ke: 8, mulai: '13:00', selesai: '13:40', label: 'Jam Ke-8 (13:00 - 13:40)' },
  ],
  Jumat: [
    { jam_ke: 1, mulai: '07:00', selesai: '07:40', label: 'Jam Ke-1 (07:00 - 07:40)' },
    { jam_ke: 2, mulai: '07:40', selesai: '08:20', label: 'Jam Ke-2 (07:40 - 08:20)' },
    { jam_ke: 3, mulai: '08:20', selesai: '09:00', label: 'Jam Ke-3 (08:20 - 09:00)' },
    { jam_ke: 4, mulai: '09:30', selesai: '10:10', label: 'Jam Ke-4 (09:30 - 10:10)' },
    { jam_ke: 5, mulai: '10:10', selesai: '10:50', label: 'Jam Ke-5 (10:10 - 10:50)' },
    { jam_ke: 6, mulai: '12:30', selesai: '13:10', label: 'Jam Ke-6 (12:30 - 13:10)' },
    { jam_ke: 7, mulai: '13:10', selesai: '14:30', label: 'Jam Ke-7 (13:10 - 14:30)' },
    { jam_ke: 8, mulai: '14:30', selesai: '15:00', label: 'Jam Ke-8 (14:30 - 15:00)' },
  ],
  Sabtu: [
    { jam_ke: 1, mulai: '07:00', selesai: '07:30', label: 'Jam Ke-1 (07:00 - 07:30)' },
    { jam_ke: 2, mulai: '07:30', selesai: '09:30', label: 'Jam Ke-2 (07:30 - 09:30)' },
    { jam_ke: 3, mulai: '09:45', selesai: '11:15', label: 'Jam Ke-3 (09:45 - 11:15)' },
    { jam_ke: 4, mulai: '11:15', selesai: '11:30', label: 'Jam Ke-4 (11:15 - 11:30)' },
    { jam_ke: 5, mulai: '11:30', selesai: '11:40', label: 'Jam Ke-5 (11:30 - 11:40)' },
    { jam_ke: 6, mulai: '12:40', selesai: '13:20', label: 'Jam Ke-6 (12:40 - 13:20)' },
    { jam_ke: 7, mulai: '13:20', selesai: '13:50', label: 'Jam Ke-7 (13:20 - 13:50)' },
    { jam_ke: 8, mulai: '13:50', selesai: '14:50', label: 'Jam Ke-8 (13:50 - 14:50)' },
  ],
};

// Fallback general config for backward compatibility
export const JAM_PEMBELAJARAN_CONFIG: JamPembelajaranConfigItem[] = DEFAULT_JADWAL_SESI_HARIAN.Selasa;

export const INITIAL_SETTINGS: AppSettings = {
  namaAplikasi: 'SISTEM PENJADWALAN RUANGAN MULTIMEDIA',
  namaSekolah: 'SMA - SMP IT ALBASHIROH TUREN',
  alamatSekolah: 'Jl. Tendean Ds. Tanggung, Turen, Kab. Malang, Jawa Timur',
  tahunPelajaran: '2026/2027',
  semester: 'Ganjil',
  kepalaSekolah: 'Lismaini, S.Pd, M.Pd.',
  nipKepalaSekolah: '-',
  koordinatorLab: 'Kukuh Fantrian Alfarobbi, S.Pd.',
  nipKoordinatorLab: '-',
  googleSheetUrl: 'https://docs.google.com/spreadsheets/d/1q5bPQaDv5K067p9bvmZrl4Efy52O5IRg-pioPUyQbnE/edit?usp=sharing',
  googleSheetId: '1q5bPQaDv5K067p9bvmZrl4Efy52O5IRg-pioPUyQbnE',
  googleSheetsId: '1q5bPQaDv5K067p9bvmZrl4Efy52O5IRg-pioPUyQbnE',
  googleSheetsWebhookUrl: 'https://script.google.com/macros/s/AKfycbxIGbrYQBvOEQ0e7V8-icSOsUpBuWPADh5oVwoWMuta1ItBE1_mtDaAU_kEkIw7-eIvcA/exec',
  autoSyncSheets: true,
  autoRefreshTVSeconds: 15,
  jadwalSesiHarian: DEFAULT_JADWAL_SESI_HARIAN,
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
    id: 'usr_guru_sumiatun',
    nama: 'Sumiatun, S.Pd., M.Pd.',
    nama_lengkap: 'Sumiatun, S.Pd., M.Pd.',
    username: 'guru_sumiatun',
    email: 'sumiatun@albashiroh.sch.id',
    password: 'guru',
    role: 'guru',
    created_at: '2025-07-01T08:00:00.000Z',
  },
  {
    id: 'usr_guru_lismaini',
    nama: 'Lismaini, S.Pd., M.Pd.',
    nama_lengkap: 'Lismaini, S.Pd., M.Pd.',
    username: 'guru_lismaini',
    email: 'lismaini@albashiroh.sch.id',
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
    nama_guru: 'Sumiatun, S.Pd., M.Pd.',
    nip: '-',
    mata_pelajaran: 'Fisika',
    jenjang: 'SMP & SMA',
    nomor_hp: '-',
    status: 'Aktif',
  },
  {
    id: 'gr_2',
    nama_guru: 'Lismaini, S.Pd., M.Pd.',
    nip: '-',
    mata_pelajaran: 'Bahasa Inggris',
    jenjang: 'SMP & SMA',
    nomor_hp: '-',
    status: 'Aktif',
  },
  {
    id: 'gr_3',
    nama_guru: 'Hari Subagya, S.Pd',
    nip: '-',
    mata_pelajaran: 'Matematika',
    jenjang: 'SMP & SMA',
    nomor_hp: '-',
    status: 'Aktif',
  },
  {
    id: 'gr_4',
    nama_guru: 'Ainul Yaqin, S.S.',
    nip: '-',
    mata_pelajaran: 'Bahasa Inggris',
    jenjang: 'SMP & SMA',
    nomor_hp: '-',
    status: 'Aktif',
  },
  {
    id: 'gr_5',
    nama_guru: 'Kukuh Fantrian Alfarobbi, S.Pd',
    nip: '-',
    mata_pelajaran: 'Kimia',
    jenjang: 'SMP & SMA',
    nomor_hp: '-',
    status: 'Aktif',
  },
  {
    id: 'gr_6',
    nama_guru: 'Kuswari, S.Pd',
    nip: '-',
    mata_pelajaran: 'Bahasa Arab',
    jenjang: 'SMP & SMA',
    nomor_hp: '-',
    status: 'Aktif',
  },
  {
    id: 'gr_7',
    nama_guru: 'Avi Ahmad Zazuli, S.Pd',
    nip: '-',
    mata_pelajaran: 'PJOK',
    jenjang: 'SMP & SMA',
    nomor_hp: '-',
    status: 'Aktif',
  },
  {
    id: 'gr_8',
    nama_guru: 'Fathur Rohman, S.Pd',
    nip: '-',
    mata_pelajaran: 'PKN',
    jenjang: 'SMP & SMA',
    nomor_hp: '-',
    status: 'Aktif',
  },
  {
    id: 'gr_9',
    nama_guru: 'Adi Farman, S.Psi',
    nip: '-',
    mata_pelajaran: 'Bimbingan Konseling',
    jenjang: 'SMP & SMA',
    nomor_hp: '-',
    status: 'Aktif',
  },
  {
    id: 'gr_10',
    nama_guru: "Imam Syafi'i, Lc, M.Pd",
    nip: '-',
    mata_pelajaran: 'Bahasa Arab',
    jenjang: 'SMP & SMA',
    nomor_hp: '-',
    status: 'Aktif',
  },
  {
    id: 'gr_11',
    nama_guru: 'Sri Endah Setyaningsih, S.E.',
    nip: '-',
    mata_pelajaran: 'Bahasa Jawa',
    jenjang: 'SMP & SMA',
    nomor_hp: '-',
    status: 'Aktif',
  },
  {
    id: 'gr_12',
    nama_guru: 'Erna Restyaning, S.Psi',
    nip: '-',
    mata_pelajaran: 'Bimbingan Konseling',
    jenjang: 'SMP & SMA',
    nomor_hp: '-',
    status: 'Aktif',
  },
  {
    id: 'gr_13',
    nama_guru: 'Anisa Rosalia Amanda, S.Kom',
    nip: '-',
    mata_pelajaran: 'Informatika',
    jenjang: 'SMP & SMA',
    nomor_hp: '-',
    status: 'Aktif',
  },
  {
    id: 'gr_14',
    nama_guru: 'Sinta Silvia Andriana D. S.Pd',
    nip: '-',
    mata_pelajaran: 'Bahasa Inggris',
    jenjang: 'SMP & SMA',
    nomor_hp: '-',
    status: 'Aktif',
  },
  {
    id: 'gr_15',
    nama_guru: 'Wulan Sofiatul Riski, S.Pd',
    nip: '-',
    mata_pelajaran: 'Bahasa Indonesia',
    jenjang: 'SMP & SMA',
    nomor_hp: '-',
    status: 'Aktif',
  },
  {
    id: 'gr_16',
    nama_guru: 'Rubayana Hidayah Yudiantari, S.Pd.',
    nip: '-',
    mata_pelajaran: 'IPA',
    jenjang: 'SMP & SMA',
    nomor_hp: '-',
    status: 'Aktif',
  },
  {
    id: 'gr_17',
    nama_guru: "Ivtirizqul Qur'aniah",
    nip: '-',
    mata_pelajaran: 'PAI',
    jenjang: 'SMP & SMA',
    nomor_hp: '-',
    status: 'Aktif',
  },
  {
    id: 'gr_18',
    nama_guru: 'Ahmad Syaifuddin Rohman, S.Pd',
    nip: '-',
    mata_pelajaran: 'IPS',
    jenjang: 'SMP & SMA',
    nomor_hp: '-',
    status: 'Aktif',
  },
  {
    id: 'gr_19',
    nama_guru: 'Krisnawati, S.Pd',
    nip: '-',
    mata_pelajaran: 'Matematika',
    jenjang: 'SMP & SMA',
    nomor_hp: '-',
    status: 'Aktif',
  },
  {
    id: 'gr_20',
    nama_guru: 'Nadya Nur Aisah',
    nip: '-',
    mata_pelajaran: 'Umum',
    jenjang: 'SMP & SMA',
    nomor_hp: '-',
    status: 'Aktif',
  },
  {
    id: 'gr_21',
    nama_guru: 'Nanda Dwi Hariyanto Putri',
    nip: '-',
    mata_pelajaran: 'Bahasa Indonesia',
    jenjang: 'SMP & SMA',
    nomor_hp: '-',
    status: 'Aktif',
  },
  {
    id: 'gr_22',
    nama_guru: 'Putri Nur Anggraeni',
    nip: '-',
    mata_pelajaran: 'Umum',
    jenjang: 'SMP & SMA',
    nomor_hp: '-',
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

// Helper to format Date to local 'YYYY-MM-DD' without UTC shift
export function getLocalDateString(date: Date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export const HARI_MAP_INDEX: Record<number, 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu'> = {
  0: 'Senin', // Minggu mapped to Senin for school weekday schedule
  1: 'Senin',
  2: 'Selasa',
  3: 'Rabu',
  4: 'Kamis',
  5: 'Jumat',
  6: 'Sabtu',
};

// Helper to calculate a date for a specific day of current week
export function getDateOfCurrentWeek(
  dayName: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu',
  offsetWeeks = 0,
  baseDate: Date = new Date()
): string {
  const currentDayIndex = baseDate.getDay(); // 0 is Sunday, 1 is Monday, ... 6 is Saturday
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
  
  const targetDate = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate() + currentMondayOffset + (targetDayNum - 1) + (offsetWeeks * 7)
  );
  
  return getLocalDateString(targetDate);
}

export function getHariNameFromDate(
  dateStrOrDate?: string | Date | null
): 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' {
  if (!dateStrOrDate) {
    const today = new Date();
    return HARI_MAP_INDEX[today.getDay()] || 'Senin';
  }

  if (dateStrOrDate instanceof Date) {
    return HARI_MAP_INDEX[dateStrOrDate.getDay()] || 'Senin';
  }

  const str = String(dateStrOrDate).trim();
  const lower = str.toLowerCase();

  // If already explicit Indonesian day name in string
  if (lower.includes('senin')) return 'Senin';
  if (lower.includes('selasa')) return 'Selasa';
  if (lower.includes('rabu')) return 'Rabu';
  if (lower.includes('kamis')) return 'Kamis';
  if (lower.includes('jumat') || lower.includes("jum'at")) return 'Jumat';
  if (lower.includes('sabtu')) return 'Sabtu';

  // Parse YYYY-MM-DD
  const ymd = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (ymd) {
    const y = parseInt(ymd[1], 10);
    const m = parseInt(ymd[2], 10) - 1;
    const d = parseInt(ymd[3], 10);
    const localDate = new Date(y, m, d);
    return HARI_MAP_INDEX[localDate.getDay()] || 'Senin';
  }

  // Parse DD-MM-YYYY
  const dmy = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (dmy) {
    const d = parseInt(dmy[1], 10);
    const m = parseInt(dmy[2], 10) - 1;
    const y = parseInt(dmy[3], 10);
    const localDate = new Date(y, m, d);
    return HARI_MAP_INDEX[localDate.getDay()] || 'Senin';
  }

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return HARI_MAP_INDEX[parsed.getDay()] || 'Senin';
  }

  return 'Senin';
}

// Real data only: Schedules remain empty unless recorded or fetched from Google Spreadsheet
export const generateInitialJadwal = (): Jadwal[] => {
  return [];
};

export const formatGuruDisplayName = (guruOrName?: string | Guru | null, short = false): string => {
  if (!guruOrName) return 'Guru Pengajar';
  const fullName = typeof guruOrName === 'string' ? guruOrName : guruOrName.nama_guru;
  if (!fullName || fullName.trim() === '') return 'Guru Pengajar';
  if (!short) return fullName.trim();

  // Clean title prefixes like Ustadz / Ustadzah
  const clean = fullName.replace(/ustadz(ah)?\s*/gi, '').trim();
  // Get base name before academic degrees comma (e.g. "Sumiatun, S.Pd., M.Pd." -> "Sumiatun")
  const baseName = clean.split(',')[0].trim();
  return baseName || fullName;
};

// Calculate duration in minutes between "HH:MM" and "HH:MM"
export function calculateDurationInMinutes(mulai: string, selesai: string): number {
  if (!mulai || !selesai) return 0;
  const [startH, startM] = mulai.split(':').map(Number);
  const [endH, endM] = selesai.split(':').map(Number);
  if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return 0;
  const startTotal = startH * 60 + startM;
  const endTotal = endH * 60 + endM;
  return Math.max(0, endTotal - startTotal);
}

// Get the 8 session slots for a specific day from settings (or defaults)
export function getJamListForHari(
  hari?: HariType | string | null,
  settings?: AppSettings | null
): JamPembelajaranConfigItem[] {
  const normalizedHari = (hari as HariType) || 'Senin';
  const dailyConfig = settings?.jadwalSesiHarian || DEFAULT_JADWAL_SESI_HARIAN;
  const list = dailyConfig[normalizedHari] || DEFAULT_JADWAL_SESI_HARIAN[normalizedHari] || DEFAULT_JADWAL_SESI_HARIAN.Senin;
  return list;
}

// Get specific period configuration for a given day and period number
export function getJamConfig(
  hari?: HariType | string | null,
  jam_ke?: number | null,
  settings?: AppSettings | null
): JamPembelajaranConfigItem {
  const jamNum = (jam_ke || 1) as JamPembelajaran;
  const list = getJamListForHari(hari, settings);
  const item = list.find((j) => j.jam_ke === jamNum);
  if (item) return item;
  return {
    jam_ke: jamNum,
    mulai: '07:00',
    selesai: '07:45',
    label: `Jam Ke-${jamNum} (07:00 - 07:45)`,
  };
}

// Get formatted time range string like "07:45 - 08:30" or "Jam Ke-1 (07:45 - 08:30)"
export function getFormattedJamRange(
  hari?: HariType | string | null,
  jam_ke?: number | null,
  settings?: AppSettings | null,
  includeLabel = false
): string {
  const config = getJamConfig(hari, jam_ke, settings);
  if (includeLabel) {
    return `Jam ke-${config.jam_ke} (${config.mulai} - ${config.selesai})`;
  }
  return `${config.mulai} - ${config.selesai}`;
}

// Dynamically determine current active period (1 to 8) for a day based on current clock time
export function getCurrentPeriodForHari(
  hari?: HariType | string | null,
  settings?: AppSettings | null,
  date: Date = new Date()
): number {
  const normalizedHari = (hari as HariType) || getHariNameFromDate(getLocalDateString(date));
  const sessions = getJamListForHari(normalizedHari, settings);
  const currentTotalMin = date.getHours() * 60 + date.getMinutes();

  for (const session of sessions) {
    const [startH, startM] = session.mulai.split(':').map(Number);
    const [endH, endM] = session.selesai.split(':').map(Number);
    if (!isNaN(startH) && !isNaN(endH)) {
      const startMin = startH * 60 + startM;
      const endMin = endH * 60 + endM;
      if (currentTotalMin >= startMin && currentTotalMin < endMin) {
        return session.jam_ke;
      }
    }
  }

  // If before first session, return 1
  const firstSession = sessions[0];
  if (firstSession) {
    const [startH, startM] = firstSession.mulai.split(':').map(Number);
    if (currentTotalMin < (startH * 60 + startM)) {
      return 1;
    }
  }

  // If between sessions or after school, find closest upcoming or default to 1/3
  for (let i = 0; i < sessions.length; i++) {
    const s = sessions[i];
    const [startH, startM] = s.mulai.split(':').map(Number);
    if (currentTotalMin <= (startH * 60 + startM)) {
      return s.jam_ke;
    }
  }

  return 1;
}


