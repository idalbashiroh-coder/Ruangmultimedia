export type UserRole = 'admin' | 'operator' | 'guru';

export interface User {
  id: string;
  nama: string;
  nama_lengkap?: string;
  username: string;
  email: string;
  password?: string;
  role: UserRole;
  created_at: string;
}

export type JenjangType = 'SMP' | 'SMA' | 'SMP & SMA';

export interface Guru {
  id: string;
  nama_guru: string;
  nip?: string;
  mata_pelajaran: string;
  jenjang: JenjangType;
  nomor_hp?: string;
  status: 'Aktif' | 'Nonaktif';
}

export interface Kelas {
  id: string;
  nama_kelas: string;
  jenjang: 'SMP' | 'SMA';
  status: 'Aktif' | 'Nonaktif';
}

export interface Ruangan {
  id: string;
  nama_ruangan: string;
  status: 'Tersedia' | 'Sedang Digunakan' | 'Pemeliharaan' | 'Aktif';
  keterangan: string;
  kapasitas?: number;
  fasilitas?: string[];
  warna?: string; // Hex or tailwind color code
}

export type HariType = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';

export type JamPembelajaran = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type StatusJadwal = 'Terjadwal' | 'Selesai' | 'Dibatalkan';

export interface Jadwal {
  id: string;
  tanggal: string; // YYYY-MM-DD
  hari: HariType;
  jam_ke: JamPembelajaran;
  guru_id: string;
  mata_pelajaran: string;
  kelas_id: string;
  ruangan_id: string;
  keperluan?: string;
  status: StatusJadwal;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export type AuditActionType =
  | 'TAMBAH_JADWAL'
  | 'UBAH_JADWAL'
  | 'HAPUS_JADWAL'
  | 'BATAL_JADWAL'
  | 'SELESAI_JADWAL'
  | 'TAMBAH_GURU'
  | 'UBAH_GURU'
  | 'HAPUS_GURU'
  | 'TAMBAH_KELAS'
  | 'UBAH_KELAS'
  | 'HAPUS_KELAS'
  | 'TAMBAH_RUANGAN'
  | 'UBAH_RUANGAN'
  | 'HAPUS_RUANGAN'
  | 'RESET_DATA'
  | 'IMPORT_DATA'
  | 'SYNC_SHEETS';

export interface AuditLog {
  id: string;
  action: AuditActionType;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  target_type: 'Jadwal' | 'Guru' | 'Kelas' | 'Ruangan' | 'System' | 'Sheets';
  target_id?: string;
  details: string;
  timestamp: string;
}

export interface AppSettings {
  namaAplikasi: string;
  namaSekolah: string;
  alamatSekolah: string;
  tahunPelajaran: string;
  semester: string;
  kepalaSekolah: string;
  nipKepalaSekolah: string;
  koordinatorLab: string;
  nipKoordinatorLab: string;
  googleSheetUrl: string;
  googleSheetId: string;
  googleSheetsId?: string;
  googleSheetsWebhookUrl?: string;
  autoSyncSheets?: boolean;
  autoRefreshTVSeconds: number;
}
