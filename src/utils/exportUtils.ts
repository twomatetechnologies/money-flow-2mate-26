
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

export const exportToCSV = (data: any[], filename: string) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  const excelBuffer = XLSX.write(wb, { bookType: 'csv', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}.csv`);
};

export const downloadSampleCSV = (headers: string[], sampleData: any[], filename: string) => {
  const ws = XLSX.utils.json_to_sheet([
    headers.reduce((obj, header) => ({ ...obj, [header]: header }), {}),
    ...sampleData
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sample");
  const excelBuffer = XLSX.write(wb, { bookType: 'csv', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `sample_${filename}.csv`);
};
