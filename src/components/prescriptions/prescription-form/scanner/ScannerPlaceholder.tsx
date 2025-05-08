
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload } from 'lucide-react';

interface ScannerPlaceholderProps {
  onInitCamera: () => void;
  onTriggerFileUpload: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ScannerPlaceholder: React.FC<ScannerPlaceholderProps> = ({ 
  onInitCamera, 
  onTriggerFileUpload, 
  fileInputRef,
  onFileChange
}) => {
  return (
    <div className="w-full h-48 bg-muted/30 flex flex-col items-center justify-center rounded gap-6 p-4">
      <Camera size={48} className="text-muted-foreground/50" />
      <div className="flex gap-2">
        <Button onClick={onInitCamera} className="flex items-center gap-1">
          <Camera size={16} />
          Utiliser la caméra
        </Button>
        <Button onClick={onTriggerFileUpload} variant="outline" className="flex items-center gap-1">
          <Upload size={16} />
          Importer une image
        </Button>
        <input 
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
        />
      </div>
    </div>
  );
};

export default ScannerPlaceholder;
