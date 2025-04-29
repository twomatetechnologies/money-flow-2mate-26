
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PolicyDocumentUploadProps {
  documents: string[];
  onDocumentsChange: (documents: string[]) => void;
}

const PolicyDocumentUpload: React.FC<PolicyDocumentUploadProps> = ({
  documents = [],
  onDocumentsChange,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    const file = e.target.files[0];
    
    // Simulating file upload with setTimeout (in a real app, this would be an API call)
    setTimeout(() => {
      // Create a fake URL for the uploaded file
      const fakeUrl = `document-${Date.now()}-${file.name}`;
      const updatedDocuments = [...documents, fakeUrl];
      
      onDocumentsChange(updatedDocuments);
      setIsUploading(false);
      
      toast({
        title: "Document uploaded",
        description: `${file.name} has been uploaded successfully.`
      });
      
      // Reset the input
      e.target.value = '';
    }, 1000);
  };

  const removeDocument = (index: number) => {
    const updatedDocuments = [...documents];
    updatedDocuments.splice(index, 1);
    onDocumentsChange(updatedDocuments);
    
    toast({
      title: "Document removed",
      description: "The document has been removed successfully."
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Input
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          disabled={isUploading}
          className="max-w-xs"
        />
        <Button 
          variant="outline" 
          size="icon" 
          disabled={isUploading}
          onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
        >
          <Upload className="h-4 w-4" />
        </Button>
      </div>
      
      {documents.length > 0 && (
        <div className="mt-2">
          <p className="text-sm font-medium mb-2">Uploaded documents:</p>
          <ul className="space-y-2">
            {documents.map((doc, index) => (
              <li key={index} className="flex items-center justify-between bg-muted/30 p-2 rounded-md">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span className="text-sm truncate max-w-[200px]">
                    {doc.split('-').slice(2).join('-')}
                  </span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeDocument(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PolicyDocumentUpload;
