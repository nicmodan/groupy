import * as XLSX from 'xlsx';
import { groupByNumber } from './shuffle';

export function exportGroupsToExcel(students, portalName = 'Groups', questions = []) {
  const wb = XLSX.utils.book_new();

  // ── Sheet 1: All Students ──
  const questionHeaders = questions.map((q, i) => `Q${i + 1}: ${q.text}`);
  const allHeaders = ['#', 'Full Name', 'Email', 'Student ID', ...questionHeaders, 'Group'];

  const allRows = students.map((s, i) => [
    i + 1,
    s.name,
    s.email,
    s.studentId || '',
    ...questions.map(q => s.answers?.[q.id] || ''),
    s.groupNumber ? `Group ${s.groupNumber}` : 'Unassigned',
  ]);

  const ws1 = XLSX.utils.aoa_to_sheet([allHeaders, ...allRows]);
  ws1['!cols'] = [
    { wch: 5 },
    { wch: 25 },
    { wch: 30 },
    { wch: 16 },
    ...questions.map(() => ({ wch: 22 })),
    { wch: 12 },
  ];

  // Style header row
  const headerRange = XLSX.utils.decode_range(ws1['!ref']);
  for (let c = headerRange.s.c; c <= headerRange.e.c; c++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c });
    if (!ws1[cellRef]) continue;
    ws1[cellRef].s = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: 'E85D26' } },
      alignment: { horizontal: 'center' },
    };
  }

  XLSX.utils.book_append_sheet(wb, ws1, 'All Students');

  // ── Sheet 2: By Group ──
  const groups = groupByNumber(students);
  const groupRows = [['Group', 'Full Name', 'Email', 'Student ID', ...questionHeaders]];

  Object.entries(groups)
    .sort(([a], [b]) => Number(a) - Number(b))
    .forEach(([g, members]) => {
      members.forEach((s, i) => {
        groupRows.push([
          i === 0 ? `Group ${g}` : '',
          s.name,
          s.email,
          s.studentId || '',
          ...questions.map(q => s.answers?.[q.id] || ''),
        ]);
      });
      groupRows.push([]); // empty row between groups
    });

  const ws2 = XLSX.utils.aoa_to_sheet(groupRows);
  ws2['!cols'] = [
    { wch: 10 },
    { wch: 25 },
    { wch: 30 },
    { wch: 16 },
    ...questions.map(() => ({ wch: 22 })),
  ];
  XLSX.utils.book_append_sheet(wb, ws2, 'By Group');

  // ── Sheet 3: Summary ──
  const summaryRows = [
    ['Groupify Export Summary'],
    [],
    ['Portal', portalName],
    ['Export Date', new Date().toLocaleString()],
    ['Total Students', students.length],
    ['Total Groups', Object.keys(groups).length],
    [],
    ['Group', 'Student Count'],
    ...Object.entries(groups)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([g, members]) => [`Group ${g}`, members.length]),
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(summaryRows);
  ws3['!cols'] = [{ wch: 20 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, ws3, 'Summary');

  const fileName = `Groupify_${portalName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
  return fileName;
}
