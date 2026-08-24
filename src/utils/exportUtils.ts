import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { AppSettings, Guru, Jadwal, Kelas, Ruangan } from '../types';

export function exportJadwalToExcel(
  jadwalList: Jadwal[],
  guruList: Guru[],
  kelasList: Kelas[],
  ruanganList: Ruangan[],
  title = 'Jadwal_Penggunaan_Ruangan_Multimedia'
) {
  const guruMap = new Map(guruList.map((g) => [g.id, g.nama_guru]));
  const kelasMap = new Map(kelasList.map((k) => [k.id, k.nama_kelas]));
  const ruanganMap = new Map(ruanganList.map((r) => [r.id, r.nama_ruangan]));

  const rows = jadwalList.map((j, index) => ({
    No: index + 1,
    Tanggal: j.tanggal,
    Hari: j.hari,
    'Jam Pembelajaran': `Jam ke-${j.jam_ke}`,
    Ruangan: ruanganMap.get(j.ruangan_id) || j.ruangan_id,
    'Nama Guru': guruMap.get(j.guru_id) || j.guru_id,
    'Mata Pelajaran': j.mata_pelajaran,
    Kelas: kelasMap.get(j.kelas_id) || j.kelas_id,
    'Keperluan / Keterangan': j.keperluan || '-',
    Status: j.status,
    'Dibuat Oleh': j.created_by_name || 'System',
    'Tanggal Input': new Date(j.created_at).toLocaleDateString('id-ID'),
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Jadwal');

  // Auto-size columns
  const maxWidths = [
    { wch: 5 },
    { wch: 12 },
    { wch: 10 },
    { wch: 16 },
    { wch: 22 },
    { wch: 28 },
    { wch: 28 },
    { wch: 10 },
    { wch: 35 },
    { wch: 12 },
    { wch: 20 },
    { wch: 14 },
  ];
  worksheet['!cols'] = maxWidths;

  XLSX.writeFile(workbook, `${title}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportGuruToExcel(guruList: Guru[], title = 'Database_Guru_Albashiroh') {
  const rows = guruList.map((g, idx) => ({
    No: idx + 1,
    'ID Guru': g.id,
    'Nama Lengkap Guru': g.nama_guru,
    'NIP / NUPTK': g.nip || '-',
    'Mata Pelajaran': g.mata_pelajaran,
    Jenjang: g.jenjang,
    'Nomor HP / WhatsApp': g.nomor_hp || '-',
    Status: g.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Guru');
  XLSX.writeFile(workbook, `${title}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportJadwalToPDF(
  jadwalList: Jadwal[],
  guruList: Guru[],
  kelasList: Kelas[],
  ruanganList: Ruangan[],
  settings: AppSettings,
  filterInfo = 'Semua Periode'
) {
  const doc = new jsPDF('landscape', 'pt', 'a4');
  const guruMap = new Map(guruList.map((g) => [g.id, g.nama_guru]));
  const kelasMap = new Map(kelasList.map((k) => [k.id, k.nama_kelas]));
  const ruanganMap = new Map(ruanganList.map((r) => [r.id, r.nama_ruangan]));

  // Header Kop Surat
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.namaSekolah.toUpperCase(), 420, 40, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.namaAplikasi.toUpperCase(), 420, 58, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${settings.alamatSekolah} | Tahun Pelajaran: ${settings.tahunPelajaran} (${settings.semester})`, 420, 72, {
    align: 'center',
  });

  // Divider line
  doc.setLineWidth(1.5);
  doc.setDrawColor(30, 41, 59);
  doc.line(40, 80, 800, 800);
  doc.line(40, 80, 800, 80);

  // Subtitle / Filter info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`LAPORAN PENGGUNAAN RUANGAN MULTIMEDIA`, 40, 98);
  doc.setFont('helvetica', 'normal');
  doc.text(`Filter / Periode: ${filterInfo} | Total Data: ${jadwalList.length} entri`, 40, 112);

  const tableData = jadwalList.map((j, i) => [
    i + 1,
    j.tanggal,
    j.hari,
    `Jam ke-${j.jam_ke}`,
    ruanganMap.get(j.ruangan_id) || j.ruangan_id,
    guruMap.get(j.guru_id) || j.guru_id,
    j.mata_pelajaran,
    kelasMap.get(j.kelas_id) || j.kelas_id,
    j.keperluan || '-',
    j.status,
  ]);

  // @ts-expect-error jsPDF autotable call
  doc.autoTable({
    startY: 122,
    head: [['No', 'Tanggal', 'Hari', 'Jam', 'Ruangan', 'Guru', 'Mata Pelajaran', 'Kelas', 'Keperluan', 'Status']],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 4,
      valign: 'middle',
    },
    headStyles: {
      fillColor: [15, 23, 42], // slate-900
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 25, halign: 'center' },
      1: { cellWidth: 55 },
      2: { cellWidth: 45 },
      3: { cellWidth: 45 },
      4: { cellWidth: 85 },
      5: { cellWidth: 110 },
      6: { cellWidth: 100 },
      7: { cellWidth: 40, halign: 'center' },
      8: { cellWidth: 160 },
      9: { cellWidth: 55, halign: 'center' },
    },
  });

  // @ts-expect-error autotable finalY
  const finalY = doc.lastAutoTable?.finalY || 400;

  // Signatures
  const pageHeight = doc.internal.pageSize.height;
  let signatureY = finalY + 30;
  if (signatureY + 80 > pageHeight) {
    doc.addPage();
    signatureY = 40;
  }

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  doc.setFontSize(9);
  doc.text(`Turen, ${currentDate}`, 650, signatureY);
  doc.text(`Mengetahui,`, 100, signatureY);
  doc.text(`Kepala Sekolah`, 100, signatureY + 14);
  doc.text(`Koordinator Multimedia & Lab`, 650, signatureY + 14);

  doc.setFont('helvetica', 'bold');
  doc.text(settings.kepalaSekolah, 100, signatureY + 65);
  doc.text(settings.koordinatorLab, 650, signatureY + 65);

  doc.setFont('helvetica', 'normal');
  doc.text(`NIP. ${settings.nipKepalaSekolah}`, 100, signatureY + 76);
  doc.text(`NIP. ${settings.nipKoordinatorLab}`, 650, signatureY + 76);

  doc.save(`Laporan_Jadwal_Multimedia_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// Generate CSV string suitable for Google Sheets paste or upload
export function generateGoogleSheetsCsv(
  jadwalList: Jadwal[],
  guruList: Guru[],
  kelasList: Kelas[],
  ruanganList: Ruangan[]
): string {
  const guruMap = new Map(guruList.map((g) => [g.id, g.nama_guru]));
  const kelasMap = new Map(kelasList.map((k) => [k.id, k.nama_kelas]));
  const ruanganMap = new Map(ruanganList.map((r) => [r.id, r.nama_ruangan]));

  const headers = ['ID', 'Tanggal', 'Hari', 'Jam Ke', 'Ruangan', 'Guru', 'Mata Pelajaran', 'Kelas', 'Keperluan', 'Status', 'Created By', 'Created At'];
  const rows = jadwalList.map((j) => [
    j.id,
    j.tanggal,
    j.hari,
    j.jam_ke,
    `"${(ruanganMap.get(j.ruangan_id) || j.ruangan_id).replace(/"/g, '""')}"`,
    `"${(guruMap.get(j.guru_id) || j.guru_id).replace(/"/g, '""')}"`,
    `"${j.mata_pelajaran.replace(/"/g, '""')}"`,
    `"${(kelasMap.get(j.kelas_id) || j.kelas_id).replace(/"/g, '""')}"`,
    `"${(j.keperluan || '').replace(/"/g, '""')}"`,
    j.status,
    `"${(j.created_by_name || '').replace(/"/g, '""')}"`,
    j.created_at,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
