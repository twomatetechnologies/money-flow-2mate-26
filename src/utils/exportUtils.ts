
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

export const exportToExcel = (data: any[], filename: string) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  saveAs(blob, `${filename}.xlsx`);
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

export const downloadSampleExcel = (headers: string[], sampleData: any[], filename: string) => {
  const ws = XLSX.utils.json_to_sheet([
    headers.reduce((obj, header) => ({ ...obj, [header]: header }), {}),
    ...sampleData
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sample");
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  saveAs(blob, `sample_${filename}.xlsx`);
};

export const importFromFile = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          throw new Error("Failed to read file");
        }
        
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsBinaryString(file);
  });
};
