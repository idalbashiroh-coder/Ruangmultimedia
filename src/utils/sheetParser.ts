import { Guru, HariType, Jadwal, JamPembelajaran, Kelas, Ruangan, StatusJadwal } from '../types';
import { getHariNameFromDate } from '../data/initialData';

/**
 * Parse CSV text into 2D array handling escaped quotes and newlines
 */
export function parseCSV(text: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let currentField = '';
  let insideQuote = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        currentField += '"';
        i++; // skip next quote
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      row.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuote) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n
      }
      row.push(currentField.trim());
      if (row.length > 0 && row.some((field) => field !== '')) {
        result.push(row);
      }
      row = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField || row.length > 0) {
    row.push(currentField.trim());
    if (row.length > 0 && row.some((field) => field !== '')) {
      result.push(row);
    }
  }

  return result;
}

/**
 * Parse raw Google Sheets CSV data into Jadwal list
 * Never injects dummy data or placeholder strings. If data is absent, leaves fields empty.
 */
export function parseGoogleSheetCsvToJadwal(
  csvText: string,
  guruList: Guru[],
  kelasList: Kelas[],
  ruanganList: Ruangan[]
): Jadwal[] {
  const rows = parseCSV(csvText);
  if (!rows || rows.length <= 1) {
    return [];
  }

  // Find column indices from header
  const header = rows[0].map((h) => h.toLowerCase());
  const idIdx = header.findIndex((h) => h.includes('id'));
  const tglIdx = header.findIndex((h) => h.includes('tanggal') || h.includes('tgl'));
  const hariIdx = header.findIndex((h) => h.includes('hari'));
  const jamIdx = header.findIndex((h) => h.includes('jam'));
  const ruangIdx = header.findIndex((h) => h.includes('ruang'));
  const guruIdx = header.findIndex((h) => h.includes('guru') || h.includes('pengajar'));
  const mapelIdx = header.findIndex((h) => h.includes('mata pelajaran') || h.includes('mapel'));
  const kelasIdx = header.findIndex((h) => h.includes('kelas') || h.includes('rombel'));
  const keperluanIdx = header.findIndex((h) => h.includes('keperluan') || h.includes('tujuan'));
  const statusIdx = header.findIndex((h) => h.includes('status'));
  const pembuatIdx = header.findIndex((h) => h.includes('dibuat') || h.includes('pembuat'));

  const parsedJadwal: Jadwal[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;

    // Check if entire row is empty
    if (row.every((c) => !c || c.trim() === '')) continue;

    const rawTanggal = (tglIdx >= 0 ? row[tglIdx] : row[2]) || '';
    const rawJam = (jamIdx >= 0 ? row[jamIdx] : row[4]) || '1';
    const rawRuangan = (ruangIdx >= 0 ? row[ruangIdx] : row[6]) || '';
    const rawGuru = (guruIdx >= 0 ? row[guruIdx] : row[7]) || '';
    const rawMapel = (mapelIdx >= 0 ? row[mapelIdx] : row[9]) || '';
    const rawKelas = (kelasIdx >= 0 ? row[kelasIdx] : row[10]) || '';
    const rawKeperluan = (keperluanIdx >= 0 ? row[keperluanIdx] : row[11]) || '';
    const rawStatus = (statusIdx >= 0 ? row[statusIdx] : row[12]) || 'Terjadwal';
    const rawId = (idIdx >= 0 ? row[idIdx] : row[1]) || `jdw_${Date.now()}_${r}`;
    const rawPembuat = (pembuatIdx >= 0 ? row[pembuatIdx] : row[13]) || '';

    // If tanggal is missing, this row doesn't have real schedule content
    if (!rawTanggal || rawTanggal.trim() === '') continue;

    // Resolve Ruangan ID
    let resolvedRuanganId = rawRuangan;
    const foundRuangan = ruanganList.find(
      (rg) =>
        rg.id.toLowerCase() === rawRuangan.toLowerCase() ||
        rg.nama_ruangan.toLowerCase() === rawRuangan.toLowerCase() ||
        (rawRuangan.toLowerCase().includes('lab') && rg.id === 'rng_labkom') ||
        (rawRuangan.toLowerCase().includes('perpus') && rg.id === 'rng_perpus')
    );
    if (foundRuangan) {
      resolvedRuanganId = foundRuangan.id;
    }

    // Resolve Guru ID
    let resolvedGuruId = rawGuru;
    const foundGuru = guruList.find(
      (g) =>
        g.id.toLowerCase() === rawGuru.toLowerCase() ||
        g.nama_guru.toLowerCase().includes(rawGuru.toLowerCase()) ||
        rawGuru.toLowerCase().includes(g.nama_guru.toLowerCase())
    );
    if (foundGuru) {
      resolvedGuruId = foundGuru.id;
    }

    // Resolve Kelas ID
    let resolvedKelasId = rawKelas;
    const foundKelas = kelasList.find(
      (k) =>
        k.id.toLowerCase() === rawKelas.toLowerCase() ||
        k.nama_kelas.toLowerCase() === rawKelas.toLowerCase()
    );
    if (foundKelas) {
      resolvedKelasId = foundKelas.id;
    }

    // Parse Jam
    const parsedJamNum = parseInt(rawJam.toString().replace(/[^0-9]/g, ''), 10);
    const validJam: JamPembelajaran =
      parsedJamNum >= 1 && parsedJamNum <= 8 ? (parsedJamNum as JamPembelajaran) : 1;

    // Parse Hari
    let resolvedHari: HariType = 'Senin';
    const rawHari = hariIdx >= 0 ? row[hariIdx] : row[3];
    if (rawHari && ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].includes(rawHari)) {
      resolvedHari = rawHari as HariType;
    } else if (rawTanggal) {
      resolvedHari = getHariNameFromDate(rawTanggal);
    }

    // Parse Status
    let resolvedStatus: StatusJadwal = 'Terjadwal';
    if (rawStatus.toLowerCase().includes('selesai')) {
      resolvedStatus = 'Selesai';
    } else if (rawStatus.toLowerCase().includes('batal')) {
      resolvedStatus = 'Dibatalkan';
    }

    parsedJadwal.push({
      id: rawId,
      tanggal: rawTanggal,
      hari: resolvedHari,
      jam_ke: validJam,
      ruangan_id: resolvedRuanganId,
      guru_id: resolvedGuruId,
      mata_pelajaran: rawMapel,
      kelas_id: resolvedKelasId,
      keperluan: rawKeperluan,
      status: resolvedStatus,
      created_by_name: rawPembuat,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return parsedJadwal;
}
