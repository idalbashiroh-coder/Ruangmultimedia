import { Guru, HariType, Jadwal, JamPembelajaran, Kelas, Ruangan, StatusJadwal } from '../types';
import { getHariNameFromDate } from '../data/initialData';

/**
 * Cleanly extract Sheet ID, GID, and Web Published URLs from any string or URL
 */
export function extractGoogleSheetDetails(rawInput: string | null | undefined): {
  sheetId: string;
  gid?: string;
  sheetName?: string;
  isWebPublished: boolean;
  publishedCsvUrl?: string;
} {
  const str = String(rawInput || '').trim();
  if (!str) {
    return { sheetId: '', isWebPublished: false };
  }

  // 1. Check if it's a published-to-web 2PACX URL
  if (str.includes('/spreadsheets/d/e/2PACX-') || (str.includes('/pub') && str.includes('output=csv'))) {
    const publishedCsvUrl = str.includes('output=csv')
      ? str
      : str.replace(/\/pub(\?.*)?$/, '/pub?output=csv');
    return {
      sheetId: '',
      isWebPublished: true,
      publishedCsvUrl,
    };
  }

  // 2. Extract standard Google Sheet ID
  const sheetIdMatch = str.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  let sheetId = sheetIdMatch ? sheetIdMatch[1] : str;

  // If user pasted a dirty string with params like "1q5bPQ.../edit#gid=0"
  if (sheetId.includes('/')) {
    sheetId = sheetId.split('/')[0];
  }
  if (sheetId.includes('?')) {
    sheetId = sheetId.split('?')[0];
  }
  if (sheetId.includes('#')) {
    sheetId = sheetId.split('#')[0];
  }

  // Extract gid (sheet tab id)
  const gidMatch = str.match(/[?&#]gid=([0-9]+)/);
  const gid = gidMatch ? gidMatch[1] : undefined;

  // Extract sheet name if provided in URL (e.g. &sheet=Jadwal_Multimedia)
  const sheetMatch = str.match(/[?&#]sheet=([^&#]+)/);
  const sheetName = sheetMatch ? decodeURIComponent(sheetMatch[1]) : undefined;

  return {
    sheetId,
    gid,
    sheetName,
    isWebPublished: false,
  };
}

/**
 * Robust date normalizer that handles:
 * - YYYY-MM-DD (e.g. 2026-08-24)
 * - DD/MM/YYYY or DD-MM-YYYY (e.g. 24/08/2026, 24-08-2026)
 * - MM/DD/YYYY (e.g. 08/24/2026)
 * - YYYY/MM/DD (e.g. 2026/08/24)
 * - GViz Date string: "Date(2026,7,24)" or "Date(2026, 7, 24, 0, 0, 0)"
 * - Indonesian text dates (e.g. "24 Agustus 2026", "Senin, 24 Agustus 2026")
 * - Google Sheets serial date number (e.g. 46258)
 */
export function normalizeDateToYMD(rawDate: string | number | Date | null | undefined): string {
  if (!rawDate) return '';

  if (rawDate instanceof Date) {
    if (isNaN(rawDate.getTime())) return '';
    const y = rawDate.getFullYear();
    const m = String(rawDate.getMonth() + 1).padStart(2, '0');
    const d = String(rawDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // If number or numeric string (Google Sheets serial date)
  if (typeof rawDate === 'number' || /^\d{5}$/.test(String(rawDate).trim())) {
    const serial = Number(rawDate);
    if (!isNaN(serial) && serial > 30000 && serial < 80000) {
      // Excel/Google Sheets serial date: days since 1899-12-30
      const utcDays = serial - 25569;
      const utcValue = utcDays * 86400 * 1000;
      const dateObj = new Date(utcValue);
      const y = dateObj.getUTCFullYear();
      const m = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
      const d = String(dateObj.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }

  let str = String(rawDate).trim();
  if (!str) return '';

  // GViz format: "Date(2026,7,24)" (Month is 0-indexed in GViz: 0 = Jan, 7 = Aug)
  const gvizMatch = str.match(/Date\((\d{4}),\s*(\d{1,2}),\s*(\d{1,2})/);
  if (gvizMatch) {
    const y = gvizMatch[1];
    const m = String(parseInt(gvizMatch[2], 10) + 1).padStart(2, '0');
    const d = String(parseInt(gvizMatch[3], 10)).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // Standard ISO YYYY-MM-DD
  const isoMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (isoMatch) {
    const y = isoMatch[1];
    const m = String(parseInt(isoMatch[2], 10)).padStart(2, '0');
    const d = String(parseInt(isoMatch[3], 10)).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // Indonesian / European DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (dmyMatch) {
    const d = String(parseInt(dmyMatch[1], 10)).padStart(2, '0');
    const m = String(parseInt(dmyMatch[2], 10)).padStart(2, '0');
    const y = dmyMatch[3];
    return `${y}-${m}-${d}`;
  }

  // Month names in Indonesian / English
  const monthMap: Record<string, string> = {
    jan: '01', januari: '01', january: '01',
    feb: '02', februari: '02', february: '02',
    mar: '03', maret: '03', march: '03',
    apr: '04', april: '04',
    mei: '05', may: '05',
    jun: '06', juni: '06', june: '06',
    jul: '07', juli: '07', july: '07',
    agu: '08', agust: '08', agustus: '08', aug: '08', august: '08',
    sep: '09', september: '09',
    okt: '10', oktober: '10', oct: '10', october: '10',
    nov: '11', november: '11',
    des: '12', desember: '12', dec: '12', december: '12',
  };

  const textDateMatch = str.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (textDateMatch) {
    const d = String(parseInt(textDateMatch[1], 10)).padStart(2, '0');
    const monthName = textDateMatch[2].toLowerCase();
    const m = monthMap[monthName] || monthMap[monthName.substring(0, 3)] || '01';
    const y = textDateMatch[3];
    return `${y}-${m}-${d}`;
  }

  // Try standard JS Date parsing fallback
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 2000) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return str;
}

/**
 * Parse CSV text into 2D string array handling quotes and multi-lines
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
 * Parse Google Visualization (GViz) JSON table response to 2D string array
 */
export function parseGVizResponseToRows(gvizData: any): any[][] {
  if (!gvizData || !gvizData.table) return [];

  const cols = gvizData.table.cols || [];
  const rows = gvizData.table.rows || [];

  const result: any[][] = [];

  // Check if cols contain real user-defined labels (not just empty or default column letters)
  const hasRealColLabels = cols.some(
    (col: any) => col && typeof col.label === 'string' && col.label.trim().length > 0
  );

  if (hasRealColLabels) {
    const headerRow: string[] = cols.map((col: any) =>
      col && col.label ? String(col.label).trim() : ''
    );
    result.push(headerRow);
  }

  // Data rows
  rows.forEach((r: any) => {
    if (!r || !Array.isArray(r.c)) return;
    const rowValues = r.c.map((cell: any) => {
      if (!cell) return '';
      // If formatted value exists and is not empty, prefer it (e.g. "24/08/2026", "07:00", etc.)
      if (cell.f !== undefined && cell.f !== null && String(cell.f).trim() !== '') {
        return String(cell.f).trim();
      }
      if (cell.v !== undefined && cell.v !== null) {
        return String(cell.v).trim();
      }
      return '';
    });

    if (rowValues.some((v: string) => v !== '')) {
      result.push(rowValues);
    }
  });

  return result;
}

/**
 * Strategy 1: Fetch via GViz JSONP Script Tag Injection (Zero CORS blocks in any browser)
 */
export function fetchGoogleSheetGVizJsonp(
  sheetId: string,
  gid?: string,
  sheetName?: string,
  timeoutMs: number = 7000
): Promise<any[][]> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return reject(new Error('JSONP requires DOM environment'));
    }
    if (!sheetId) {
      return reject(new Error('Sheet ID tidak tersedia'));
    }

    const callbackName = `__gviz_cb_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const script = document.createElement('script');
    let timeoutTimer: any = null;

    const cleanup = () => {
      if (timeoutTimer) clearTimeout(timeoutTimer);
      if (script.parentNode) script.parentNode.removeChild(script);
      try {
        delete (window as any)[callbackName];
      } catch {
        (window as any)[callbackName] = undefined;
      }
    };

    (window as any)[callbackName] = (response: any) => {
      cleanup();
      if (response && response.table) {
        const rows = parseGVizResponseToRows(response);
        resolve(rows);
      } else if (response && response.status === 'error') {
        const errMsg =
          response.errors?.[0]?.detailed_message || response.errors?.[0]?.message || 'GViz error';
        reject(new Error(errMsg));
      } else {
        reject(new Error('Format GViz tidak dikenali'));
      }
    };

    timeoutTimer = setTimeout(() => {
      cleanup();
      reject(new Error('Koneksi timeout ke Google Sheets (JSONP).'));
    }, timeoutMs);

    script.onerror = () => {
      cleanup();
      reject(new Error('Gagal memuat script GViz Google Sheets (Network Error).'));
    };

    const gidParam = gid ? `&gid=${gid}` : '';
    const sheetParam = sheetName ? `&sheet=${encodeURIComponent(sheetName)}` : '';
    script.src = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(
      sheetId
    )}/gviz/tq?tqx=responseHandler:${callbackName}${gidParam}${sheetParam}&tq=&_t=${Date.now()}`;

    document.head.appendChild(script);
  });
}

/**
 * Strategy 2: Fetch via GViz JSON Direct Fetch
 */
export async function fetchGoogleSheetGVizDirect(
  sheetId: string,
  gid?: string,
  sheetName?: string
): Promise<any[][]> {
  const gidParam = gid ? `&gid=${gid}` : '';
  const sheetParam = sheetName ? `&sheet=${encodeURIComponent(sheetName)}` : '';
  const url = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(
    sheetId
  )}/gviz/tq?tqx=out:json${gidParam}${sheetParam}&tq=&_t=${Date.now()}`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();

  const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]+)\);/);
  if (!jsonMatch) {
    throw new Error('Format respon GViz tidak valid');
  }

  const json = JSON.parse(jsonMatch[1]);
  if (!json.table) {
    throw new Error('Table data kosong pada response Google Sheets');
  }

  return parseGVizResponseToRows(json);
}

/**
 * Strategy 3: Fetch via Google Apps Script Webhook GET
 */
export async function fetchGoogleSheetViaWebhook(webhookUrl: string): Promise<any[][]> {
  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    throw new Error('Webhook URL tidak valid');
  }

  const cleanUrl =
    webhookUrl + (webhookUrl.includes('?') ? '&' : '?') + 'action=GET_ALL&_t=' + Date.now();
  const res = await fetch(cleanUrl, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();

  if (Array.isArray(json.data)) {
    return json.data;
  }
  if (Array.isArray(json)) {
    return json;
  }
  throw new Error('Webhook tidak mengembalikan array data');
}

/**
 * Strategy 4: Fetch via Published CSV or Direct CSV Export
 */
export async function fetchGoogleSheetCsv(url: string): Promise<any[][]> {
  const cleanUrl = url + (url.includes('?') ? '&' : '?') + '_t=' + Date.now();
  const res = await fetch(cleanUrl, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  if (text.includes('<!DOCTYPE html>') || text.includes('<html')) {
    throw new Error('Respon berupa HTML, bukan CSV');
  }
  return parseCSV(text);
}

/**
 * Strategy 5: Fetch via Public CORS Proxy Fallback
 */
export async function fetchGoogleSheetViaCorsProxy(targetUrl: string): Promise<any[][]> {
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
    targetUrl + (targetUrl.includes('?') ? '&' : '?') + '_t=' + Date.now()
  )}`;
  const res = await fetch(proxyUrl, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Proxy HTTP ${res.status}`);
  const text = await res.text();

  if (text.includes('google.visualization.Query.setResponse(')) {
    const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]+)\);/);
    if (jsonMatch) {
      const json = JSON.parse(jsonMatch[1]);
      return parseGVizResponseToRows(json);
    }
  }

  if (text.includes('<!DOCTYPE html>') || text.includes('<html')) {
    throw new Error('Proxy respon HTML');
  }

  return parseCSV(text);
}

/**
 * Candidate sheet names to search when reading Google Spreadsheet
 */
const KNOWN_SHEET_CANDIDATES = [
  'Jadwal_Multimedia',
  'Jadwal',
  'Jadwal Multimedia',
  '', // default active tab
  'Sheet1',
  'Sheet 1',
  'Peminjaman',
  'Data_Jadwal',
  'Respon Formulir 1',
  'Form Responses 1',
];

/**
 * Universal Multi-Strategy Fetcher for Google Sheets Data with Tab Scanning
 */
export async function fetchAllGoogleSheetRawRows(
  sheetInput: string,
  webhookUrl?: string
): Promise<{ rows: any[][]; source: string }> {
  const { sheetId, gid, sheetName, isWebPublished, publishedCsvUrl } =
    extractGoogleSheetDetails(sheetInput);

  const errors: string[] = [];

  // Strategy A: If published web CSV URL is detected
  if (isWebPublished && publishedCsvUrl) {
    try {
      const rows = await fetchGoogleSheetCsv(publishedCsvUrl);
      if (rows && rows.length > 0) {
        return { rows, source: 'Published Web CSV' };
      }
    } catch (e: any) {
      errors.push(`Published CSV: ${e.message}`);
    }
  }

  // Determine list of sheet tab candidates
  const tabsToTry: string[] = [];
  if (sheetName) {
    tabsToTry.push(sheetName);
  }
  for (const cand of KNOWN_SHEET_CANDIDATES) {
    if (!tabsToTry.includes(cand)) {
      tabsToTry.push(cand);
    }
  }

  let emptySheetFallback: { rows: any[][]; source: string } | null = null;

  // Strategy B: GViz JSONP Multi-Tab Scanning (Guaranteed zero CORS issues)
  if (sheetId) {
    for (const tab of tabsToTry) {
      try {
        const rows = await fetchGoogleSheetGVizJsonp(sheetId, gid, tab, 4000);
        const tabLabel = tab ? ` (${tab})` : '';
        // A valid table with data rows
        if (rows && rows.length >= 2) {
          return { rows, source: `Google Sheets GViz API${tabLabel}` };
        } else if (rows && rows.length === 1) {
          const firstRow = rows[0].map((c) => String(c || '').toLowerCase());
          const hasHeader = firstRow.some(
            (h) => h.includes('tanggal') || h.includes('ruang') || h.includes('guru') || h.includes('jadwal')
          );
          if (hasHeader) {
            // Valid schedule sheet with 0 bookings
            return { rows, source: `Google Sheets GViz API${tabLabel}` };
          }
          if (!emptySheetFallback) {
            emptySheetFallback = { rows, source: `Google Sheets GViz API${tabLabel}` };
          }
        }
      } catch (e: any) {
        errors.push(`GViz JSONP [${tab || 'default'}]: ${e.message}`);
      }
    }
  }

  // Strategy C: GViz Direct JSON Fetch Multi-Tab
  if (sheetId) {
    for (const tab of tabsToTry) {
      try {
        const rows = await fetchGoogleSheetGVizDirect(sheetId, gid, tab);
        const tabLabel = tab ? ` (${tab})` : '';
        if (rows && rows.length >= 2) {
          return { rows, source: `GViz Direct${tabLabel}` };
        } else if (rows && rows.length === 1) {
          const firstRow = rows[0].map((c) => String(c || '').toLowerCase());
          const hasHeader = firstRow.some(
            (h) => h.includes('tanggal') || h.includes('ruang') || h.includes('guru') || h.includes('jadwal')
          );
          if (hasHeader) {
            return { rows, source: `GViz Direct${tabLabel}` };
          }
          if (!emptySheetFallback) {
            emptySheetFallback = { rows, source: `GViz Direct${tabLabel}` };
          }
        }
      } catch (e: any) {
        errors.push(`GViz Direct [${tab || 'default'}]: ${e.message}`);
      }
    }
  }

  // Strategy D: Webhook GET (if configured)
  if (webhookUrl && webhookUrl.startsWith('http')) {
    try {
      const rows = await fetchGoogleSheetViaWebhook(webhookUrl);
      if (rows && rows.length >= 2) {
        return { rows, source: 'Apps Script Webhook' };
      } else if (rows && rows.length >= 1 && !emptySheetFallback) {
        emptySheetFallback = { rows, source: 'Apps Script Webhook' };
      }
    } catch (e: any) {
      errors.push(`Webhook GET: ${e.message}`);
    }
  }

  // Strategy E: Direct CSV Export
  if (sheetId) {
    for (const tab of tabsToTry.slice(0, 3)) {
      try {
        const gidParam = gid ? `&gid=${gid}` : '';
        const sheetParam = tab ? `&sheet=${encodeURIComponent(tab)}` : '';
        const csvExportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gidParam}${sheetParam}`;
        const rows = await fetchGoogleSheetCsv(csvExportUrl);
        if (rows && rows.length >= 2) {
          return { rows, source: `CSV Export${tab ? ` (${tab})` : ''}` };
        } else if (rows && rows.length >= 1 && !emptySheetFallback) {
          emptySheetFallback = { rows, source: `CSV Export${tab ? ` (${tab})` : ''}` };
        }
      } catch (e: any) {
        errors.push(`CSV Export [${tab}]: ${e.message}`);
      }
    }
  }

  // Strategy F: CORS Proxy fallback
  if (sheetId) {
    for (const tab of ['Jadwal_Multimedia', '']) {
      try {
        const sheetParam = tab ? `&sheet=${encodeURIComponent(tab)}` : '';
        const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json${sheetParam}`;
        const rows = await fetchGoogleSheetViaCorsProxy(gvizUrl);
        if (rows && rows.length >= 2) {
          return { rows, source: `CORS Proxy${tab ? ` (${tab})` : ''}` };
        } else if (rows && rows.length >= 1 && !emptySheetFallback) {
          emptySheetFallback = { rows, source: `CORS Proxy${tab ? ` (${tab})` : ''}` };
        }
      } catch (e: any) {
        errors.push(`Proxy [${tab}]: ${e.message}`);
      }
    }
  }

  // If sheet connected successfully and is empty (only header or 0 bookings)
  if (emptySheetFallback) {
    return emptySheetFallback;
  }

  throw new Error(`Tidak dapat membaca baris data jadwal dari Spreadsheet. Rincian: ${errors.slice(0, 3).join('; ')}`);
}

/**
 * Helper to match header column accurately
 */
function findBestHeaderIndex(
  headers: string[],
  exactList: string[],
  containsList: string[],
  excludeList: string[] = []
): number {
  // 1. Exact match
  for (const ex of exactList) {
    const idx = headers.findIndex((h) => h === ex);
    if (idx !== -1) return idx;
  }
  // 2. Contains match with exclusion filter
  for (const ct of containsList) {
    const idx = headers.findIndex(
      (h) => h.includes(ct) && !excludeList.some((ex) => h.includes(ex))
    );
    if (idx !== -1) return idx;
  }
  return -1;
}

/**
 * Parse raw Google Sheets rows (from CSV or JSON array) into typed Jadwal list
 */
export function parseGoogleSheetRowsToJadwal(
  rawRows: any[][],
  guruList: Guru[],
  kelasList: Kelas[],
  ruanganList: Ruangan[]
): Jadwal[] {
  if (!rawRows || rawRows.length === 0) {
    return [];
  }

  // Check if first row is a header
  let startIndex = 0;
  const firstRow = rawRows[0].map((cell) => String(cell || '').toLowerCase().trim());
  const hasHeaderKeywords = firstRow.some(
    (h) =>
      h.includes('tanggal') ||
      h.includes('tgl') ||
      h.includes('hari') ||
      h.includes('jam') ||
      h.includes('ruang') ||
      h.includes('guru') ||
      h.includes('mapel') ||
      h.includes('kelas') ||
      h.includes('status') ||
      h.includes('id')
  );

  let idIdx = -1;
  let tglIdx = -1;
  let hariIdx = -1;
  let jamIdx = -1;
  let ruangIdx = -1;
  let guruIdx = -1;
  let nipIdx = -1;
  let mapelIdx = -1;
  let kelasIdx = -1;
  let keperluanIdx = -1;
  let statusIdx = -1;
  let pembuatIdx = -1;

  if (hasHeaderKeywords) {
    startIndex = 1;
    // Accurate Header Mapping: Prevent 'waktu input' from overwriting 'tanggal'
    tglIdx = findBestHeaderIndex(
      firstRow,
      ['tanggal', 'tgl', 'date'],
      ['tanggal', 'tgl', 'date'],
      ['input', 'sesi', 'jam', 'waktu input', 'timestamp', 'created']
    );
    idIdx = findBestHeaderIndex(firstRow, ['id jadwal', 'id', 'kode'], ['id jadwal', 'id'], []);
    hariIdx = findBestHeaderIndex(firstRow, ['hari', 'day'], ['hari', 'day'], []);
    jamIdx = findBestHeaderIndex(
      firstRow,
      ['jam ke', 'jam', 'sesi'],
      ['jam ke', 'jam', 'sesi', 'period'],
      ['waktu', 'input', 'timestamp']
    );
    ruangIdx = findBestHeaderIndex(
      firstRow,
      ['ruangan', 'ruang', 'lab', 'tempat'],
      ['ruang', 'lab', 'room', 'tempat', 'lokasi'],
      []
    );
    guruIdx = findBestHeaderIndex(
      firstRow,
      ['guru pengajar', 'guru', 'pengajar', 'nama guru'],
      ['guru', 'pengajar', 'ustadz', 'teacher'],
      ['nip', 'niy', 'nuptk']
    );
    nipIdx = findBestHeaderIndex(firstRow, ['nip guru', 'nip', 'niy', 'nuptk'], ['nip', 'niy', 'nuptk'], []);
    mapelIdx = findBestHeaderIndex(
      firstRow,
      ['mata pelajaran', 'mapel', 'pelajaran'],
      ['mata pelajaran', 'mapel', 'pelajaran', 'subject', 'kegiatan'],
      []
    );
    kelasIdx = findBestHeaderIndex(
      firstRow,
      ['kelas / rombel', 'kelas', 'rombel'],
      ['kelas', 'rombel', 'tingkat', 'class'],
      []
    );
    keperluanIdx = findBestHeaderIndex(
      firstRow,
      ['keperluan', 'tujuan', 'materi'],
      ['keperluan', 'tujuan', 'materi', 'agenda', 'keterangan', 'deskripsi', 'catatan'],
      []
    );
    statusIdx = findBestHeaderIndex(firstRow, ['status'], ['status', 'kondisi'], []);
    pembuatIdx = findBestHeaderIndex(
      firstRow,
      ['dibuat oleh', 'pembuat', 'operator'],
      ['dibuat', 'pembuat', 'operator', 'created'],
      []
    );
  }

  const parsedJadwal: Jadwal[] = [];

  for (let r = startIndex; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.length === 0) continue;

    // Check if entire row is empty
    if (row.every((c) => c === null || c === undefined || String(c).trim() === '')) continue;

    // Retrieve fields with header-aware fallbacks
    // Standard layout:
    // [0]: Timestamp, [1]: ID, [2]: Tanggal, [3]: Hari, [4]: Jam, [5]: Waktu, [6]: Ruang, [7]: Guru, [8]: NIP, [9]: Mapel, [10]: Kelas, [11]: Keperluan, [12]: Status, [13]: Pembuat
    const getVal = (idx: number, fallbackPos: number) => {
      if (idx >= 0 && idx < row.length && row[idx] !== undefined && row[idx] !== null) {
        return String(row[idx]).trim();
      }
      if (fallbackPos >= 0 && fallbackPos < row.length && row[fallbackPos] !== undefined && row[fallbackPos] !== null) {
        return String(row[fallbackPos]).trim();
      }
      return '';
    };

    const rawTanggal = getVal(tglIdx, 2);
    const rawHari = getVal(hariIdx, 3);
    const rawJam = getVal(jamIdx, 4) || '1';
    const rawRuangan = getVal(ruangIdx, 6);
    const rawGuru = getVal(guruIdx, 7);
    const rawNip = getVal(nipIdx, 8);
    const rawMapel = getVal(mapelIdx, 9);
    const rawKelas = getVal(kelasIdx, 10);
    const rawKeperluan = getVal(keperluanIdx, 11);
    const rawStatus = getVal(statusIdx, 12) || 'Terjadwal';
    const rawPembuat = getVal(pembuatIdx, 13);

    // Normalize date
    const normalizedTanggal = normalizeDateToYMD(rawTanggal);
    if (!normalizedTanggal) {
      // If row has no valid date, skip
      continue;
    }

    const rawId = getVal(idIdx, 1) || `jdw_sheet_${normalizedTanggal}_${rawJam}_${r}`;

    // Resolve Ruangan ID
    let resolvedRuanganId = rawRuangan;
    const lowerRuang = rawRuangan.toLowerCase();
    const foundRuangan = ruanganList.find(
      (rg) =>
        rg.id.toLowerCase() === lowerRuang ||
        rg.nama_ruangan.toLowerCase() === lowerRuang ||
        rg.nama_ruangan.toLowerCase().includes(lowerRuang) ||
        (lowerRuang.length > 3 && lowerRuang.includes(rg.nama_ruangan.toLowerCase())) ||
        (lowerRuang.includes('lab') && rg.id === 'rng_labkom') ||
        (lowerRuang.includes('komputer') && rg.id === 'rng_labkom') ||
        (lowerRuang.includes('perpus') && rg.id === 'rng_perpus') ||
        (lowerRuang.includes('pustaka') && rg.id === 'rng_perpus') ||
        (lowerRuang.includes('audio') && rg.id === 'rng_audiovisual') ||
        (lowerRuang.includes('visual') && rg.id === 'rng_audiovisual') ||
        (lowerRuang.includes('studio') && rg.id === 'rng_studio_rekaman') ||
        (lowerRuang.includes('rekam') && rg.id === 'rng_studio_rekaman')
    );
    if (foundRuangan) {
      resolvedRuanganId = foundRuangan.id;
    } else if (lowerRuang.includes('lab') || lowerRuang.includes('komputer')) {
      resolvedRuanganId = 'rng_labkom';
    } else if (lowerRuang.includes('perpus') || lowerRuang.includes('pustaka')) {
      resolvedRuanganId = 'rng_perpus';
    } else if (lowerRuang.includes('audio') || lowerRuang.includes('visual')) {
      resolvedRuanganId = 'rng_audiovisual';
    } else if (lowerRuang.includes('studio') || lowerRuang.includes('rekam')) {
      resolvedRuanganId = 'rng_studio_rekaman';
    } else if (ruanganList.length > 0 && !resolvedRuanganId) {
      resolvedRuanganId = ruanganList[0].id;
    }

    // Resolve Guru ID
    let resolvedGuruId = rawGuru;
    const lowerGuru = rawGuru.toLowerCase();
    const foundGuru = guruList.find(
      (g) =>
        g.id.toLowerCase() === lowerGuru ||
        g.nama_guru.toLowerCase() === lowerGuru ||
        g.nama_guru.toLowerCase().includes(lowerGuru) ||
        (lowerGuru.length > 4 && lowerGuru.includes(g.nama_guru.toLowerCase())) ||
        (rawNip && g.nip && g.nip === rawNip)
    );
    if (foundGuru) {
      resolvedGuruId = foundGuru.id;
    }

    // Resolve Kelas ID
    let resolvedKelasId = rawKelas;
    const lowerKelas = rawKelas.toLowerCase().replace(/kelas\s*/i, '').trim();
    const foundKelas = kelasList.find(
      (k) =>
        k.id.toLowerCase() === rawKelas.toLowerCase() ||
        k.nama_kelas.toLowerCase() === rawKelas.toLowerCase() ||
        k.nama_kelas.toLowerCase().includes(lowerKelas) ||
        (lowerKelas.length > 1 && lowerKelas.includes(k.nama_kelas.toLowerCase()))
    );
    if (foundKelas) {
      resolvedKelasId = foundKelas.id;
    }

    // Parse Jam (supports single number like "1", "Jam 1", or multiple like "1, 2" or "1-2")
    const digits = rawJam.match(/\d+/g);
    const jamNumbers: JamPembelajaran[] = [];
    if (digits && digits.length > 0) {
      digits.forEach((dStr) => {
        const num = parseInt(dStr, 10);
        if (num >= 1 && num <= 8) {
          if (!jamNumbers.includes(num as JamPembelajaran)) {
            jamNumbers.push(num as JamPembelajaran);
          }
        }
      });
    }
    if (jamNumbers.length === 0) {
      jamNumbers.push(1);
    }

    // Parse Hari
    let resolvedHari: HariType = 'Senin';
    const validHari: HariType[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const matchedHari = validHari.find((h) => h.toLowerCase() === rawHari.toLowerCase());
    if (matchedHari) {
      resolvedHari = matchedHari;
    } else {
      resolvedHari = getHariNameFromDate(normalizedTanggal);
    }

    // Parse Status
    let resolvedStatus: StatusJadwal = 'Terjadwal';
    const lowerStatus = rawStatus.toLowerCase();
    if (lowerStatus.includes('selesai')) {
      resolvedStatus = 'Selesai';
    } else if (lowerStatus.includes('batal') || lowerStatus.includes('cancel')) {
      resolvedStatus = 'Dibatalkan';
    } else {
      resolvedStatus = 'Terjadwal';
    }

    // Add each jam period as a separate Jadwal item if multiple
    jamNumbers.forEach((jamNum) => {
      const itemSubId = jamNumbers.length > 1 ? `${rawId}_jam${jamNum}` : rawId;
      parsedJadwal.push({
        id: itemSubId,
        tanggal: normalizedTanggal,
        hari: resolvedHari,
        jam_ke: jamNum,
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
    });
  }

  return parsedJadwal;
}

/**
 * Parse Google Sheets CSV string to Jadwal[]
 */
export function parseGoogleSheetCsvToJadwal(
  csvText: string,
  guruList: Guru[],
  kelasList: Kelas[],
  ruanganList: Ruangan[]
): Jadwal[] {
  const rows = parseCSV(csvText);
  return parseGoogleSheetRowsToJadwal(rows, guruList, kelasList, ruanganList);
}
