
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Camera } from 'lucide-react';
import { OcrResult } from './types';
import CameraCapture from './scanner/CameraCapture';
import ImagePreview from './scanner/ImagePreview';
import ScannerPlaceholder from './scanner/ScannerPlaceholder';
import ProcessingIndicator from './scanner/ProcessingIndicator';
import { usePrescriptionScanner } from './scanner/usePrescriptionScanner';

interface PrescriptionScannerProps {
  onScanComplete: (result: OcrResult, imageData: string) => void;
}

const PrescriptionScanner: React.FC<PrescriptionScannerProps> = ({ onScanComplete }) => {
  const { 
    isOpen, 
    setIsOpen, 
    cameraActive, 
    imagePreview, 
    isProcessing,
    videoRef,
    fileInputRef,
    initCamera,
    stopCamera,
    captureImage,
    handleFileUpload,
    handleOpenDialog,
    handleCloseDialog,
    triggerFileUpload
  } = usePrescriptionScanner(onScanComplete);

  return (
    <>
      <Button 
        onClick={handleOpenDialog} 
        className="w-full flex items-center gap-2"
        variant="outline"
      >
        <Camera size={20} />
        Scanner une ordonnance
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scanner votre ordonnance</DialogTitle>
            <DialogDescription>
              {isProcessing ? 'Analyse de l\'ordonnance en cours...' : 
                'Prenez en photo votre ordonnance ou importez une image'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center p-2 space-y-4">
            {isProcessing ? (
              <ProcessingIndicator />
            ) : cameraActive && !imagePreview ? (
              <CameraCapture 
                videoRef={videoRef} 
                onCapture={captureImage}
                onClose={stopCamera}
              />
            ) : imagePreview ? (
              <ImagePreview imageUrl={imagePreview} />
            ) : (
              <ScannerPlaceholder 
                onInitCamera={initCamera}
                onTriggerFileUpload={triggerFileUpload}
                fileInputRef={fileInputRef}
                onFileChange={handleFileUpload}
              />
            )}
          </div>
          
          <DialogFooter className="flex justify-end">
            {!isProcessing && (
              <Button variant="outline" onClick={handleCloseDialog}>
                Annuler
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PrescriptionScanner;
