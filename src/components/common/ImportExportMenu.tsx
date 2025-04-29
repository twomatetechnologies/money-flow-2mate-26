
import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { exportToCSV, exportToExcel, importFromFile } from "@/utils/exportUtils";
import { useToast } from "@/hooks/use-toast";

interface ImportExportMenuProps {
  data: any[];
  onImport: (data: any[]) => void;
  exportFilename: string;
  getExportData?: (data: any[]) => any[];
  getSampleData: () => { headers: string[], data: any[] };
  validateImportedData?: (data: any[]) => { valid: boolean, message?: string };
}

const ImportExportMenu: React.FC<ImportExportMenuProps> = ({
  data,
  onImport,
  exportFilename,
  getExportData,
  getSampleData,
  validateImportedData
}) => {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleExportCSV = () => {
    const exportData = getExportData ? getExportData(data) : data;
    exportToCSV(exportData, exportFilename);
    toast({
      title: "Export successful",
      description: `Data exported as ${exportFilename}.csv`
    });
  };

  const handleExportExcel = () => {
    const exportData = getExportData ? getExportData(data) : data;
    exportToExcel(exportData, exportFilename);
    toast({
      title: "Export successful",
      description: `Data exported as ${exportFilename}.xlsx`
    });
  };

  const handleDownloadSampleCSV = () => {
    const { headers, data: sampleData } = getSampleData();
    const filename = `sample_${exportFilename}`;
    
    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sample");
    XLSX.writeFile(wb, `${filename}.csv`);
    
    toast({
      title: "Sample file downloaded",
      description: `Sample data downloaded as ${filename}.csv`
    });
  };

  const handleDownloadSampleExcel = () => {
    const { headers, data: sampleData } = getSampleData();
    const filename = `sample_${exportFilename}`;
    
    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sample");
    XLSX.writeFile(wb, `${filename}.xlsx`);
    
    toast({
      title: "Sample file downloaded",
      description: `Sample data downloaded as ${filename}.xlsx`
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setImportError(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setImportError("Please select a file to import");
      return;
    }

    try {
      const importedData = await importFromFile(file);
      
      if (validateImportedData) {
        const validation = validateImportedData(importedData);
        if (!validation.valid) {
          setImportError(validation.message || "Invalid data format");
          return;
        }
      }
      
      onImport(importedData);
      setIsImportDialogOpen(false);
      setFile(null);
      
      toast({
        title: "Import successful",
        description: `Successfully imported ${importedData.length} items`
      });
    } catch (error) {
      console.error("Import error:", error);
      setImportError("Failed to import data. Please check the file format and try again.");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Import/Export</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsImportDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            <span>Import Data</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            <span>Export as CSV</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportExcel}>
            <Download className="h-4 w-4 mr-2" />
            <span>Export as Excel</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDownloadSampleCSV}>
            <FileText className="h-4 w-4 mr-2" />
            <span>Download Sample CSV</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownloadSampleExcel}>
            <FileText className="h-4 w-4 mr-2" />
            <span>Download Sample Excel</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Import Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Upload a CSV or Excel file with your data. You can download a sample file to see the required format.
              </p>
              <div className="flex gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={handleDownloadSampleCSV}>
                  <FileText className="h-4 w-4 mr-2" />
                  Sample CSV
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadSampleExcel}>
                  <FileText className="h-4 w-4 mr-2" />
                  Sample Excel
                </Button>
              </div>
            </div>

            <div>
              <Input 
                type="file" 
                accept=".csv,.xlsx,.xls" 
                onChange={handleFileChange} 
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Supported formats: .csv, .xlsx, .xls
              </p>
            </div>
            
            {importError && (
              <Alert variant="destructive">
                <AlertDescription>{importError}</AlertDescription>
              </Alert>
            )}
            
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={!file}>
                Import Data
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImportExportMenu;
